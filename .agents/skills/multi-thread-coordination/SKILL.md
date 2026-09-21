---
name: multi-thread-coordination
description: Use this skill when coordinating many visible Codex threads for a parent work item, especially when each child task should run in its own worktree, follow dependency-aware execution order, move through staged workflow gates one turn at a time, use cross verification before cleanup or optimization fixes, and complete all child work before closing the parent issue.
---

# Multi-Thread Coordination

## Origin

This curated skill was created by AI Lab.

## Purpose

Use this skill to orchestrate large Codex work across multiple visible Codex threads.
The orchestrator is responsible for decomposing the parent task, creating or steering worker threads, tracking progress, reviewing outputs, coordinating verification, and ensuring every child task is complete before the parent work item is released and closed.

The parent orchestrator's goal is not only to start parallel work. The goal is to finish all child or follow-up work, integrate the results, run the release path, close the related child issues, and close the parent issue.

## Minimal User Invocation

The user should not need to restate this skill's full workflow. If the user invokes `$multi-thread-coordination` with a parent issue, parent task, or parent goal, apply all mandatory defaults from this skill automatically.

Minimum useful inputs:

- Parent issue, parent task, or parent goal.
- Target repository or project, when ambiguous.
- Child issue list, or permission to discover child and follow-up work.

Do not ask the user to repeat default rules such as worktree workers, one-turn gates, the status document, `$cross-verify`, verified-only fixes, release, or parent closeout. These are mandatory defaults of this skill.

## Parent Work Item Gate

A parent work item is mandatory for coordinated multi-thread execution.

If the user invokes this skill without a clear parent issue, parent task, or explicit parent goal, stop and ask for the parent work item before creating threads, writing status docs, assigning worker work, or changing external issue state.

For Redmine-backed work, prefer an explicit parent issue id such as `#123`.
For non-Redmine work, require a named parent task goal and record it as the parent anchor in the coordination status document.

Do not proceed from orchestration setup to worker creation until the parent anchor is established.

Neutral clarification prompt when the parent is missing:

```text
A parent work item is required before I can coordinate worker threads.
Please provide a Redmine issue number or a parent task name.
Example: Redmine #123, or "user settings sync improvement".
```

## Child Work Discovery And Confirmation Gate

After the parent work item is known, discover child or follow-up work before creating worker threads.

For Redmine-backed work:

- Use `$redmine-task` to inspect the parent issue.
- Query child issues, related issues, blockers, duplicates, and linked follow-up issues when available.
- Summarize candidate child work with issue id, subject, status, assignee, dependency, and proposed worker scope.

For non-Redmine work:

- Inspect the parent task goal, repository state, issue text, docs, or user-provided scope.
- Propose independent worker scopes that minimize file ownership overlap.
- Mark any uncertain scope as a question instead of silently assigning it.

Before creating worker threads, show the discovered child work to the user and ask for confirmation.

Do not create worker threads until the user confirms:

- Included child issues or worker scopes.
- Excluded or deferred child issues or scopes.
- Whether missing follow-up work should be created as new child issues.

## Dependency And Execution Order Gate

After child work is confirmed and before creating worker threads, decide the execution order.

Classify each child issue or worker scope:

- `independent`: Can proceed alone and in parallel.
- `parallel-safe`: Can proceed concurrently, but needs later integration or conflict checks.
- `sequential`: Must wait for another child result, branch, artifact, decision, or verification output.
- `blocked`: Cannot start until missing information, environment, permission, or upstream work is resolved.

Create an execution plan with waves:

- Put independent and parallel-safe work in the earliest safe wave.
- Put sequential work after its prerequisite wave.
- Record the prerequisite, required input, expected output, and handoff condition for every sequential item.
- If the dependency is uncertain, mark it as a question and ask the user before starting affected worker threads.

Do not start analysis or implementation for a later wave until its prerequisites are complete, verified, and reflected in the coordination status document.
Analysis is also order-sensitive. Do not send analysis-only instructions to downstream sequential workers before the prerequisite result exists if that result can change scope, likely files, risks, validation, or architecture decisions.
For sequential work that depends on another worker's output, prefer delaying worker creation until the prerequisite output is available unless early read-only analysis is explicitly approved, clearly useful, and will not become stale.

Show the dependency classification and execution waves to the user before creating worker threads, and wait for confirmation when the order materially affects scheduling or risk.

## Required Tools And Skills

