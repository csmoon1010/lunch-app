---
name: software-design
description: Use this skill when designing or reviewing software changes, architecture, implementation plans, bug fixes, features, or refactors. Require a regression or acceptance test to be fixed before implementation, prefer the smallest structurally simple change, scrutinize new state dimensions and sources of authority, apply SOLID proportionally, reuse existing APIs, and reduce avoidable parts, wrappers, processes, and complexity.
---

# Software Design

## Origin

This curated skill was created by AI Lab.

## Purpose

Design the smallest change that satisfies the required behavior while preserving existing contracts. Treat simplicity as fewer concepts, states, authorities, branches, and moving parts—not merely fewer lines of code.

## Design Workflow

Follow these principles in order. Do not use a later principle to bypass an earlier safety or correctness constraint.

1. Fix the regression boundary before implementation
   - Identify the behavior, contract, or failure that the change must preserve or correct.
   - Add or specify the smallest regression test that fails for the intended reason before changing production code. For new behavior, use a focused acceptance or contract test.
   - Keep the test unchanged while implementing the fix unless evidence shows that the test encoded the wrong requirement.
   - If an automated test is impractical, state why and define a repeatable verification procedure before implementation.

2. Prefer the smallest structurally simple change
   - Start from the existing design, conventions, and extension points.
   - Change the fewest concepts and files needed to satisfy the fixed test and stated invariants.
   - Avoid broad refactors, speculative extensibility, new layers, or unrelated cleanup unless they are necessary for correctness.
   - Judge minimality by cognitive and behavioral surface area, not line count alone.

3. Scrutinize every new state axis and authority
   - Treat a new state axis as any independent flag, mode, status, lifecycle phase, source, or configuration dimension.
   - Treat a new authority as any new source of truth, owner, policy decision point, permission boundary, or writer of canonical state.
   - Add one only after proving that the requirement cannot be expressed safely through an existing axis or authority.
   - When addition is unavoidable, define ownership, valid transitions, precedence, conflict resolution, persistence, compatibility, and removal conditions.

4. Reduce complexity whenever possible
   - Prefer fewer states, branches, dependencies, synchronization points, and special cases.
   - Remove accidental complexity before introducing abstractions to manage it.
   - Preserve necessary domain complexity instead of hiding it behind generic machinery.

5. Prefer existing APIs over direct implementation
   - Search the standard library, framework, platform, and project utilities before writing custom logic.
   - Verify that the chosen API preserves required semantics, error behavior, performance, compatibility, and security.
   - Do not add a dependency solely to reduce a small amount of straightforward code.

6. Apply SOLID proportionally
   - Keep responsibilities cohesive, dependencies directed toward stable boundaries, and substitutions behaviorally compatible.
   - Introduce interfaces, adapters, or extension points only when they represent a real boundary or variation.
   - Do not turn SOLID into a mandate for one-class-per-concept, premature indirection, or abstraction without multiple meaningful consumers.

7. Avoid meaningless method wrapping
   - Do not add methods that only rename or forward a call without enforcing a domain rule, adapting a boundary, stabilizing a contract, adding observability, or enabling a justified test seam.
   - Inline or remove wrappers whose existence does not reduce coupling or clarify ownership.

8. Use elimination as the final design test
   - Apply the heuristic: "The best part is no part. The best process is no process."
   - Ask whether each new component, state, layer, handoff, and process is necessary to satisfy the fixed behavior and operational constraints.
   - Do not use this heuristic to remove required testing, security, observability, rollback, compatibility, or compliance controls.

## Required Design Output

Present the design with:

- the required behavior and preserved invariants;
- the regression, acceptance, or contract test to fix before implementation;
- the smallest change seam and expected file or component scope;
- any proposed state axis or authority, including why existing ones are insufficient;
- existing APIs or extension points to reuse;
- complexity removed or deliberately not introduced;
- verification steps and remaining risks.

Separate required work from optional follow-up improvements. If evidence is missing, name the missing evidence instead of inventing a broader design.
