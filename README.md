# Lunch App — 점심 추천 ChatGPT 앱

ChatGPT에서 "1만 원 이하로 점심 추천해 줘"라고 말하면 후보 카드, 룰렛, 팀 투표 위젯을 보여 주는 앱입니다.
MCP Apps 표준(MCP 서버 + `ui://` 위젯)으로 만들었습니다.

## 실행

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | MCP 서버(http://localhost:3000/mcp), 위젯 빌드 감시, 미리보기 호스트(http://localhost:5180)를 함께 실행 |
| `npm test` | 추천·투표 로직 테스트 |
| `npm run build` | 타입 검사와 위젯 번들 생성 |

## 구조

| 경로 | 역할 |
| --- | --- |
| `src/domain` | 추천·투표 규칙(순수 함수) |
| `src/server` | MCP 서버. 도구(`recommend_lunch`)와 위젯 리소스(`ui://lunch/recommendations.html`)를 등록 |
| `src/widget` | 대화 안에 뜨는 위젯. `App`으로 도구 결과를 받아 그린다 |
| `preview` | ChatGPT 대신 위젯을 띄워 보는 개발용 호스트 |

## ChatGPT에 연결하기

ChatGPT는 공개 HTTPS 주소의 MCP 서버에만 연결할 수 있습니다. 로컬에서 시험하려면 HTTPS 터널로 3000번 포트를 공개하고,
`createMcpExpressApp({ host: "0.0.0.0", allowedHosts: ["<터널 도메인>"] })`처럼 터널 도메인을 허용한 뒤
ChatGPT 개발자 모드에서 `https://<터널 도메인>/mcp`로 앱을 추가합니다.
