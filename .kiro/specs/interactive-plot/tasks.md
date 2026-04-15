# Implementation Plan

- [ ] 1. Build the geometry engine
  - Enhance `web/src/geometry.ts` from the archived spec
  - Constraint-to-line conversion, pairwise intersection, Sutherland-Hodgman clipping
  - Feasible polygon computation with viewport bounding
  - Iso-profit contour line computation
  - Alternative optima detection (gradient parallel to binding constraint)
  - Vertex enumeration for all feasible vertices
  - Unit tests for bounded, unbounded, infeasible, and degenerate cases
  - _Requirements: PLOT-1.1, PLOT-1.2, PLOT-1.3, PLOT-1.4, PLOT-1.5, PLOT-1.7_

- [ ] 2. Build the LP serializer for PlotModel
  - Create `web/src/plot-model.ts` with `PlotModel`, `PlotConstraint`, `SliderConfig` types
  - Implement `serializeToLp(model: PlotModel): string` — convert reactive model to LP format string
  - Write unit tests verifying round-trip: PlotModel → LP string → parse → verify structure matches
  - _Requirements: PLOT-2.1, PLOT-6.2_

- [ ] 3. Build the reactive solve pipeline
  - Create `web/src/reactive-solver.ts` — manages debounced/throttled solve cycle
  - On model change: serialize → solve via worker → extract results → emit state update
  - Use `requestAnimationFrame` throttling for drag interactions
  - Implement fallback: direct vertex enumeration on main thread for models under 10 constraints (avoid worker round-trip latency for small interactive models)
  - _Requirements: PLOT-2.1, PLOT-6.2, PLOT-6.3_

- [ ] 4. Build the SVG renderer and InteractivePlot.svelte
  - Create `web/src/InteractivePlot.svelte` with SVG layered rendering
  - Render: grid, axes, constraint lines, feasible polygon, optimal point, labels
  - Implement viewport auto-scaling with padding
  - Handle high-DPI via SVG viewBox (automatic)
  - Apply color scheme from design doc
  - _Requirements: PLOT-1.1, PLOT-1.2, PLOT-1.3, PLOT-1.6_

- [ ] 5. Implement constraint line dragging
  - Add mousedown/mousemove/mouseup handlers to constraint line SVG elements
  - Compute new RHS from mouse position relative to constraint normal
  - Snap to grid for clean values
  - Display updated RHS value alongside constraint during drag
  - Trigger reactive solve on each drag frame
  - Show grab cursor and highlight on hover
  - _Requirements: PLOT-2.1, PLOT-2.2, PLOT-2.3, PLOT-2.4_

- [ ] 6. Implement objective gradient dragging
  - Draw gradient arrow and iso-profit contour lines
  - Add drag handler to gradient arrow: track angular displacement
  - Compute new objective coefficients from angle, re-solve
  - Highlight alternative optima when gradient aligns with binding constraint
  - _Requirements: PLOT-3.1, PLOT-3.2, PLOT-3.3, PLOT-3.4_

- [ ] 7. Implement point exploration
  - Draw an explorer point (white circle) that can be dragged anywhere on the plot
  - On drag: compute coordinates, evaluate feasibility against each constraint, compute objective value
  - Highlight violated constraints in red
  - Show "Optimal!" indicator when at the optimal vertex
  - Show objective gap when at a feasible non-optimal point
  - _Requirements: PLOT-4.1, PLOT-4.2, PLOT-4.3, PLOT-4.4_

- [ ] 8. Implement constraint toggling
  - Add a legend panel with checkboxes for each constraint
  - Toggle constraint `enabled` flag, re-solve
  - Show disabled constraints as dashed gray lines
  - _Requirements: PLOT-5.1, PLOT-5.2, PLOT-5.3_

- [ ] 9. Implement parameter sliders
  - Create `ParameterSlider.svelte` component
  - Render labeled sliders below the plot based on `SliderConfig`
  - Wire slider value changes to model mutation → reactive solve
  - Animate feasible region and optimal point transitions smoothly via CSS transitions on SVG elements
  - _Requirements: PLOT-6.1, PLOT-6.2, PLOT-6.3, PLOT-6.4_

- [ ] 10. Integration testing in browser
  - Load a production mix model in the interactive plot
  - Drag a constraint line, verify feasible region reshapes and optimal point moves
  - Drag the gradient arrow, verify optimal vertex changes
  - Drag the explorer point, verify feasibility feedback
  - Toggle constraints, verify region updates
  - Use sliders to sweep a parameter into infeasibility, verify status change
  - _Requirements: PLOT-1.1, PLOT-2.1, PLOT-3.3, PLOT-4.1, PLOT-5.2, PLOT-6.4_
