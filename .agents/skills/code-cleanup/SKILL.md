---
name: code-cleanup
description: Use this skill when the user asks for code cleanup, cleanup-focused code review, dead-code review, unused legacy code review, or a review of code changed in the current thread/session whose primary goal is reducing code volume by removing code that is dead, effectless, meaningless in the call graph, or obsolete.
---

# Code Cleanup

## Origin

This curated skill was created by AI Lab.

## Purpose

Use this skill to review whether changed code can become smaller, clearer, and easier to maintain.
The review target is code affected by changes in the current thread or session, and the focus is removing unnecessary code and meaningless paths rather than adding behavior.
Do not clean up for cleanup's sake: avoid preference-only deletion, cosmetic reshuffling, or churn whose benefit does not clearly outweigh the cost and risk of changing working code.

## Primary Goal: Reduce Code Volume

The primary success criterion is a net reduction in the amount of code that must be understood and maintained while preserving required behavior.
Prefer deleting dead or obsolete code, collapsing equivalent paths, and removing unnecessary files, exports, wrappers, branches, and state.
Do not count moving code elsewhere, hiding it behind a new abstraction, or compressing it into less readable syntax as meaningful reduction.
When edits are requested, compare the relevant before/after diff and report the approximate net line reduction; allow supporting tests or essential clarity to add lines when they protect the smaller production implementation.

## Review Scope

- If the user does not specify a narrower scope, review all code modified or created across the current session, not just the most recent turn or the last file touched.
- If the user explicitly names files, modules, commits, or a diff base, use that scope instead.
- In a git repository, inspect the change impact with `git status --short`, `git diff --stat`, `git diff`, and, when useful, a diff against the base branch.
- Include nearby code called by the changed files, but do not expand into a broad whole-repository review unless the user explicitly asks for it.
- If the scope is ambiguous, briefly confirm the files, diff base, or review baseline before proceeding.

## Review Points

1. Complete dead code
   - Look for functions, classes, exports, files, test helpers, and configuration entries that are no longer referenced.
   - Check unreachable branches, conditions that are effectively constant, and leftover entry points from removed features.
   - Use `rg` or language-specific static analysis to support the claim that no references remain.

2. Code that is effectively meaningless in the call graph
   - Look for calls whose return values are unused, assignments that reassign the same value, and wrappers that do not change observable state.
   - Check branches that produce the same result on both sides, or validation/conversion paths that appear meaningful but leave inputs and outputs unchanged.
   - For calls that may have side effects, such as logging, metrics, caching, or event publishing, verify the actual side effect before judging them as meaningless.

3. Unused legacy code
   - Look for old APIs left after migration, stale feature flags, disconnected compatibility adapters, and obsolete schema fields.
   - Check whether an old path that remains alongside a new path can still be selected at runtime.
   - Do not assume compatibility code should be removed when it intentionally supports a public API, data migration, or rollback path.

## Avoid False Positives

- Do not classify framework conventions, reflection/DI entry points, automatic route registration, serialization fields, test fixtures, migration files, generated code, or public APIs as dead code based only on text search.
- For deletion suggestions, include the file/line, call-graph evidence, expected runtime impact, and recommended cleanup approach.
- Do not present a suggestion as a finding unless it is worth changing: the expected maintainability, clarity, reliability, or future-risk reduction should be material enough to justify the edit.
- Treat low-value cleanup, stylistic preference, and speculative "could be tidier" ideas as non-findings unless the user explicitly asks for brainstorming.
- If confidence is low, separate the item as "needs confirmation" or "follow-up verification" instead of presenting it as a finding.

## Output Format

- Present findings first, ordered by severity.
- For each finding, include the file/line, cleanup target, why it is dead/effectless/legacy code, and the recommended action.
- Only include findings with enough practical value to act on; omit cleanup ideas that are merely possible but not worth the churn.
- State the expected net code reduction for actionable findings when it can be estimated responsibly.
- If there are no issues, clearly say that no cleanup-worthy code was found and briefly state the remaining verification limits.
- If the user did not ask for edits, present review results only and do not delete code immediately.
