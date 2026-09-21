---
name: code-optimization
description: Use this skill when the user asks for code optimization, simplification-focused code review, overengineering review, or a review of code changed in the current thread/session whose primary goal is reducing code volume by replacing custom logic with existing APIs and simplifying unnecessarily complex or inflated implementations.
---

# Code Optimization

## Origin

This curated skill was created by AI Lab.

## Purpose

Use this skill to review whether code changed in the current thread or session can be made simpler, shorter, and easier to maintain.
In this skill, optimization is not primarily micro-performance tuning. It means using existing APIs, removing unnecessary custom implementations, and reducing avoidable complexity when the change has clear practical value.
Do not optimize for optimization's sake: avoid preference-only rewrites, cosmetic simplification, or churn whose benefit does not clearly outweigh the cost and risk of changing working code.

## Primary Goal: Reduce Code Volume

The primary success criterion is a net reduction in the amount of code that must be understood and maintained while preserving required behavior.
Prefer direct use of existing language, framework, and project APIs; fewer branches and state transitions; and removal of abstractions whose cost exceeds their value.
Evaluate the whole proposed replacement, including new helpers and adapters: relocating logic or adding a generalized layer is not a reduction.
When edits are requested, compare the relevant before/after diff and report the approximate net line reduction; allow supporting tests or essential clarity to add lines when they protect the smaller production implementation.

## Review Scope

- If the user does not specify a narrower scope, review all code modified or created across the current session, not just the most recent turn or the last file touched.
- If the user explicitly names files, modules, commits, or a diff base, use that scope instead.
- In a git repository, inspect the change set with `git status --short`, `git diff --stat`, `git diff`, and, when useful, a diff against the base branch.
- Include nearby call sites, helpers, and tests directly connected to the changed files.
- Do not expand into a broad whole-repository performance review or large refactor proposal unless the user explicitly asks for it.

## Review Points

1. Custom logic where an API should be used
   - Look for manually implemented logic that could be handled by the standard library, the framework, or utilities already present in the project.
   - Prioritize areas where proven APIs matter: date/time, URLs, paths, JSON, sorting/grouping, retries, caching, concurrency, parsing, and validation.
   - Do not recommend new dependencies by default. Prefer APIs and project-standard tools that are already available.

2. Overcomplicated logic for simple problems
   - Look for unnecessary state, nested branching, temporary data structures, manual loops, excessive abstractions, and meaningless wrappers.
   - Check whether the same result can be expressed more directly with early returns, collection operations, or existing helper calls.
   - Prioritize control flow that hides the domain intent from a reader.

3. Inflated implementations
   - Look for patterns where logic that could be expressed in roughly 50 lines is spread across something closer to 200 lines.
   - Check for duplicated branches, repeated type conversions, duplicated error handling, oversized configuration objects, and unused generalization points.
   - Judge by reduced complexity and maintenance cost, not by line count alone.

## Avoid False Positives

- Do not assume custom code is wrong when it exists for performance, security, compatibility, public API stability, incident response, or explicit domain rules.
- Before suggesting an alternative API, verify that it is available in the current project or has low adoption cost.
- Do not recommend code that is shorter but less clear, less debuggable, or behaviorally riskier.
- Do not present a suggestion as a finding unless it is worth changing: the expected maintainability, readability, reliability, or complexity benefit should be material enough to justify the edit.
- Treat low-value cleanup, stylistic preference, and speculative "could be nicer" ideas as non-findings unless the user explicitly asks for brainstorming.
- If confidence is low, separate the item as a question or follow-up verification instead of presenting it as a finding.

## Output Format

- Present findings first, ordered by severity.
- For each finding, include the file/line, why the implementation is unnecessarily complex, the simpler alternative, the expected reduction in code or complexity, and the verification needed.
- When useful, show the core shape of the replacement code briefly, but do not create a full refactor patch unless the user asks for one.
- Only include findings with enough practical value to act on; omit improvements that are merely possible but not worth the churn.
- State the expected net code reduction for actionable findings when it can be estimated responsibly.
- If there are no issues, clearly say that no unnecessarily custom, overcomplicated, or inflated implementation was found, and state the reviewed scope.
