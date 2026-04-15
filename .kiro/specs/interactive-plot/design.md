# Interactive Plot - Design

## Overview

The interactive plot is a pure SVG component with reactive re-solving. All user interactions (drag constraint, drag point, move slider) trigger a model update → parse → solve pipeline that completes within 50ms for two-variable problems. The plot is the most technically demanding component: it combines computational geometry, direct manipulation UX, and real-time solver integration.

## Architecture

```
User Interaction (drag/slider)
        │
        ▼
┌──────────────────┐
│  Model Mutator    │  Update constraint RHS, objective coefficients, etc.
│  (reactive)       │  from interaction deltas
└────────┬─────────┘
         │
         ▼
┌──────────────────┐      ┌──────────────────┐
│  LP Serializer    │─────▶│  HiGHS (worker)  │
│  (model → string) │      │  Solve + extract  │
└──────────────────┘      └────────┬─────────┘
                                   │
         ┌─────────────────────────┘
         ▼
┌──────────────────┐
│  Geometry Engine  │  Constraint lines, polygon, vertices,
│                   │  viewport, iso-profit contour
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│  SVG Renderer     │  Reactive SVG elements with
│  (Svelte)         │  drag handlers, tooltips, labels
└──────────────────┘
```

## Components

### InteractivePlot.svelte

**Purpose**: The top-level plot component, used as an interactive block in lessons.

**Props**:
```typescript
interface PlotConfig {
  model: PlotModel;                    // Initial model definition
  allow_drag_constraints: boolean;     // Enable constraint line dragging
  allow_drag_objective: boolean;       // Enable objective arrow dragging
  allow_drag_point: boolean;           // Enable free point exploration
  allow_toggle_constraints: boolean;   // Enable constraint checkboxes
  sliders?: SliderConfig[];            // Parameter sliders
  show_objective_contour: boolean;     // Show iso-profit lines
  show_gradient_arrow: boolean;        // Show objective direction arrow
  show_vertex_labels: boolean;         // Label feasible vertices
  highlight_optimal: boolean;          // Highlight optimal point/edge
  on_state_change?: (state: PlotState) => void;  // Callback for lesson integration
}
```

### PlotModel (reactive model)

A mutable model representation optimized for interactive manipulation. Not the same as the parser's `Model` — this is a live, reactive object.

```typescript
interface PlotModel {
  variables: [string, string];  // exactly 2 variable names
  objective: { coefficients: [number, number]; sense: "max" | "min" };
  constraints: PlotConstraint[];
}

interface PlotConstraint {
  name: string;
  coefficients: [number, number];  // [a, b] for ax + by
  operator: "<=" | ">=" | "=";
  rhs: number;
  enabled: boolean;
  color: string;
}

interface SliderConfig {
  label: string;
  target: { type: "rhs"; constraint_index: number } | { type: "objective"; variable_index: number } | { type: "bound"; variable: string; bound: "lower" | "upper" };
  min: number;
  max: number;
  step: number;
}
```

### Geometry Engine (geometry.ts — enhanced from archived spec)

Same responsibilities as the archived feasible-region-visualization spec, plus:
- Compute constraint line equations and viewport intersection points
- Sutherland-Hodgman polygon clipping for unbounded regions
- Detect alternative optima (gradient parallel to binding constraint)
- Compute iso-profit contour lines at regular intervals
- Compute all feasible vertices for vertex-walker integration

### Reactive Solve Pipeline

For interactive performance (<50ms round-trip):

1. **On interaction**: Update the `PlotModel` in-place
2. **Serialize**: Convert `PlotModel` to LP format string (fast — string concatenation)
3. **Solve**: Pass LP string to `highs-js` in the Web Worker
4. **Extract**: Pull variable values, objective, and constraint activity from solution
5. **Recompute geometry**: Update polygon, optimal point, constraint activity
6. **Render**: Svelte reactivity updates the SVG

For drag interactions, use `requestAnimationFrame` throttling to avoid overwhelming the solver. The solver runs in a Web Worker, so the main thread stays responsive even if a solve takes longer than expected.

**Optimization for small models**: Two-variable LPs solve in <5ms in HiGHS. The bottleneck is the Web Worker message round-trip (~2-5ms). For drag interactions, consider keeping a synchronous fallback solver on the main thread for models under 10 constraints — the geometry engine can solve 2-variable LPs directly by vertex enumeration.

### SVG Structure

```svg
<svg>
  <g class="grid">          <!-- Axis grid lines -->
  <g class="constraints">   <!-- Constraint lines (draggable) -->
  <g class="feasible">      <!-- Filled feasible polygon -->
  <g class="contours">      <!-- Iso-profit dashed lines -->
  <g class="gradient">      <!-- Objective direction arrow (draggable) -->
  <g class="vertices">      <!-- Vertex dots -->
  <g class="optimal">       <!-- Optimal point/edge highlight -->
  <g class="explorer">      <!-- Draggable exploration point -->
  <g class="labels">        <!-- Axis labels, coordinates, values -->
</svg>
```

Each group is a Svelte component with its own event handlers. SVG provides hit testing for free via DOM events.

### Direct Manipulation Implementation

**Constraint dragging**: On mousedown on a constraint line, compute the perpendicular distance from mouse to line. On mousemove, compute the new RHS that would place the line at the mouse position. Snap to a grid for clean values.

**Gradient dragging**: On mousedown on the gradient arrow, track angular displacement. On mousemove, compute new objective coefficients from the angle. Normalize to unit length.

**Point exploration**: On mousedown on the explorer point (or anywhere on the plot), move the point to the mouse position. Compute feasibility by checking each constraint. Compute objective value.

## Color Scheme

- Constraint lines: perceptually uniform palette (8 distinct colors)
- Feasible region: blended tint of active constraint colors at 15% opacity
- Optimal point: bright green (#51cf66)
- Optimal edge (alternative optima): thick green line
- Infeasible point: red (#fa5252)
- Iso-profit contours: dashed gray
- Gradient arrow: white with arrowhead
- Explorer point: white circle with border
- Violated constraints: pulsing red highlight

## Testing Strategy

- **Geometry engine**: Unit tests for polygon computation (bounded, unbounded, infeasible, degenerate)
- **Serialization**: Unit tests for PlotModel → LP string → parse → verify structure
- **Reactive solve**: Integration test: change RHS, verify optimal point moves correctly
- **Drag behavior**: Manual browser testing for responsiveness and correctness
- **Edge cases**: Parallel constraints, single-point feasible region, zero-coefficient constraints
