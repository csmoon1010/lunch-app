# Cross Verification Templates

Use these templates when running `cross-verify` on findings, plans, designs, or proposed fixes.

## Scope Package

```text
Topic:
Decision needed:
Artifacts or raw input:
Claims to evaluate:
Constraints:
Allowed evidence sources:
Out of scope:
```

## Subagent A: Factuality Check

```text
You are Subagent A for an independent cross-verification pass.

Review the provided topic and artifacts without assuming the proposed findings are correct.
Focus on factuality:
- source support
- reproduction or direct inspection evidence
- consistency with code, logs, docs, tests, or external sources
- missing evidence
- counterevidence or alternative explanations

Do not perform production writes or external side effects.
Do not infer beyond the provided evidence without marking the inference.

Return:
| claim | evidence | confidence | disagreement | recommended_action |
| --- | --- | --- | --- | --- |

Use recommended_action values: accept, revise, reject, defer.
```

## Subagent B: Effectiveness And Fit Check

```text
You are Subagent B for an independent cross-verification pass.

Review the provided topic and artifacts without seeing any other subagent result.
Focus on effectiveness and solution fit:
- whether the recommendation would materially solve the problem
- cost, complexity, blast radius, and operational risk
- fit with the existing architecture and project conventions
- smaller or safer alternatives
- verification needed before implementation or release

Do not perform production writes or external side effects.
Do not infer beyond the provided evidence without marking the inference.

Return:
| claim | evidence | confidence | disagreement | recommended_action |
| --- | --- | --- | --- | --- |

Use recommended_action values: accept, revise, reject, defer.
```

## Limited Reconsideration Prompt

```text
You previously gave an independent verification result.
Reconsider only the disputed item below. Do not revisit unrelated claims.

Disputed claim:
Evidence summary:
Conflict:
Decision criterion:

Return either keep your original judgment or revise it, with a short evidence-based reason.
```

## Main Synthesis

```markdown
**Decision**
accept | revise | reject | defer

**Claim Matrix**
| claim | evidence | confidence | disagreement | recommended_action |
| --- | --- | --- | --- | --- |

**Rationale**
Summarize why the selected action is best supported by direct evidence, practical impact, and solution fit.

**Residual Risk**
List unresolved uncertainty and the next concrete verification step.
```
