# 작업 지침

- 응답과 커밋 메시지는 한국어로 작성한다.
- ChatGPT 앱은 MCP Apps 표준을 기본으로 만든다. 위젯은 `@modelcontextprotocol/ext-apps`의 `App`으로 호스트와 통신하고, `window.openai`는 ChatGPT 전용 기능이 꼭 필요할 때만 기능 감지 후 사용한다.
- 도구를 추가하거나 바꾸면 `title`, `description`, `annotations`(readOnlyHint 등)를 함께 정하고 `src/domain`에 테스트를 추가한다.
- 추천·투표 같은 규칙은 `src/domain`의 순수 함수로 두고, 서버(`src/server`)와 위젯(`src/widget`)은 얇게 유지한다.
- 변경 후 `npm test`와 `npm run build`로 확인한다.

## 일감과 커밋

- 작업은 GitHub 이슈(일감) 단위로 한다. 일감 하나에 스레드 하나를 쓰고, 스레드 이름은 일감 번호로 시작한다(예: `#8 정렬 옵션`).
- 진행 상황은 파일에 쓰지 않고 일감 코멘트로 남긴다. 일감은 `issue-task` 스킬로 다룬다.
- 커밋 메시지는 `git-commit-policy` 스킬을 따른다. 일감 번호는 GitHub 이슈 번호(`#8`)다. 본문 끝에 검증(실제로 실행한 명령과 결과)과 `Closes #8`(버그는 `Fixes #8`)을 넣는다.
- 기능 변경과 리팩토링은 커밋을 나눈다. 토큰 · 비밀번호 · 개인정보는 일감 · 커밋 · 코드에 남기지 않는다.
