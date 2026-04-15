# Implementation Plan

- [ ] 1. Build the vertex graph computation
  - Create `web/src/vertex-graph.ts` with `VertexNode`, `VertexEdge`, `VertexGraph` types
  - Implement vertex enumeration from geometry engine's constraint intersection points
  - Implement adjacency computation: vertices sharing all but one binding constraint
  - Compute objective value and reduced cost for each vertex and edge
  - Unit tests for a 3-constraint model: verify vertex count, adjacency, objective values
  - Unit tests for alternative optima: verify two optimal vertices connected by an edge
  - _Requirements: WALK-1.1, WALK-2.1, WALK-2.2_

- [ ] 2. Build the VertexWalker Svelte component
  - Create `web/src/VertexWalker.svelte` as an SVG overlay component
  - Render all feasible vertices as dots with size/color encoding (current, visited, unvisited)
  - Render edge arrows from current vertex to neighbors, colored by improvement
  - Display objective value at current vertex
  - Display reduced costs as edge labels
  - _Requirements: WALK-1.1, WALK-1.4, WALK-2.1_

- [ ] 3. Implement step-through logic and animation
  - "Step" button: find best improving neighbor, animate along the edge, update current vertex
  - Edge-walking animation over 400ms
  - Detect optimality: stop when no improving neighbor exists, show "Optimal" message
  - Step counter
  - _Requirements: WALK-1.2, WALK-1.3_

- [ ] 4. Implement starting vertex selection
  - "Choose Start" button enables click-to-select on any feasible vertex
  - Track steps taken from each starting point
  - Display "Reached optimal in N steps" on completion
  - _Requirements: WALK-3.1, WALK-3.2, WALK-3.3_

- [ ] 5. Implement click-to-inspect on non-current vertices
  - Click a vertex to show its objective value and comparison to current
  - Explain that simplex can only walk edges, not jump to arbitrary vertices
  - _Requirements: WALK-1.5_

- [ ] 6. Write Chapter 3 lesson content integrating vertex walker
  - Lesson 1: "The Solver's Strategy" — introduce the walking metaphor, first step-through
  - Lesson 2: "Why Corners?" — connect vertex optimality to the LP theorem
  - Lesson 3: "Reduced Costs: Which Way to Go?" — explain reduced costs via edge labels
  - Lesson 4 (Go Deeper): "This is the simplex method" — reveal the connection
  - _Requirements: WALK-1.1, WALK-2.1, WALK-2.3, WALK-3.3_
