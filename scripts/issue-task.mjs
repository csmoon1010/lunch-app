#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const TYPES = new Set(['feature', 'bug', 'refactor', 'chore', 'spike']);
const API = 'https://api.github.com';
const configPath = join(homedir(), '.config', 'issue-task.env');

function fail(message) {
  console.error(`오류: ${message}`);
  process.exitCode = 1;
}

function parseArgs(args) {
  const positionals = [];
  const options = new Map();
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }
    const key = arg.slice(2);
    if (['preview', 'done', 'undone'].includes(key)) {
      options.set(key, true);
    } else {
      const value = args[i + 1];
      if (!value || value.startsWith('--')) throw new Error(`${arg} 값이 필요합니다.`);
      const values = options.get(key) ?? [];
      values.push(value);
      options.set(key, values);
      i += 1;
    }
  }
  return { positionals, options };
}

function one(options, name, required = false) {
  const values = options.get(name) ?? [];
  if (values.length > 1) throw new Error(`--${name}은(는) 한 번만 지정할 수 있습니다.`);
  if (required && !values[0]) throw new Error(`--${name} 값이 필요합니다.`);
  return values[0];
}

const ACCEPTANCE_HEADINGS = new Set(['## Acceptance criteria', '## 수용 기준']);

function acceptanceCriteria(body) {
  const lines = body.split('\n');
  const heading = lines.findIndex(line => ACCEPTANCE_HEADINGS.has(line.trim()));
  if (heading < 0) return undefined;
  let end = heading + 1;
  while (end < lines.length && !lines[end].startsWith('## ')) end += 1;
  return lines.slice(heading, end).join('\n');
}

