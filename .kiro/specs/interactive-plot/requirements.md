# Requirements Document

## Introduction

The interactive plot is the central learning tool — a 2D visualization of LP feasible regions where students directly manipulate constraints, objective direction, and solution points. Unlike a static chart, every element is draggable and every change triggers an instant re-solve. This is the component that makes the "Desmos for optimization" vision real. It is used across chapters 1-3, 5, and 7.

**Depends on**: wasm-solver-core (reactive re-solving), lp-format-parser (model construction)

## Requirements

### Requirement 1: Render a 2D feasible region for two-variable LPs

**User Story:** As a student seeing a linear program for the first time, I want to see the feasible region as a colored shape on a graph, so that I can understand what "feasible" means visually.

#### Acceptance Criteria

1. WHEN a two-variable LP model is provided THE SYSTEM SHALL draw each constraint as a line across the plot with a distinct color
2. WHEN displaying constraints THE SYSTEM SHALL shade the feasible half-plane for each constraint with a light tint of that constraint's color
3. WHEN multiple constraints are active THE SYSTEM SHALL shade the intersection (feasible region) as a distinct filled polygon
4. WHEN the feasible region is unbounded THE SYSTEM SHALL clip to the viewport and show a directional arrow indicating the unbounded direction
5. WHEN the feasible region is empty (infeasible) THE SYSTEM SHALL show the constraint lines without any intersection shading and display an "Infeasible" indicator
6. WHEN the optimal solution exists THE SYSTEM SHALL mark it with a prominent point and display its coordinates and objective value
7. WHEN the LP has alternative optima THE SYSTEM SHALL highlight the entire optimal edge, not just a single point

### Requirement 2: Direct manipulation of constraints

**User Story:** As a student exploring how constraints affect the solution, I want to drag constraint lines and watch the feasible region and optimal point update in real time, so that I build intuition for sensitivity.

#### Acceptance Criteria

1. WHEN the user drags a constraint line THE SYSTEM SHALL update the constraint's RHS value and re-solve the model within 50ms, updating the feasible region, optimal point, and objective value in real time
2. WHEN the user drags a constraint line THE SYSTEM SHALL display the updated RHS value alongside the constraint
3. WHEN a constraint drag causes the model to become infeasible THE SYSTEM SHALL immediately reflect this — the feasible region vanishes and the status changes to "Infeasible"
4. WHEN dragging is enabled THE SYSTEM SHALL show a grab cursor on constraint lines and highlight them on hover with the constraint name

### Requirement 3: Direct manipulation of the objective

**User Story:** As a student, I want to see the objective function as a direction arrow and drag it to change the optimization direction, so that I can see why different objectives lead to different optimal vertices.

#### Acceptance Criteria

1. WHEN the model is displayed THE SYSTEM SHALL draw the objective gradient as an arrow from the origin indicating the direction of improvement
2. WHEN the model is displayed THE SYSTEM SHALL draw dashed iso-profit contour lines perpendicular to the gradient
3. WHEN the user drags the gradient arrow THE SYSTEM SHALL update the objective coefficients, re-solve, and show the optimal point snap to a new vertex
4. WHEN the gradient is parallel to a binding constraint THE SYSTEM SHALL highlight the optimal edge (alternative optima)

### Requirement 4: Point exploration

**User Story:** As a student, I want to drag a point around the plot and see whether it's feasible, what its objective value is, and how it compares to the optimum, so that I discover that vertices are special.

#### Acceptance Criteria

1. WHEN the user drags a point on the plot THE SYSTEM SHALL display the point's coordinates, its objective value, and whether it satisfies all constraints
2. WHEN the point is outside the feasible region THE SYSTEM SHALL highlight in red which constraints are violated
3. WHEN the point is at the optimal vertex THE SYSTEM SHALL display a "This is optimal!" indicator
4. WHEN the point is at a feasible non-optimal vertex THE SYSTEM SHALL show the gap between its objective value and the optimal value

### Requirement 5: Constraint toggling

**User Story:** As a student in Chapter 2, I want to toggle individual constraints on and off, so that I can see how each one shapes the feasible region.

#### Acceptance Criteria

1. WHEN a constraint toggle is provided THE SYSTEM SHALL show a checkbox for each constraint in a legend panel
2. WHEN the user toggles a constraint off THE SYSTEM SHALL remove it from the model, re-solve, and update the feasible region immediately
3. WHEN a constraint is toggled off THE SYSTEM SHALL show it as a dashed gray line on the plot (still visible but not active)

### Requirement 6: Parameter sliders

**User Story:** As a student exploring sensitivity, I want sliders that control model parameters (RHS values, objective coefficients, variable bounds), so that I can sweep a parameter and watch the solution respond continuously.

#### Acceptance Criteria

1. WHEN the lesson configures parameter sliders THE SYSTEM SHALL display labeled sliders below the plot
2. WHEN the user drags a slider THE SYSTEM SHALL update the corresponding model parameter and re-solve within 50ms
3. WHEN a slider value changes THE SYSTEM SHALL animate the feasible region and optimal point transition smoothly (not jump)
4. WHEN a slider change causes a status change (optimal → infeasible) THE SYSTEM SHALL clearly indicate the transition
