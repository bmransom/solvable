# Requirements Document

## Introduction

Sensitivity analysis tells users how robust their optimal solution is — how much can coefficients change before the solution changes? This is essential for students learning operations research and for analysts evaluating real-world decision models. HiGHS provides this data natively for LP problems, so the work is primarily in extracting and presenting it clearly.

**Depends on**: wasm-solver-core (solver + model bridge), solver-ui (results panel)

## Requirements

### Requirement 1: Display sensitivity report for LP solutions

**User Story:** As a student studying sensitivity analysis in my OR course, I want to see shadow prices and allowable ranges after solving an LP, so that I can answer "what if" questions about my model without re-solving.

#### Acceptance Criteria

1. WHEN an LP model is solved to optimality THE SYSTEM SHALL display a sensitivity report tab in the results panel
2. WHEN displaying sensitivity data THE SYSTEM SHALL show shadow prices (dual values) for each constraint with the constraint name
3. WHEN displaying sensitivity data THE SYSTEM SHALL show reduced costs for each variable
4. WHEN displaying sensitivity data THE SYSTEM SHALL show allowable increase and decrease ranges for objective coefficients
5. WHEN displaying sensitivity data THE SYSTEM SHALL show allowable increase and decrease ranges for constraint right-hand sides (RHS)
6. IF the model is a MIP (contains integer or binary variables) THE SYSTEM SHALL hide the sensitivity report tab with a note explaining sensitivity analysis is only available for pure LP models
7. WHEN displaying the constraints table THE SYSTEM SHALL show the slack/surplus value for each constraint — this is essential for understanding complementary slackness (binding constraint = zero slack = potentially nonzero shadow price)
8. WHEN displaying the variables table THE SYSTEM SHALL show the basis status for each variable (basic, at lower bound, at upper bound) — necessary context for interpreting reduced costs
9. WHEN the LP solution is degenerate (a binding constraint has a zero shadow price, or a basic variable is at a bound) THE SYSTEM SHALL display a note explaining that sensitivity ranges may be zero or misleading due to degeneracy

### Requirement 2: Educational presentation

**User Story:** As a student encountering sensitivity analysis for the first time, I want the report to be clearly labeled and understandable, so that I can connect the numbers to the concepts from my textbook.

#### Acceptance Criteria

1. WHEN displaying the sensitivity report THE SYSTEM SHALL organize it into two tables: "Constraints" (slack/surplus, shadow price, RHS range) and "Variables" (value, basis status, reduced cost, objective coefficient range)
2. WHEN a value represents infinity THE SYSTEM SHALL display it as "Infinity" (not a raw number or symbol)
3. WHEN a constraint has nonzero slack (non-binding) THE SYSTEM SHALL visually de-emphasize the row to distinguish it from binding constraints — use slack value (not shadow price) as the indicator, since degenerate LPs can have binding constraints with zero shadow prices