function windowsConfigIsOwnerOnly() {
  const script = `$acl = Get-Acl -LiteralPath $env:ISSUE_TASK_CONFIG; $rules = @($acl.Access | ForEach-Object { [pscustomobject]@{ identity = $_.IdentityReference.Value; rights = $_.FileSystemRights.ToString(); type = $_.AccessControlType.ToString(); inherited = $_.IsInherited } }); [pscustomobject]@{ owner = $acl.Owner; rules = $rules } | ConvertTo-Json -Compress -Depth 3`;
  const raw = execFileSync('powershell.exe', ['-NoLogo', '-NoProfile', '-NonInteractive', '-Command', script], {
    encoding: 'utf8',
    env: { ...process.env, ISSUE_TASK_CONFIG: configPath },
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  const acl = JSON.parse(raw);
  const [rule] = acl.rules;
  const rights = new Set(rule?.rights.split(',').map(right => right.trim()));
  return acl.rules.length === 1
    && rule.identity === acl.owner
    && rule.type === 'Allow'
    && !rule.inherited
    && rights.size === 3
    && rights.has('Read')
    && rights.has('Write')
    && rights.has('Synchronize');
}

async function loadConfig() {
  let stat;
  try {
    stat = await (await import('node:fs/promises')).stat(configPath);
  } catch {
    throw new Error(`설정 파일이 없습니다: ${configPath}`);
  }
  const hasOwnerOnlyPermissions = process.platform === 'win32'
    ? windowsConfigIsOwnerOnly()
    : (stat.mode & 0o777) === 0o600;
  if (!hasOwnerOnlyPermissions) {
    throw new Error(`설정 파일 권한이 600이 아닙니다 (${(stat.mode & 0o777).toString(8).padStart(3, '0')}). chmod 600으로 제한한 뒤 다시 실행하세요.`);
  }

  const raw = await readFile(configPath, 'utf8');
  const values = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^(GITHUB_TOKEN|GITHUB_REPOSITORY)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    values[match[1]] = value;
  }
  if (!values.GITHUB_TOKEN) throw new Error('설정 파일에 GITHUB_TOKEN이 없습니다.');
  if (!/^[\w.-]+\/[\w.-]+$/.test(values.GITHUB_REPOSITORY ?? '')) throw new Error('GITHUB_REPOSITORY는 owner/repository 형식이어야 합니다.');
  return { token: values.GITHUB_TOKEN, repo: values.GITHUB_REPOSITORY };
}

let credentials;
async function request(path, { method = 'GET', body } = {}) {
  if (!credentials) credentials = await loadConfig();
  const response = await fetch(`${API}/repos/${credentials.repo}${path}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${credentials.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = response.status === 204 ? '' : await response.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!response.ok) {
    const detail = typeof data === 'object' && data?.message ? data.message : `HTTP ${response.status}`;
    throw new Error(String(detail).replaceAll(credentials.token, '[숨김]'));
  }
  return data;
}

async function listAll(path) {
  const [base, search = ''] = path.split('?');
  const params = new URLSearchParams(search);
  const result = [];
  for (let page = 1; page <= 10; page += 1) {
    params.set('per_page', '100');
    params.set('page', String(page));
    const batch = await request(`${base}?${params}`);
    result.push(...batch);
    if (batch.length < 100) return result;
  }
  return result;
}

async function ensureLabel(name) {
  const labels = await listAll('/labels');
  if (labels.some(label => label.name.toLowerCase() === name.toLowerCase())) return;
  await request('/labels', { method: 'POST', body: { name, color: name.startsWith('type:') ? '1d76db' : 'fbca04' } });
}

async function updateLabels(issue, add, remove = []) {
  for (const label of add) await ensureLabel(label);
  const names = new Set(issue.labels.map(label => label.name));
  for (const label of remove) names.delete(label);
  for (const label of add) names.add(label);
  return request(`/issues/${issue.number}`, { method: 'PATCH', body: { labels: [...names] } });
}

function formatIssue(issue) {
  const labels = issue.labels.map(label => label.name).join(', ') || '라벨 없음';
  return `#${issue.number} ${issue.title}\n상태: ${issue.state} | 라벨: ${labels}\n${issue.html_url}`;
}

async function issueByNumber(value) {
  if (!/^\d+$/.test(value ?? '')) throw new Error('일감 번호를 지정하세요.');
  const issue = await request(`/issues/${value}`);
  if (issue.pull_request) throw new Error(`#${value}은(는) 이슈가 아니라 PR입니다.`);
  return issue;
}

function acceptanceBody(body, criteria) {
  if (!criteria.length) return body.trim();
  const lines = criteria.map(item => `- [ ] ${item}`);
  return `${body.trim()}\n\n## Acceptance criteria\n${lines.join('\n')}`.trim();
}

async function main() {
  const command = process.argv[2];
  const { positionals, options } = parseArgs(process.argv.slice(3));

  if (!command || command === 'help' || command === '--help') {
    console.log('사용법: issue-task.mjs <preflight|list|show|create|start|block|note|check|close|milestone> [옵션]\ncreate는 --preview로 확인한 뒤, 명시적 승인을 받은 동일 내용에 --confirm <미리보기 코드>를 붙여 등록합니다.');
    return;
  }

  if (command === 'preflight') {
    credentials = await loadConfig();
    const [repo, labels, milestones] = await Promise.all([
      request(''), request('/labels?per_page=100'), request('/milestones?state=all&per_page=100'),
    ]);
    if (repo.permissions?.push === false) throw new Error('저장소 쓰기 권한이 없습니다.');
    const writeAccess = repo.permissions?.push === true ? '확인됨' : 'API 응답에서 확인 불가';
    console.log(`준비 완료: ${repo.full_name}`);
    console.log(`인증: 성공 | API 이슈 접근: 성공 | 저장소 쓰기 권한: ${writeAccess} | 라벨 ${labels.length}개 | 마일스톤 ${milestones.length}개`);
    return;
  }

  if (command === 'list') {
    const state = one(options, 'state') ?? 'open';
    if (!['open', 'closed', 'all'].includes(state)) throw new Error('--state는 open, closed, all 중 하나여야 합니다.');
    const label = one(options, 'label');
    const milestone = one(options, 'milestone');
    const query = new URLSearchParams({ state, per_page: '100' });
    if (label) query.set('labels', label);
    if (milestone) query.set('milestone', milestone);
    const issues = (await listAll(`/issues?${query}`)).filter(issue => !issue.pull_request);
    console.log(issues.length ? issues.map(issue => `#${issue.number} [${issue.state}] ${issue.title}`).join('\n') : '일감이 없습니다.');
    return;
  }

  if (command === 'show') {
    const issue = await issueByNumber(positionals[0]);
    console.log(`${formatIssue(issue)}\n\n${issue.body ?? '(본문 없음)'}`);
    return;
  }

  if (command === 'create') {
    const title = one(options, 'title', true).trim();
    const type = one(options, 'type', true);
    if (!TYPES.has(type)) throw new Error(`--type은 ${[...TYPES].join(', ')} 중 하나여야 합니다.`);
    const body = one(options, 'body') ?? '';
    const criteria = options.get('accept') ?? [];
    const labels = [`type:${type}`];
    const previewBody = acceptanceBody(body, criteria);
    const payload = { title, body: previewBody, labels };
    const fingerprint = createHash('sha256').update(JSON.stringify(payload)).digest('hex').slice(0, 12);
    if (options.has('preview')) {
      console.log(`미리보기 코드: ${fingerprint}\n제목: ${title}\n유형: ${type}\n라벨: ${labels.join(', ')}\n\n${previewBody || '(본문 없음)'}\n\n승인 후 동일한 명령에 --confirm ${fingerprint}를 붙여 실행하세요.`);
      return;
    }
    const confirmation = one(options, 'confirm', true);
    if (confirmation !== fingerprint) throw new Error(`미리보기 코드가 일치하지 않습니다. 현재 내용의 코드: ${fingerprint}. 먼저 create --preview로 다시 확인하세요.`);
    for (const label of labels) await ensureLabel(label);
    const created = await request('/issues', { method: 'POST', body: payload });
    console.log(`등록 완료: ${formatIssue(created)}`);
    return;
  }

  if (command === 'start' || command === 'block') {
    const issue = await issueByNumber(positionals[0]);
    const status = command === 'start' ? 'status:in-progress' : 'status:blocked';
    const other = command === 'start' ? 'status:blocked' : 'status:in-progress';
    const updated = await updateLabels(issue, [status], [other]);
    const reason = command === 'block' ? one(options, 'reason') : undefined;
    if (reason) await request(`/issues/${issue.number}/comments`, { method: 'POST', body: { body: reason } });
    console.log(formatIssue(updated));
    return;
  }

  if (command === 'note') {
    const issue = await issueByNumber(positionals[0]);
    const body = one(options, 'body', true);
    const comment = await request(`/issues/${issue.number}/comments`, { method: 'POST', body: { body } });
    console.log(`코멘트 등록 완료: ${comment.html_url}`);
    return;
  }

  if (command === 'check') {
    const issue = await issueByNumber(positionals[0]);
    const item = one(options, 'item');
    if (!item) {
      console.log(acceptanceCriteria(issue.body ?? '') ?? '수용 기준 섹션이 없습니다.');
      return;
    }
    const isIndex = /^\d+$/.test(item);
    const index = isIndex ? Number(item) : 1;
    if (!Number.isInteger(index) || index < 1) throw new Error('--item은 1 이상의 번호여야 합니다.');
    if (options.has('done') === options.has('undone')) throw new Error('--done 또는 --undone 중 하나를 지정하세요.');
    const lines = (issue.body ?? '').split('\n');
    const heading = lines.findIndex(line => ACCEPTANCE_HEADINGS.has(line.trim()));
    if (heading < 0) throw new Error('수용 기준 섹션이 없습니다.');
    let count = 0;
    let found = false;
    const matches = [];
    for (let i = heading + 1; i < lines.length && !lines[i].startsWith('## '); i += 1) {
      if (/^\s*- \[[ xX]\] /.test(lines[i])) {
        count += 1;
        if (isIndex ? count === index : lines[i].replace(/^\s*- \[[ xX]\] /, '').includes(item)) matches.push(i);
      }
    }
    if (matches.length > 1) throw new Error('--item 문구가 여러 수용 기준과 일치합니다. 더 구체적인 문구를 지정하세요.');
    if (matches.length === 1) {
      lines[matches[0]] = lines[matches[0]].replace(/\[[ xX]\]/, options.has('done') ? '[x]' : '[ ]');
      found = true;
    }
    if (!found) throw new Error(`--item ${isIndex ? index : item}와 일치하는 수용 기준을 찾지 못했습니다.`);
    const updated = await request(`/issues/${issue.number}`, { method: 'PATCH', body: { body: lines.join('\n') } });
    console.log(acceptanceCriteria(updated.body ?? '') ?? '수용 기준 업데이트 완료');
    return;
  }

  if (command === 'close') {
    const issue = await issueByNumber(positionals[0]);
    const result = one(options, 'result', true);
    await request(`/issues/${issue.number}/comments`, { method: 'POST', body: { body: `완료 결과\n\n${result}` } });
    const closed = await request(`/issues/${issue.number}`, { method: 'PATCH', body: { state: 'closed', state_reason: 'completed' } });
    console.log(`완료 처리: ${formatIssue(closed)}\n결과 코멘트 등록 완료`);
    return;
  }

  if (command === 'milestone') {
    const selector = positionals.join(' ').trim();
    const milestones = await listAll('/milestones?state=all');
    const selected = selector ? milestones.filter(m => String(m.number) === selector || m.title.toLowerCase() === selector.toLowerCase()) : milestones;
    if (!selected.length) throw new Error('마일스톤을 찾지 못했습니다. 번호 또는 제목을 확인하세요.');
    console.log(selected.map(m => {
      const total = m.open_issues + m.closed_issues;
      const percent = total ? Math.round((m.closed_issues / total) * 100) : 0;
      return `#${m.number} ${m.title}: ${percent}% (${m.closed_issues}/${total}, 미완료 ${m.open_issues})`;
    }).join('\n'));
    return;
  }

  throw new Error(`알 수 없는 명령입니다: ${command}`);
}

main().catch(error => fail(error.message || '작업을 완료하지 못했습니다.'));
