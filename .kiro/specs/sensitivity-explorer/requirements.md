# Requirements Document

## Introduction

Sensitivity analysis answers the question engineers actually care about: "How robust is this solution?" This spec covers Chapter 7, which replaces static sensitivity tables with interactive parameter sliders and Monte Carlo robustness testing. Students drag parameters and watch the solution respond, building intuition for shadow prices and allowable ranges through direct experience.

**Depends on**: interactive-plot, wasm-solver-core

## Requirements

### Requirement 1: Interactive shadow price discovery

**User Story:** As a student, I want to drag a constraint's RHS and watch the objective change at exactly the shadow price rate, so that I understand shadow prices as "the price of a resource" without needing the dual theory.

#### Acceptance Criteria

1. WHEN a constraint RHS slider is provided THE SYSTEM SHALL show the current shadow price alongside the slider
2. WHEN the user drags the RHS slider THE SYSTEM SHALL re-solve and update the objective value, displaying the rate of change (delta_objective / delta_RHS) which equals the shadow price within the allowable range
3. WHEN the user drags the RHS beyond the allowable range THE SYSTEM SHALL show the basis change — the shadow price jumps to a new value, and the optimal vertex changes — with a visual "snap" on the plot
4. WHEN the basis changes THE SYSTEM SHALL explain: "The shadow price just changed because a different constraint became binding. The old price was valid within a range — you just left it."

### Requirement 2: Interactive reduced cost discovery

**User Story:** As a student, I want to drag an objective coefficient and watch the solution stay the same until a threshold, then snap to a new vertex, so that I understand allowable ranges viscerally.

#### Acceptance Criteria

1. WHEN an objective coefficient slider is provided THE SYSTEM SHALL show the current value and the allowable range (increase and decrease) alongside the slider
2. WHEN the user drags within the allowable range THE SYSTEM SHALL re-solve and show the optimal vertex staying the same (the iso-profit line rotates but the same vertex remains optimal)
3. WHEN the user drags past the allowable range boundary THE SYSTEM SHALL show the optimal vertex snap to a different vertex with a visual transition on the plot
4. WHEN the vertex snaps THE SYSTEM SHALL explain: "The solution just changed because this objective coefficient crossed a threshold. In the old range, vertex A was best. Now vertex B is."

### Requirement 3: Monte Carlo robustness testing

**User Story:** As an engineer whose input data is noisy, I want to see how often my solution stays optimal when parameters are perturbed randomly, so that I can assess whether to trust the solver's answer.

#### Acceptance Criteria

1. WHEN the robustness explorer is active THE SYSTEM SHALL allow the user to specify uncertainty ranges for each parameter (e.g., "demand ± 10%")
2. WHEN the user clicks "Test Robustness" THE SYSTEM SHALL run N Monte Carlo samples (default 100), perturbing each parameter uniformly within its uncertainty range, solving each, and collecting statistics
3. WHEN the Monte Carlo completes THE SYSTEM SHALL display:
   - Percentage of samples where the same basis (vertex) is optimal
   - Distribution of objective values as a histogram
   - Worst-case objective value within the uncertainty range
4. WHEN the basis is optimal in less than 80% of samples THE SYSTEM SHALL flag the solution as "sensitive" and suggest which parameters contribute most to instability

### Requirement 4: Binding vs. non-binding constraint explanation

**User Story:** As a student, I want to see which constraints are "tight" and which have slack, so that I understand complementary slackness and why only binding constraints have nonzero shadow prices.

#### Acceptance Criteria

1. WHEN a solution is displayed on the interactive plot THE SYSTEM SHALL visually distinguish binding constraints (thick, colored) from non-binding constraints (thin, faded)
2. WHEN the user hovers over a binding constraint THE SYSTEM SHALL show: "This constraint is tight (slack = 0). Its shadow price is X — each additional unit of RHS is worth X to the objective."
3. WHEN the user hovers over a non-binding constraint THE SYSTEM SHALL show: "This constraint has slack = Y. It's not limiting the solution, so its shadow price is 0."
4. WHEN a prediction prompt asks "Which constraints are binding?" THE SYSTEM SHALL accept the student's guess before highlighting the answer
