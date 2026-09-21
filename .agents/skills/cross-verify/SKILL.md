---
name: cross-verify
description: Use this skill when the user asks for cross verification, independent subagent review, multi-agent debate, finding validation, fact checking of review findings, effectiveness review, solution-fit review, or choosing the best supported recommendation from competing agent assessments.
---

# Cross Verify

## Origin

This curated skill was created by AI Lab.

## Purpose

Use this skill to verify a topic, finding set, plan, or proposed solution with two independent subagent passes and one moderator synthesis.
The goal is not majority vote. The goal is to preserve independence, expose disagreement, and choose the recommendation with the best evidence, practical effect, and fit to the constraints.

## Workflow

1. Frame the verification package.
   - State the topic, artifact paths or raw text, claims to evaluate, decision needed, constraints, and allowed evidence sources.
   - If the scope is too broad, split it into a small claim set before spawning subagents.
   - Do not ask subagents to perform production writes or external side effects.

2. Run two independent subagent checks.
   - If multi-agent or subagent tools are available, use them to create two separate tasks. If tool discovery is required, search for the available multi-agent/subagent tool first.
   - Give both subagents the same raw artifact and scope, but do not give either subagent the other subagent's output or the main agent's expected answer.
   - Subagent A focuses on factuality: source support, reproduction, code/log/doc consistency, missing evidence, and counterevidence.
   - Subagent B focuses on effectiveness and solution fit: practical impact, cost, blast radius, architectural fit, simpler alternatives, and verification needed.

3. Build a claim matrix.
   - Normalize each finding or proposal into one claim per row.
   - Record `claim`, `evidence`, `confidence`, `disagreement`, and `recommended_action`.
   - Classify each claim as `accept`, `revise`, `reject`, or `defer`.

4. Reconcile disagreement once when needed.
   - If the two passes materially disagree, summarize the disputed claim, evidence gap, and decision criterion.
   - Send only that dispute summary back for one limited reconsideration round. Do not share full peer outputs.
   - Stop after one reconsideration round unless the user explicitly asks for deeper debate.

5. Produce the final synthesis.
   - Lead with the decision and the claims that matter most.
   - Separate verified facts from inference.
   - Identify residual uncertainty and the next verification step when confidence is not high.

## Confidence Rules

- Use `high` only when independent checks agree and direct evidence supports the claim.
- Use `medium` when the direction is supported but evidence is indirect, incomplete, or context-dependent.
- Use `low` when evidence is weak, results conflict, or a key assumption is unverified.
- Do not upgrade confidence because both subagents made the same unsupported assertion.

## Output Format

Use this structure unless the user asks for another format:

```markdown
**Decision**
accept | revise | reject | defer

**Claim Matrix**
| claim | evidence | confidence | disagreement | recommended_action |
| --- | --- | --- | --- | --- |

**Rationale**
Short synthesis of why the chosen action is best supported.

**Residual Risk**
What remains uncertain and how to verify it.
```

## References

- Read `references/methodology.md` when adapting the protocol or explaining why the method is structured this way.
- Read `references/templates.md` when drafting subagent prompts or a claim matrix.
