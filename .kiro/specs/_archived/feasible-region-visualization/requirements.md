# Requirements Document

## Introduction

For two-variable LP problems, a 2D visualization of the feasible region is one of the most powerful educational tools available. Students can see how constraints form half-planes, how the feasible region is the intersection, and how the optimal solution sits at a vertex. This feature transforms solvable from a solver into a learning tool.

**Depends on**: wasm-solver-core, lp-format-parser, solver-ui

## Requirements

### Requirement 1: Visualize the feasible region for 2-variable LP problems

**User Story:** As a student learning linear programming, I want to see a graph of the feasible region, so that I can build geometric intuition for how constraints interact and where the optimal solution lies.

#### Acceptance Criteria

1. WHEN a model has exactly 2 variables and is solved THE SYSTEM SHALL display a 2D plot showing the feasible region
2. WHEN displaying the feasible region THE SYSTEM SHALL draw each constraint as a line with the feasible half-plane shaded
3. WHEN displaying the feasible region THE SYSTEM SHALL shade the intersection of all constraint half-planes as the feasible region, clipping to the viewport bounds for unbounded regions
4. WHEN displaying the feasible region THE SYSTEM SHALL mark variable bound constraints (e.g., x >= 0) as boundary lines
5. WHEN the optimal solution exists THE SYSTEM SHALL mark the optimal point on the plot with a distinct marker and label showing its coordinates
6. WHEN the model has more than 2 variables THE SYSTEM SHALL hide the visualization panel (not show an error)
7. WHEN the feasible region is unbounded THE SYSTEM SHALL clip the shaded region to the viewport boundaries and indicate the unbounded direction with an arrow or label
8. WHEN the LP has alternative optima (optimal objective along an edge, not just a vertex) THE SYSTEM SHALL highlight the entire optimal edge, not just a single point

### Requirement 2: Interactive plot features

**User Story:** As a user exploring a model visually, I want to interact with the plot, so that I can examine specific points and understand constraint contributions.

#### Acceptance Criteria

1. WHEN the user hovers over a constraint line THE SYSTEM SHALL highlight the line and show the constraint name and equation
2. WHEN the user hovers over the optimal point THE SYSTEM SHALL show the objective value and variable values
3. WHEN the plot is displayed THE SYSTEM SHALL label the axes with the variable names
4. WHEN the feasible region is empty (infeasible model) THE SYSTEM SHALL show the constraint lines without shading and display an "Infeasible" label

### Requirement 3: Objective function contour

**User Story:** As a student, I want to see the direction of optimization, so that I can understand why the optimal point is where it is.

#### Acceptance Criteria

1. WHEN the optimal solution exists THE SYSTEM SHALL draw a dashed iso-profit/iso-cost line through the optimal point (perpendicular to the objective gradient)
2. WHEN the optimal solution exists THE SYSTEM SHALL draw an arrow indicating the direction of improvement (toward maximization or toward minimization)
