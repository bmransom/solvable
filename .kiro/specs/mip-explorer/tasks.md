# Implementation Plan

- [ ] 1. Build the pedagogical branch-and-bound solver
  - Create `web/src/branch-and-bound.ts` with `BranchAndBoundNode` types
  - Implement LP relaxation solving at each node via `highs-js`
  - Implement branching on most fractional variable
  - Implement pruning: infeasible, bounded (worse than incumbent), integer-feasible
  - Implement step-by-step mode: `step()` returns next node
  - Unit tests: solve a 5-item knapsack, verify optimal matches `highs-js` MIP solution
  - Unit tests: verify pruning occurs (at least one node is pruned by bound)
  - _Requirements: MIP-2.1, MIP-2.2, MIP-2.3, MIP-2.5_

- [ ] 2. Build the LP relaxation comparison visualization
  - Create `web/src/RelaxationComparison.svelte`
  - Render integer lattice within the feasible region
  - Solve LP relaxation and mark fractional optimum
  - Solve MIP and mark integer optimum
  - Show "nearest integer" point and highlight when it's not optimal
  - Draw gap line between LP and integer optima
  - _Requirements: MIP-1.1, MIP-1.2, MIP-1.3, MIP-1.4, MIP-1.5_

- [ ] 3. Build the branch-and-bound tree visualization
  - Create `web/src/BranchAndBoundTree.svelte`
  - Horizontal tree layout with recursive positioning
  - Render nodes as rounded rectangles with branching decision, bound, status
  - "Step" button to expand one node at a time
  - Incumbent / bound / gap display above the tree
  - Pruned nodes shown as grayed-out with strikethrough
  - _Requirements: MIP-2.1, MIP-2.2, MIP-2.3, MIP-2.4, MIP-2.5_

- [ ] 4. Build the solve time chart
  - Create `web/src/SolveTimeChart.svelte`
  - Parameterized knapsack generator: create N-item knapsack LP strings
  - Solve each size via Web Worker, record times
  - Render bar chart with log-scale Y-axis
  - Show 2-second production latency line
  - Show incumbent/gap for solves exceeding 2 seconds
  - "Stop at 5% gap" toggle
  - _Requirements: MIP-3.1, MIP-3.2, MIP-3.3, MIP-3.4_

- [ ] 5. Build formulation tightness comparison
  - Create two formulations of the same knapsack (standard vs. cover inequality tightened)
  - Solve both, compare LP relaxation gaps and B&B node counts
  - Display side-by-side comparison
  - _Requirements: MIP-4.1, MIP-4.2_

- [ ] 6. Write Chapter 6 lesson content
  - Lesson 1: "Rounding Doesn't Work" — relaxation comparison visualization
  - Lesson 2: "How the Solver Searches" — B&B tree step-through
  - Lesson 3: "The Exponential Wall" — solve time chart with variable slider
  - Lesson 4: "Good Enough: Time Limits and MIP Gaps" — incumbent + gap + early stopping
  - Lesson 5 (Go Deeper): "Formulation Tightness" — tight vs. weak comparison
  - _Requirements: MIP-1.1, MIP-2.1, MIP-3.1, MIP-3.4, MIP-4.1_
