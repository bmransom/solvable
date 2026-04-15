# Implementation Plan

- [ ] 1. Build the geometry engine — core polygon computation
  - Create `web/src/geometry.ts`
  - Implement constraint-to-line conversion (handle vertical lines, horizontal lines)
  - Implement pairwise intersection point computation
  - Implement viewport auto-scaling from intersection points, optimal point, and origin
  - Implement Sutherland-Hodgman polygon clipping against the viewport bounding box
  - Implement feasible polygon computation: filter intersection points + viewport corners, order by angle
  - Write unit tests for bounded regions: triangle (3 constraints), quadrilateral (4 constraints)
  - Write unit tests for unbounded regions: verify clipping produces correct viewport-bounded polygon
  - Write unit tests for edge cases: parallel constraints, single-point feasible region, infeasible (empty polygon)
  - _Requirements: VIZ-1.1, VIZ-1.2, VIZ-1.3, VIZ-1.4, VIZ-1.7_

- [ ] 2. Add alternative optima detection
  - Implement optimal edge detection: compare objective gradient angle to binding constraint normals
  - When angles match (within tolerance), compute the optimal edge segment between adjacent feasible vertices
  - Return `optimal_edge` in `PlotData` alongside `optimal_point`
  - Write unit tests: model with parallel iso-profit line and binding constraint → edge detected
  - Write unit tests: standard non-degenerate model → no edge, only point
  - _Requirements: VIZ-1.8_

- [ ] 3. Add objective function contour computation
  - Compute the objective gradient direction from coefficients
  - Compute iso-profit line through the optimal point (perpendicular to gradient)
  - Compute improvement direction arrow
  - _Requirements: VIZ-3.1, VIZ-3.2_

- [ ] 4. Build the SVG renderer
  - Create `web/src/svg-renderer.ts`
  - Draw coordinate axes with tick marks and subtle grid
  - Draw constraint lines with distinct colors from a perceptually uniform palette, extending to viewport edges
  - Fill the feasible polygon with semi-transparent shading
  - Draw the optimal point marker with coordinate labels, or optimal edge as a highlighted segment
  - Draw the objective contour (dashed iso-profit line + gradient arrow)
  - Add "unbounded" indicator (arrow at viewport edge) when `is_unbounded` is true
  - Label axes with variable names, positioned to avoid overlap
  - Attach hover handlers to constraint lines: highlight + tooltip with name and equation
  - Attach hover handler to optimal point/edge: tooltip with coordinates and objective value
  - _Requirements: VIZ-1.2, VIZ-1.3, VIZ-1.4, VIZ-1.5, VIZ-1.7, VIZ-1.8, VIZ-2.1, VIZ-2.2, VIZ-2.3, VIZ-3.1, VIZ-3.2_

- [ ] 5. Create the VisualizationPanel Svelte component
  - Create `web/src/VisualizationPanel.svelte`
  - Detect 2-variable models and show/hide the panel
  - Wire model + solution to geometry engine and SVG renderer
  - Handle resize by recomputing viewport and redrawing SVG
  - Show constraint lines without shading for infeasible models with "Infeasible" label
  - _Requirements: VIZ-1.1, VIZ-1.6, VIZ-2.4_

- [ ] 6. Integration testing in browser
  - Load the production mix example (2 variables) and verify the plot renders correctly
  - Verify hovering highlights constraints and shows tooltips
  - Verify the optimal point is correctly positioned
  - Test with an unbounded 2-variable model (verify clipping and "unbounded" indicator)
  - Test with an infeasible 2-variable model (verify constraint lines, no shading, "Infeasible" label)
  - Test with a model that has alternative optima (verify optimal edge highlighting)
  - Test that 3+ variable models hide the visualization
  - _Requirements: VIZ-1.1, VIZ-1.5, VIZ-1.6, VIZ-1.7, VIZ-1.8, VIZ-2.1, VIZ-2.2, VIZ-2.4_