- Use the Codex thread coordination tools when available: `list_projects`, `create_thread`, `list_threads`, `read_thread`, `send_message_to_thread`, `fork_thread`, `handoff_thread`, `set_thread_title`, `set_thread_pinned`, and `set_thread_archived`.
- Use `$cross-verify` for the cross-verification gate. Do not replace it with an informal review.
- Use `$redmine-task` whenever Redmine issues must be created, started, updated, commented on, completed, or verified.
- Use `$release-task` when a git-backed task is ready for release, commit, and push.
- Use `$git-commit-policy` before creating any git commit.

## Safety Rules

- Before promising thread creation, verify that the required Codex thread tools are actually callable in the current session. Tool descriptions or prior memory are not enough.
- Do not create a new or background thread unless the user explicitly asks for multi-thread or background-thread work.
- Do not use hidden subagents as a substitute for visible Codex threads when the user needs work to appear in the normal chat list.
- Keep worker prompts one stage at a time. Never bundle analysis, implementation, review, cleanup, release, and closeout into one prompt.
- Worker threads must not advance to the next stage without an explicit orchestrator instruction.
- Do not ask worker threads to print secrets, API keys, local env contents, or account identifiers.
- Do not use remote hosts or remote environments unless the user explicitly approves them for the current workflow.
- Do not ask worker threads to commit, push, or close issues unless the orchestrator has explicitly assigned that release responsibility.
- Treat existing local changes in any checkout or worktree as user work. Do not discard or overwrite them unless the user explicitly asks.

## Default Thread Policy

- For project-based implementation work, create each worker thread in a new worktree by default:

```json
{
  "target": {
    "type": "project",
    "projectId": "<projectId from list_projects>",
    "environment": {
      "type": "worktree"
    }
  }
}
```

- Use local or same-directory execution only for read-only analysis, status inspection, or when the user explicitly asks to work in the current checkout.
- Use `startingState: { "type": "working-tree" }` only when the user explicitly wants the new worktree to include the current checkout and uncommitted changes.
- Use `startingState: { "type": "branch", "branchName": "<existing ref>" }` only for an existing branch or ref. Do not use it to name a new branch.
- Prefer one visible worker thread per independent issue, file-ownership area, or implementation slice.

## Orchestrator Workflow

1. Establish the parent goal.
   - Enforce the Parent Work Item Gate before doing any orchestration work.
   - Identify the parent work item, target repository, expected release target, and closeout criteria.
   - If Redmine is involved, use `$redmine-task` to inspect current issue state before writing.
   - Record the exact goal: all child tasks complete, integrated, verified, released, and parent issue closed.

2. Discover and confirm child work.
   - Enforce the Child Work Discovery And Confirmation Gate before creating worker threads.
   - Show discovered child or follow-up work to the user and wait for confirmation.
   - Record included, excluded, and deferred work.

3. Plan dependency-aware execution order.
   - Enforce the Dependency And Execution Order Gate before creating worker threads.
   - Classify work as independent, parallel-safe, sequential, or blocked.
   - Build execution waves and record prerequisites, handoff outputs, and blocked items.

4. Create the coordination status document.
   - Default path: `docs/task-coordination/<parent-issue-or-task>/README.md`.
   - If the repository has an established coordination-doc path, use that path instead and record the choice.
   - Keep this document current throughout the workflow.

5. Start or identify worker threads.
   - Run `list_projects` before `create_thread`.
   - Use `create_thread` with a project worktree target for each implementation worker in the current eligible wave.
   - Do not create worker threads or send analysis or implementation instructions for blocked or sequential later-wave work until prerequisites are satisfied, unless the user approves early read-only analysis.
   - Set clear titles when helpful.
   - Record each thread id, host id when available, assigned scope, worktree status, dependency class, prerequisite, and wave.

6. Send analysis-only instructions.
   - Send analysis-only instructions only to workers in the current eligible wave.
   - Keep later-wave sequential work in `waiting-prerequisite` until prerequisite outputs and handoff context are available.
   - Tell each eligible worker to analyze the assigned work item and produce an implementation plan only.
   - Explicitly forbid implementation, file edits, commits, pushes, and Redmine closeout in this stage.
   - Require the worker to report scope, likely files, risks, validation commands, dependencies, sequencing constraints, expected outputs, and open questions.

7. Review plans before implementation.
   - Use `read_thread` to inspect worker outputs.
   - Approve, revise, or block each plan.
   - Send implementation instructions only to workers whose plans are accepted and whose execution wave is eligible.

8. Send implementation instructions.
   - Give each worker only its approved scope.
   - Include required prerequisite outputs or handoff context for sequential work.
   - Require focused verification and a concise report of changed files, tests run, failures, and residual risk.
   - Do not include cleanup, optimization, release, or closeout instructions in the same turn.

