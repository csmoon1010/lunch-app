# LOC Bloat Taxonomy

Use this reference to classify AI-style code that increases size faster than value.
These are heuristics, not proof. Confirm behavior and constraints before recommending deletion.

## Primary Patterns

### 1. Clone Proliferation

- Signal: Near-identical logic appears in multiple functions, files, or branches with only names or literals changed.
- Why it is low-value: It expands maintenance surface and drift risk without adding capability.
- Safer rewrite: Extract a shared helper only after confirming the call sites are truly the same, or delete the redundant copy.

### 2. Structural Repetition

- Signal: The same validation, branching, mapping, or logging skeleton repeats across methods.
- Why it is low-value: The code looks explicit, but review and bug-fix cost scale linearly with each duplicate block.
- Safer rewrite: Collapse the repeated structure into one helper, middleware, template method, or data-driven table when the shape is stable.

### 3. Dead Code And Unused Artifacts

- Signal: Unused imports, unread variables, unreachable branches, never-called helpers, placeholder flags, or dormant enum values.
- Why it is low-value: It adds lines and cognitive load while giving a false impression of supported behavior.
- Safer rewrite: Delete it. If unsure, add a narrow test around the live path before removal.

### 4. Speculative Generality

- Signal: Interface, factory, strategy, config object, or feature flag exists for one implementation and one mode only.
- Why it is low-value: It spends abstraction budget before real variation exists.
- Safer rewrite: Inline to the concrete implementation and wait for a second real use case before reintroducing the abstraction.

### 5. Middle-Man Wrapper Layers

- Signal: `Service -> Manager -> Helper -> Util` chains mostly forward arguments and return values unchanged.
- Why it is low-value: It increases file count and navigation cost without simplifying ownership.
- Safer rewrite: Remove pass-through layers and let callers depend on the real owner directly.

### 6. Boilerplate Error And Logging Fan-Out

- Signal: Many methods contain nearly identical `try/catch`, log lines, validation guards, or response-envelope building.
- Why it is low-value: It copies policy code into business paths and multiplies the cost of every wording or behavior change.
- Safer rewrite: Move repeated policy code into one shared guard, wrapper, interceptor, decorator, or helper.

### 7. One-Off Configuration Indirection

- Signal: New config class, toggle, or options object exists only to thread a single value through several layers.
- Why it is low-value: It creates indirect reads and constructor churn for behavior that is effectively fixed.
- Safer rewrite: Pass the value directly or keep it local until multiple settings are genuinely needed.

### 8. Type Explosion Without Semantic Split

- Signal: Tiny DTOs, wrappers, mappers, or aliases are created even though fields and lifecycle are still identical.
- Why it is low-value: It increases rename burden and conversion code without clarifying domain meaning.
- Safer rewrite: Merge adjacent types until the boundary carries real validation, ownership, or compatibility value.

## Review Questions

- Does this code add a new capability, or only another way to spell the same logic?
- Is there a second concrete use case that justifies the abstraction?
- Would deleting this layer change behavior, safety, or API stability?
- Are tests proving that the extra branch or helper matters?
- Is the repetition intentional because of platform constraints, or just generated scaffolding?

## Evidence Hints

- Diff clues: many small new files, repeated branch bodies, pass-through methods, or unused parameters.
- Static clues: unused symbols, identical call graphs, one-implementation interfaces, one-value enums, and flags stuck at one value.
- Runtime clues: none. LOC bloat often passes tests, so rely on structure and ownership analysis.

## Reporting Template

Use this structure for each finding:

1. Pattern name
2. Evidence: file and line references
3. Why it increases LOC without adding value
4. Simplest safe rewrite
5. Risk note if platform or API constraints may apply

## Background

This taxonomy is grounded in recurring empirical observations about AI-assisted code:
- increased clone rates in large repository analyses
- repeated structural patterns in LLM-generated code
- dead code and unused artifacts as common static issues
- maintainability regressions through unnecessary complexity and indirection
