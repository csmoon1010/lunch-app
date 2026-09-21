---
name: ai-code-antipattern-review
description: Review AI-generated or AI-assisted code for LOC-inflating antipatterns such as clone proliferation, structural repetition, dead code, speculative generality, wrapper layers, and repeated boilerplate. Use when a user asks to inspect code for AI slop, unnecessary abstraction, meaningless file growth, verbose scaffolding, maintainability regressions, or to compress/refactor code without changing behavior.
---

# AI Code Antipattern Review

## Overview

Use this skill to review code that looks complete but adds little value relative to its size.
Prioritize code that increases surface area, indirection, or review burden without improving correctness, safety, tests, or reuse.

## Workflow

1. Frame the scope.
- Determine whether the target is a diff, one file, a module, or generated output.
- Prefer diff-first review because LOC bloat is easiest to detect in added wrappers, repeated branches, and new helper files.

2. Load the taxonomy.
- Read `references/loc-bloat-taxonomy.md` before classifying findings.
- Focus first on clone proliferation, structural repetition, dead code, speculative generality, middle-man wrappers, and boilerplate-heavy error or logging paths.

3. Review for net-negative additions.
- Ask whether the added code created a real boundary, removed duplication, or improved safety.
- Treat code as suspicious when it adds files, flags, interfaces, or helper layers without new behavior or a second concrete use case.

4. Report findings with evidence.
- Include pattern name, file and line evidence, why the code increases LOC without adding value, and the safest simplification path.
- If the user asked for a review, list findings first and keep the overview brief.
- If the user asked for inline review comments, emit one `::code-comment` per finding.

5. Recommend compression steps.
- Prefer deletion over abstraction when the code is unused, duplicated, or one-shot.
- Collapse wrappers that only forward arguments.
- Merge repeated try/catch, logging, validation, or mapping blocks only when there are already multiple concrete call sites.
- Remove flags or config branches that have only one real mode.

## Guardrails

- Do not flag code as unnecessary when it enforces a real product boundary, permission check, threading rule, disposal contract, serialization boundary, or public API.
- Do not remove boring but required platform glue such as lifecycle hooks, compatibility adapters, or persistence wiring.
- When evidence is weak, label it as a `candidate simplification` instead of a defect.

## Output Shape

- Findings first, ordered by severity or expected maintenance cost.
- For each finding, explain the smallest safe rewrite.
- If there are no meaningful findings, say so explicitly and mention any residual uncertainty.