9. Run cleanup and optimization review.
   - After implementation, identify cleanup and optimization candidates from the worker diff and report.
   - Use `$code-cleanup` for dead, effectless, or obsolete code review when relevant.
   - Use `$code-optimization` for unnecessarily complex or overbuilt code review when relevant.
   - Treat these reviews as candidate identification, not automatic permission to change code.

10. Run `$cross-verify`.
   - Build a verification package with the worker plan, diff summary, validation output, and cleanup or optimization candidates.
   - Run two independent checks as required by `$cross-verify`:
     - Subagent A focuses on factuality, source support, reproduction, and code/log/doc consistency.
     - Subagent B focuses on effectiveness, cost, blast radius, architecture fit, safer alternatives, and verification needed.
   - Produce the claim matrix with `claim`, `evidence`, `confidence`, `disagreement`, and `recommended_action`.

11. Fix only verified items.
   - Send follow-up fix instructions only for claims classified as `accept` or clearly actionable `revise`.
   - Do not implement `reject` or `defer` claims. Record them as rejected or follow-up items in the status document.
   - Keep the fix instruction to one stage and one verified claim set.

12. Advance waves and integrate.
    - After a wave completes, update the status document with outputs, validation, and handoff evidence.
    - Re-check whether later sequential or blocked work is now eligible.
    - Start the next eligible wave only after prerequisite evidence is recorded.
    - Resolve integration conflicts before releasing dependent work.

13. Integrate and release.
    - Confirm every worker is done, blocked, or intentionally deferred with evidence.
    - Use `$release-task` for release, verification, commit, and push when the work is git-backed.
    - Use `$git-commit-policy` for commit messages.
    - Use `$redmine-task` to add reflected commit URLs, complete child issues, verify closure, then close the parent issue.
    - Do not close the parent issue until every required child issue is complete or explicitly deferred by the user.

## One-Turn-At-A-Time Prompts

Use short, stage-specific prompts. Do not include future stages as instructions.

Analysis prompt:

```text
Analyze only. Do not edit files, commit, push, or update Redmine.
Scope: <issue or task>
Prerequisite outputs and handoff context: <inputs from prior wave, or "none">.
If required prerequisite outputs are not available, do not analyze yet; report `waiting-prerequisite`.
Return: implementation plan, likely files, risks, validation commands, dependencies, sequencing constraints, expected outputs, and open questions.
Stop after the plan and wait for the orchestrator's next instruction.
```

Implementation prompt:

```text
Implement only the approved plan for <scope>.
Use prerequisite outputs and handoff context: <inputs from prior wave, or "none">.
Do not perform cleanup or optimization beyond what is required for the approved fix.
Run focused verification and report changed files, commands, results, failures, and residual risk.
Do not commit, push, or close issues.
```

Verified-fix prompt:

```text
Apply only the verified follow-up items below.
Allowed claims: <accept or revise claims from cross-verify>
Rejected/deferred claims are out of scope.
Run focused verification again and report the result.
Do not commit, push, or close issues.
```

Release prompt:

```text
Use the release workflow for <scope>.
Verify repository state, run the required tests, commit only verified changes, push, and report commit and push details.
If Redmine is in scope, add the reflected commit URL and complete the assigned issue only after the release is verified.
```

## Coordination Status Document

The orchestrator must keep a status document with this minimum structure:

```markdown
# <Parent Issue Or Task> Coordination Status

## Parent Goal
- Parent:
- Goal:
- Release target:
- Closeout criteria:

## Threads
| child | thread_id | host | worktree | scope | dependency_class | prerequisite | wave | phase | last_instruction | last_result | next_instruction |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |

## Execution Plan
| wave | child_or_scope | dependency_class | prerequisite | required_input | expected_output | handoff_condition | status |
| --- | --- | --- | --- | --- | --- | --- | --- |

## Verification
| child | changed_files | validation | cross_verify_decision | accepted_claims | rejected_or_deferred |
| --- | --- | --- | --- | --- | --- |

## Closeout
| item | status | evidence |
| --- | --- | --- |
```

Valid phases are: `queued`, `waiting-prerequisite`, `analysis`, `plan-review`, `implementation`, `review`, `verified-fix`, `release`, `closed`, `blocked`, and `deferred`.

## Reporting

When reporting to the user, lead with the current parent-goal status, then summarize child thread progress, blockers, verification decisions, and the next one-turn instruction for each active worker.
If thread tools are unavailable, report the exact missing callable surface and stop instead of switching to unrelated automation.
