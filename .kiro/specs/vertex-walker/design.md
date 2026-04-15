# Vertex Walker - Design

## Overview

The vertex walker is a specialized mode of the interactive plot that overlays simplex traversal logic. It uses the geometry engine's vertex enumeration to identify all feasible vertices and their adjacency (shared constraint edges), then lets the student step through the simplex walk. The actual simplex algorithm is not used — instead, vertex enumeration + objective evaluation is sufficient for two-variable problems.

## Architecture

The vertex walker layers on top of the interactive plot:
```
InteractivePlot (base rendering: constraints, feasible region)
        │
        ▼
VertexWalker.svelte (overlay: vertex dots, edge arrows, step controls)
        │
        ▼
VertexGraph (precomputed: vertices, adjacency, objective values, reduced costs)
```

## Components

### VertexGraph (vertex-graph.ts)

**Purpose**: Precompute the feasible vertex graph from the geometry engine output.

**Responsibilities**:
- Enumerate all feasible vertices from constraint intersections
- Build adjacency: two vertices are adjacent if they share all but one binding constraint
- Compute objective value at each vertex
- Compute reduced cost for each edge: (objective at neighbor - objective at current) / edge length
- Identify the optimal vertex (or optimal edge for alternative optima)

```typescript
interface VertexNode {
  index: number;
  coordinates: [number, number];
  objective_value: number;
  binding_constraints: number[];  // indices of constraints binding at this vertex
  is_optimal: boolean;
}

interface VertexEdge {
  from: number;  // vertex index
  to: number;
  objective_improvement: number;  // positive = improving
  shared_constraints: number[];   // constraints binding along this edge
}

interface VertexGraph {
  vertices: VertexNode[];
  edges: VertexEdge[];
  optimal_vertex: number;
}
```

### VertexWalker.svelte

**Purpose**: SVG overlay on the interactive plot showing vertices, edge arrows, and step controls.

**Responsibilities**:
- Draw all feasible vertices as dots (current = large green, visited = medium blue, unvisited = small gray)
- Draw edge arrows from current vertex to neighbors, colored by improvement direction
- Display objective value at current vertex prominently
- Display reduced costs along edges as labels
- "Step" button: animate transition to best improving neighbor
- "Choose Start" mode: click to select starting vertex
- Step counter display

## Animation

Edge-walking animation: when stepping, the "current" indicator moves along the edge SVG path over 400ms using CSS animation or requestAnimationFrame interpolation. The objective value counter updates continuously during the animation.

## Testing Strategy

- **VertexGraph**: Unit tests for a known 3-constraint model — verify correct vertex enumeration, adjacency, objective values
- **Walk logic**: Verify that greedy walk from any starting vertex reaches the optimal
- **Edge cases**: Model with alternative optima (walk stops at either endpoint of the optimal edge), model with only one vertex (immediate optimal)
