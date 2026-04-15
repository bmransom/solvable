# Requirements Document

## Introduction

Integer programming is where optimization gets hard — and where engineers most need intuition about why. This spec covers Chapter 6, which teaches LP relaxation, branch and bound, and the practical reality that MIP solve times are unpredictable. The key pedagogical moments: rounding doesn't work, the LP relaxation bounds the optimal, and adding variables causes exponential blowup.

**Depends on**: interactive-plot, wasm-solver-core

## Requirements

### Requirement 1: LP relaxation comparison

**User Story:** As a student, I want to see the LP relaxation solution next to the integer solution on the same plot, so that I understand why "just round it" doesn't work.

#### Acceptance Criteria

1. WHEN a MIP model is displayed THE SYSTEM SHALL show integer-feasible points as dots on a lattice within the feasible region
2. WHEN the LP relaxation is solved THE SYSTEM SHALL mark the relaxation optimum (possibly fractional) with one marker, and the true integer optimum with a different marker
3. WHEN the LP relaxation optimum differs from the integer optimum THE SYSTEM SHALL draw a line connecting them with the objective gap labeled
4. WHEN the "nearest integer point to the LP relaxation" is not the integer optimum THE SYSTEM SHALL highlight this — demonstrating that rounding fails
5. WHEN a "Go Deeper" section is expanded THE SYSTEM SHALL explain: the LP relaxation value is always a bound on the true integer optimal (upper bound for maximization, lower bound for minimization)

### Requirement 2: Branch and bound tree visualization

**User Story:** As a student, I want to see the branch-and-bound tree grow as the solver explores, so that I understand why MIP is computationally hard and what the MIP gap means.

#### Acceptance Criteria

1. WHEN a MIP model is solved THE SYSTEM SHALL display a tree where each node represents an LP relaxation subproblem
2. WHEN a tree node is displayed THE SYSTEM SHALL show: the branching variable and value, the LP relaxation bound at that node, and whether the node was pruned (and why: infeasible, bounded, or integer-feasible)
3. WHEN the user clicks "Step" THE SYSTEM SHALL expand the tree one node at a time, showing the solver's decision at each step
4. WHEN the tree is growing THE SYSTEM SHALL display the current best integer solution (incumbent), the best relaxation bound, and the MIP gap percentage
5. WHEN a node's relaxation bound is worse than the incumbent THE SYSTEM SHALL visually prune it (gray out + strikethrough) and explain: "This branch can't beat what we already have"

### Requirement 3: Solve time explosion

**User Story:** As an engineer who will put MIP in production, I want to see that adding variables can cause exponential solve time growth, so that I plan for time limits and good-enough solutions.

#### Acceptance Criteria

1. WHEN the lesson presents a scalable MIP (e.g., knapsack with N items) THE SYSTEM SHALL provide a slider controlling the number of binary variables (from 5 to 30)
2. WHEN the user increases the variable count THE SYSTEM SHALL solve the model and display the solve time on a chart, showing exponential growth
3. WHEN solve time exceeds 2 seconds THE SYSTEM SHALL show the incumbent solution and MIP gap at that point, demonstrating that "good enough" is often available quickly
4. WHEN demonstrating time limits THE SYSTEM SHALL show a "Stop at 5% gap" toggle that terminates the solve early and shows the sub-optimal-but-feasible solution

### Requirement 4: Formulation tightness

**User Story:** As an engineer, I want to see why formulation quality matters more than solver tuning, so that I invest my time in better models rather than better parameters.

#### Acceptance Criteria

1. WHEN two different formulations of the same problem are presented (tight vs. weak) THE SYSTEM SHALL solve both and show the LP relaxation gap for each
2. WHEN the tight formulation has a smaller gap THE SYSTEM SHALL show it solving faster (fewer B&B nodes) and explain: "A tighter formulation gives the solver less room to waste time"
