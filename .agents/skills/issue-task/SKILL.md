---
name: issue-task
description: 이 저장소의 GitHub 이슈를 REST API 스크립트로 조회·등록·진행 관리할 때 사용한다.
---

# GitHub 일감 관리

저장소의 `scripts/issue-task.mjs`를 사용해 GitHub 이슈를 관리한다. `gh` CLI는 사용하지 않는다. 저장소 루트에서 `node scripts/issue-task.mjs <명령>`으로 실행한다.

## 인증과 준비 점검

- 토큰과 저장소는 `~/.config/issue-task.env`의 `GITHUB_TOKEN`과 `GITHUB_REPOSITORY=owner/repository`에서만 읽는다.
- 파일 권한이 정확히 `600`이 아니면 스크립트가 중단한다. 토큰을 출력·복사·코멘트·명령 인수에 넣지 않는다.
- 첫 실행 또는 설정 변경 후 `node scripts/issue-task.mjs preflight`로 인증과 저장소 접근을 확인한다.
- API 오류에는 토큰이나 인증 헤더를 포함하지 않는다.

## 명령

- `preflight`: 인증, 저장소, 이슈 API의 읽기 접근을 점검한다.
- `list [--state open|closed|all] [--label 라벨] [--milestone 번호]`: 일감을 나열한다.
- `show 번호`: 일감 본문과 라벨을 표시한다.
- `create --preview --title 제목 --type 유형 [--body 본문] [--accept 기준]`: 등록 내용을 미리보기 한다. 유형은 `feature`, `bug`, `refactor`, `chore`, `spike` 중 하나이며 `type:` 라벨로 기록한다. `--accept`는 반복해 수용 기준을 추가할 수 있다.
- `start 번호`: `status:in-progress` 라벨을 지정한다.
- `block 번호 [--reason 사유]`: `status:blocked` 라벨을 지정하고 선택적으로 코멘트를 남긴다.
- `note 번호 --body 내용`: 코멘트를 남긴다.
- `check 번호`: 수용 기준을 표시한다. `check 번호 --item N --done` 또는 `--undone`으로 번호 순서로 갱신하거나, `--item "항목 문구" --done` 또는 `--undone`으로 문구에 일치하는 체크박스를 갱신한다. 문구가 여러 항목과 일치하면 더 구체적인 문구를 지정한다.
- `close 번호 --result 결과`: 결과 코멘트를 남긴 다음 완료 사유로 닫는다.
- `milestone [번호 또는 제목]`: 마일스톤별 완료율을 표시한다.

## 등록 승인 절차

1. 필수 제목·유형·본문·수용 기준이 갖춰졌는지 확인하고 `create --preview`를 실행해 미리보기와 코드를 사용자에게 보여 준다.
2. 사용자가 해당 미리보기를 명시적으로 승인하기 전에는 등록 요청을 보내지 않는다. 미리보기를 보여 준 것으로 승인했다고 간주하지 않는다.
3. 승인 후 동일한 내용을 사용해 `create --confirm <미리보기 코드>`를 실행한다. 내용이 바뀌면 새 미리보기를 보여 주고 다시 승인을 받는다.

상태는 `status:in-progress`, `status:blocked` 라벨로 표시한다. 등록 전에 승인 절차를 생략하거나 승인받지 않은 일감을 대신 등록하지 않는다.
