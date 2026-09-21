---
name: work-spec-from-md
description: Markdown(.md) 문서를 입력으로 받아 "작업명세서" 형태의 작업 스텝(단계)과 각 단계의 작업 내용(체크리스트/불릿)을 구조화해 출력한다. 사용자가 "작업명세서 만들어줘", "WBS로 정리", "작업 스텝 뽑아줘", "md를 작업 단계로 변환" 같이 요청하거나, 요구사항/설계/회의록/PRD/README 같은 Markdown을 실행 가능한 작업 목록으로 정리해야 할 때 사용한다.
---

# Work Spec From Markdown

## 목적

Markdown 문서에서 실행 가능한 작업 단계를 추출해, 사람이 바로 실행/리뷰할 수 있는 `작업 스텝 + 작업 내용` 문서로 변환한다.

## 빠른 사용

- 변환(파일 → 표준 출력): `python /Users/jeonginkim/.codex/skills/work-spec-from-md/scripts/md_to_work_spec.py INPUT.md`
- 변환(파일 → 파일): `python /Users/jeonginkim/.codex/skills/work-spec-from-md/scripts/md_to_work_spec.py INPUT.md -o 작업명세서.md`
- 변환(stdin): `cat INPUT.md | python /Users/jeonginkim/.codex/skills/work-spec-from-md/scripts/md_to_work_spec.py -`

## 변환 규칙(요약)

- 코드펜스( ``` ) 내부는 무시한다.
- 기본 단계 추출:
  - `###`(H3)을 `작업 스텝`으로 본다.
  - H3가 없으면 `##`(H2)을 `작업 스텝`으로 본다.
  - 헤딩이 거의 없으면 최상위 불릿/체크리스트를 `작업 스텝`으로 본다.
- 각 스텝의 `작업 내용`은 해당 섹션 아래의 불릿/번호/체크리스트를 수집한다.
- 섹션 아래 일반 문단 텍스트가 있으면 `비고`로 넣는다(짧게 유지).

## 산출물 포맷

출력은 Markdown이며 기본 구조는 아래와 같다.

- `# 작업명세서: <제목>`
- `## 작업 스텝`
  - `### 1. <스텝명>`
    - `#### 작업 내용` (불릿)
    - `#### 비고` (선택)

## 작업 품질 체크

- 스텝명이 너무 추상적이면 동사로 구체화한다(예: "서버" → "서버 라우트 추가").
- 작업 내용은 검증 가능하게 쪼갠다(예: "테스트" → "검색 결과 파싱 테스트 추가").
- 입력 문서에 없는 가정은 최소화하고, 필요한 경우 `비고`에 질문으로 남긴다.
