# Requirements Document

## Introduction

The vertex walker teaches how the solver finds the optimal solution — not by exhaustive search, but by walking along edges of the feasible polytope from vertex to vertex, always improving. This is the geometric intuition behind the simplex method, presented without tableaus or pivot algebra. Students click to move between vertices and see why the solver's strategy is efficient. Used in Chapter 3.

**Depends on**: interactive-plot (2D visualization + geometry engine)

## Requirements

### Requirement 1: Step-by-step vertex traversal

**User Story:** As a student who has seen the feasible region, I want to step through the solver's path from vertex to vertex, so that I understand the strategy of "always move toward improvement."

#### Acceptance Criteria

1. WHEN vertex walking mode is active THE SYSTEM SHALL highlight all feasible vertices as clickable dots and highlight the current vertex prominently
2. WHEN the user clicks "Step" THE SYSTEM SHALL move to the adjacent vertex that most improves the objective, animate the transition along the edge, and update the objective value display
3. WHEN the current vertex is optimal (no improving neighbor exists) THE SYSTEM SHALL display "Optimal — no neighbor is better" and stop
4. WHEN at a non-optimal vertex THE SYSTEM SHALL draw arrows along edges to adjacent vertices, colored by improvement (green = improving, red = worsening, gray = equal)
5. WHEN the user clicks on any vertex directly THE SYSTEM SHALL show that vertex's objective value and whether it is better or worse than the current vertex — but NOT move there (simplex can only walk edges)

### Requirement 2: Reduced cost intuition

**User Story:** As a student, I want to understand what "reduced cost" means in visual terms, so that I can connect the solver output to the geometry.

#### Acceptance Criteria

1. WHEN at a vertex THE SYSTEM SHALL display the reduced cost for each edge as "Improvement per step along this edge: +X"
2. WHEN all reduced costs are non-positive (for maximization) THE SYSTEM SHALL explain: "No direction improves the objective — this vertex is optimal"
3. WHEN a "Go Deeper" section is expanded THE SYSTEM SHALL show the connection: reduced cost = rate of change of the objective along that edge = the dual variable interpretation

### Requirement 3: Starting point matters (but not much)

**User Story:** As a student, I want to try starting from different vertices, so that I discover that the simplex method always reaches the optimum regardless of where it starts.

#### Acceptance Criteria

1. WHEN the user clicks "Choose Start" THE SYSTEM SHALL allow clicking any feasible vertex to set it as the starting point
2. WHEN the user walks from different starting vertices THE SYSTEM SHALL track and display the number of steps taken from each start, demonstrating that the path may differ but the destination is the same
3. WHEN the walk completes THE SYSTEM SHALL display "Reached optimal in N steps" and note that for 2D problems the path is always short, but for high-dimensional problems the number of steps can vary significantly
