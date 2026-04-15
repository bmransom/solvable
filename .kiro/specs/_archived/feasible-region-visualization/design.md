# Feasible Region Visualization - Design

## Overview

The visualization renders a 2D plot of the feasible region for two-variable LP problems using pure SVG. SVG provides DOM-based interactivity (hover, tooltips) for free, and the rendering complexity of LP feasible regions (at most ~20 lines, ~50 intersection points) is well within SVG's performance envelope. The plot is computed from the parsed model constraints and solved solution, not from solver internals.

## Architecture

```
Model (2 vars) + Solution
        │
        ▼
┌──────────────────┐
│  Geometry Engine  │  Compute constraint lines, intersections,
│                   │  feasible polygon (clipped to viewport),
│                   │  optimal point/edge, objective contour
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  SVG Renderer     │  Draw axes, grid, shaded region, lines,
│                   │  optimal point/edge, tooltips, labels
└──────────────────┘
```

## Components and Interfaces

### Geometry Engine (`geometry.ts`)

**Purpose**: Transform model constraints into geometric primitives for rendering.

**Responsibilities**:
- Convert each `ax + by OP c` constraint into a line (slope-intercept or vertical)
- Compute all pairwise constraint intersection points
- Compute viewport bounds first (auto-scale), then clip the feasible region to viewport using Sutherland-Hodgman polygon clipping — this correctly handles unbounded regions by treating viewport edges as additional bounding constraints
- Determine the feasible polygon by: (1) finding all intersection points that satisfy all constraints, (2) adding viewport corner points that are feasible, (3) ordering vertices by angle from centroid
- Detect alternative optima: check if the objective gradient is parallel to a binding constraint at the optimal solution; if so, compute the optimal edge (segment between two adjacent feasible vertices on that constraint)
- Compute the objective gradient direction and iso-profit line through the optimal point

**Interfaces**:
- **Input**: `Model` (constraints + bounds) + `Solution` (optimal point)
- **Output**: `PlotData { lines, feasible_polygon, optimal_point, optimal_edge?, viewport, objective_contour, is_unbounded }`

### Viewport Auto-Scaling

The viewport is computed as:
1. Collect all feasible polygon vertices (before clipping), the optimal point, and the origin
2. Find the bounding box of these points
3. Add 25% padding on each side
4. Ensure the origin is visible if the feasible region is in the first quadrant
5. For unbounded regions: use constraint intersection points + variable bounds to establish a reasonable viewport, then clip the feasible polygon to this viewport
6. If the feasible region is empty (infeasible), use all constraint intersection points for bounds

### Unbounded Region Handling

Many textbook LPs have unbounded feasible regions (e.g., `x >= 0, y >= 0, x + y >= 1`). The geometry engine handles this by:
1. Computing the viewport bounding box first
2. Treating viewport edges as additional constraints for polygon computation
3. Using Sutherland-Hodgman clipping to produce a renderable polygon
4. Adding a visual indicator (arrow or "unbounded" label) at the viewport edge where the region extends to infinity

### Alternative Optima Detection

When the iso-profit line is parallel to a binding constraint, the LP has multiple optimal solutions along an edge. Detection:
1. For each binding constraint (slack = 0), compute the angle of its normal vector
2. Compare with the objective gradient angle
3. If angles match (within tolerance), the optimal set is the edge of the feasible polygon on that constraint
4. Highlight the entire optimal edge rather than a single point

### SVG Renderer (`svg-renderer.ts`)

**Purpose**: Render the plot as an SVG element with built-in interactivity.

**Responsibilities**:
- Draw coordinate axes with tick marks and grid lines
- Draw each constraint line extending to viewport edges, with a distinct color per constraint
- Fill the feasible polygon with a semi-transparent color
- Draw the optimal point marker (filled circle with label) or optimal edge (highlighted segment)
- Draw the objective contour (dashed iso-profit line + gradient arrow)
- Attach hover event handlers directly to SVG elements for tooltips
- Label axes with variable names

**Interactive features** (free via SVG DOM events):
- Hover over constraint line → highlight + tooltip with name and equation
- Hover over optimal point/edge → tooltip with coordinates and objective value
- All labels positioned to avoid overlap

### VisualizationPanel.svelte

**Purpose**: Svelte component that hosts the SVG and manages resize behavior.

**Responsibilities**:
- Detect if model has exactly 2 variables; show/hide panel accordingly
- Pass model and solution to geometry engine on solve
- Render SVG via the SVG renderer
- Handle window resize by recomputing viewport and redrawing
- Show constraint lines without shading for infeasible models with "Infeasible" label
- Show "unbounded" indicator when the feasible region extends beyond the viewport

## Color Scheme

- Each constraint line gets a unique color from a perceptually uniform palette
- Feasible region: semi-transparent blue (#3B82F6 at 20% opacity)
- Optimal point: solid red circle with white border
- Optimal edge (alternative optima): thick red line segment
- Objective contour: dashed gray line
- Grid lines: subtle gray
- Axes: black

## Testing Strategy

- **Geometry engine**: Unit tests verifying polygon computation for known models:
  - Bounded triangle feasible region → 3 vertices
  - Bounded quadrilateral → 4 vertices
  - Unbounded region (x >= 0, y >= 0, x + y >= 1) → polygon clipped to viewport with correct vertices
  - Infeasible model → empty polygon
  - Alternative optima → optimal edge detected and returned
- **Viewport**: Test auto-scaling produces reasonable bounds for various model shapes
- **Degenerate cases**: Test with parallel constraints, single-point feasible region, redundant constraints
- **Visual**: Manual browser testing comparing rendered plots against hand-drawn diagrams for the example corpus
