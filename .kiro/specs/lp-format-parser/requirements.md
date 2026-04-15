# Requirements Document

## Introduction

The LP format parser is the primary input mechanism for solvable. It reads CPLEX LP format strings — the industry-standard human-readable format for linear programs — and converts them into the internal model representation. The parser must produce clear, educational error messages with line numbers, since the target audience includes students encountering LP format for the first time.

**Depends on**: wasm-solver-core (shares `Model` IR types defined in `solvable-core`)

## Requirements

### Requirement 1: Parse valid CPLEX LP format models

**User Story:** As a student learning linear programming, I want to write models in the standard LP format I see in textbooks, so that I can practice with a real solver without learning a proprietary language.

#### Acceptance Criteria

1. WHEN a user provides an LP string with Minimize/Maximize, Subject To, Bounds, and End sections THE SYSTEM SHALL parse it into a valid Model with the correct sense, objective, constraints, variables, and bounds
2. WHEN constraint names are provided (e.g., `protein: 0.1 bread + 0.15 milk >= 55`) THE SYSTEM SHALL preserve them in the parsed model
3. WHEN constraint names are omitted THE SYSTEM SHALL assign auto-generated names (e.g., `c1`, `c2`)
4. WHEN the Bounds section is omitted THE SYSTEM SHALL default variable lower bounds to 0 and upper bounds to infinity
5. WHEN the Bounds section specifies `free` for a variable THE SYSTEM SHALL set the lower bound to negative infinity
6. WHEN the LP string contains comment lines (starting with `\`) THE SYSTEM SHALL ignore them
7. WHEN coefficients are omitted (e.g., `x` instead of `1 x`) THE SYSTEM SHALL treat the coefficient as 1
8. WHEN negative coefficients use `- coeff var` syntax THE SYSTEM SHALL parse them correctly
9. WHEN an expression spans multiple lines (continuation lines starting with `+`, `-`, or a coefficient) THE SYSTEM SHALL treat them as a single expression
10. WHEN sections appear in a non-standard order (e.g., Bounds before Subject To) THE SYSTEM SHALL parse them correctly — only Minimize/Maximize must come first

### Requirement 2: Validate models and report errors with context

**User Story:** As a student debugging my first LP model, I want clear error messages that tell me exactly what's wrong and where, so that I can learn from my mistakes instead of getting stuck.

#### Acceptance Criteria

1. WHEN a variable appears in Bounds, General, or Binary sections but never in the objective or any constraint THE SYSTEM SHALL report a warning that the variable is declared but unused
2. WHEN a section keyword is misspelled (e.g., "Subjct To") THE SYSTEM SHALL report a helpful error suggesting the correct keyword
3. WHEN a constraint has no variables (e.g., `0 >= 5`) THE SYSTEM SHALL report a warning about the empty constraint
4. WHEN the model has no objective function THE SYSTEM SHALL report an error indicating the objective is missing
5. WHEN a line cannot be parsed THE SYSTEM SHALL report the line number, the problematic text, and a human-readable explanation of what was expected
6. WHEN multiple errors exist THE SYSTEM SHALL report all of them (not just the first) up to a reasonable limit
7. WHEN a variable first appears in the objective or a constraint without a Bounds declaration THE SYSTEM SHALL auto-create it with default bounds (0 to +infinity, continuous type) — this is standard CPLEX LP format behavior, not an error

### Requirement 3: Support integer and binary variable declarations

**User Story:** As a user building mixed-integer programs, I want to declare variables as integer or binary, so that I can model combinatorial optimization problems.

#### Acceptance Criteria

1. WHEN the LP string contains a `General` or `Integer` section THE SYSTEM SHALL mark the listed variables as integer type
2. WHEN the LP string contains a `Binary` section THE SYSTEM SHALL mark the listed variables as binary type with bounds [0, 1]
3. WHEN a variable is declared as both integer and binary THE SYSTEM SHALL treat it as binary

### Requirement 4: Fast parsing for interactive feedback

**User Story:** As a user editing a model in the browser, I want parsing to be fast enough for real-time validation, so that I see errors as I type without lag.

#### Acceptance Criteria

1. WHEN the user modifies the LP text THE SYSTEM SHALL re-parse the model within 50ms for models with up to 1000 constraints
2. WHEN parsing completes THE SYSTEM SHALL return a model summary (variable count, constraint count, sense) alongside any errors
