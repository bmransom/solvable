import type { PlotModel, PlotConstraint } from "./plot-model";

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  a: number;
  b: number;
  rhs: number;
  operator: "<=" | ">=" | "=";
  constraint_index: number;
}

export interface Viewport {
  x_min: number;
  x_max: number;
  y_min: number;
  y_max: number;
}

export interface PlotGeometry {
  viewport: Viewport;
  constraint_lines: ConstraintLineData[];
  feasible_polygon: Point[];
  vertices: VertexData[];
  optimal_point: Point | null;
  optimal_value: number | null;
  is_infeasible: boolean;
  is_unbounded: boolean;
  unbounded_directions: Point[];
}

export interface ConstraintLineData {
  constraint_index: number;
  name: string;
  color: string;
  enabled: boolean;
  start: Point;
  end: Point;
}

export interface VertexData {
  point: Point;
  binding_constraints: number[];
  objective_value: number;
}

const EPSILON = 1e-8;

export function compute_geometry(
  model: PlotModel,
  solution: { x: number; y: number; objective: number } | null,
): PlotGeometry {
  const active_constraints = model.constraints
    .map((constraint, index) => ({ constraint, index }))
    .filter(({ constraint }) => constraint.enabled);

  // Also add non-negativity constraints (x >= 0, y >= 0)
  const lines: Line[] = [
    ...active_constraints.map(({ constraint, index }) => ({
      a: constraint.coefficients[0],
      b: constraint.coefficients[1],
      rhs: constraint.rhs,
      operator: constraint.operator,
      constraint_index: index,
    })),
    { a: 1, b: 0, rhs: 0, operator: ">=" as const, constraint_index: -1 }, // x >= 0
    { a: 0, b: 1, rhs: 0, operator: ">=" as const, constraint_index: -2 }, // y >= 0
  ];

  // Find all pairwise intersection points
  const intersections: Point[] = [];
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const point = intersect_lines(lines[i], lines[j]);
      if (point) intersections.push(point);
    }
  }

  // Filter to feasible points (satisfy all constraints)
  const feasible_vertices: VertexData[] = [];
  for (const point of intersections) {
    if (is_feasible(point, lines)) {
      const binding = find_binding_constraints(point, lines);
      const obj_val = evaluate_objective(point, model);
      feasible_vertices.push({
        point,
        binding_constraints: binding,
        objective_value: obj_val,
      });
    }
  }

  // Deduplicate vertices (intersections can produce near-duplicates)
  const unique_vertices = deduplicate_vertices(feasible_vertices);

  // Compute viewport
  const viewport = compute_viewport(unique_vertices, solution);

  // Detect unboundedness: check if a test point far along any ray from origin
  // into the first quadrant is feasible (indicating the region extends to infinity)
  const unbounded_info = detect_unboundedness(lines, viewport);

  // Compute feasible polygon by ordering vertices by angle from centroid
  let feasible_polygon: Point[];
  if (unbounded_info.is_unbounded) {
    // Clip the unbounded region to the viewport
    feasible_polygon = compute_clipped_unbounded_polygon(unique_vertices, lines, viewport);
  } else {
    feasible_polygon = compute_feasible_polygon(unique_vertices);
  }

  // Compute constraint line endpoints (clipped to viewport)
  const constraint_lines = compute_constraint_lines(model, viewport);

  // Find optimal point
  let optimal_point: Point | null = null;
  let optimal_value: number | null = null;
  const is_objective_unbounded = unbounded_info.is_unbounded && check_objective_unbounded(model, lines);
  if (is_objective_unbounded) {
    // Objective is unbounded — no finite optimal
    optimal_point = null;
    optimal_value = null;
  } else if (solution) {
    optimal_point = { x: solution.x, y: solution.y };
    optimal_value = solution.objective;
  } else if (unique_vertices.length > 0) {
    const is_max = model.objective.sense === "max";
    let best = unique_vertices[0];
    for (const vertex of unique_vertices) {
      if (is_max ? vertex.objective_value > best.objective_value : vertex.objective_value < best.objective_value) {
        best = vertex;
      }
    }
    optimal_point = best.point;
    optimal_value = best.objective_value;
  }

  return {
    viewport,
    constraint_lines,
    feasible_polygon,
    vertices: unique_vertices,
    optimal_point,
    optimal_value,
    is_infeasible: unique_vertices.length === 0 && !unbounded_info.is_unbounded,
    is_unbounded: unbounded_info.is_unbounded,
    unbounded_directions: unbounded_info.directions,
  };
}

function detect_unboundedness(
  lines: Line[],
  viewport: Viewport,
): { is_unbounded: boolean; directions: Point[] } {
  // Test points at the viewport corners — if any are feasible,
  // the region extends to the viewport boundary (and beyond)
  const test_points: Point[] = [
    { x: viewport.x_max, y: viewport.y_max },
    { x: viewport.x_max, y: 0 },
    { x: 0, y: viewport.y_max },
  ];

  const directions: Point[] = [];
  for (const point of test_points) {
    if (is_feasible(point, lines)) {
      // Normalize direction from origin
      const magnitude = Math.sqrt(point.x * point.x + point.y * point.y);
      if (magnitude > EPSILON) {
        directions.push({ x: point.x / magnitude, y: point.y / magnitude });
      }
    }
  }

  // Also check if any feasible ray extends to infinity by testing
  // a point far beyond the viewport along each unbounded direction
  const far_scale = Math.max(viewport.x_max, viewport.y_max) * 10;
  const confirmed_directions: Point[] = [];
  for (const dir of directions) {
    const far_point = { x: dir.x * far_scale, y: dir.y * far_scale };
    if (is_feasible(far_point, lines)) {
      confirmed_directions.push(dir);
    }
  }

  return {
    is_unbounded: confirmed_directions.length > 0,
    directions: confirmed_directions,
  };
}

function check_objective_unbounded(model: PlotModel, lines: Line[]): boolean {
  // Check if objective can improve indefinitely within the feasible region
  const [a, b] = model.objective.coefficients;
  const is_max = model.objective.sense === "max";
  const scale = 1e6;
  // Test a point far in the objective improvement direction
  const test = {
    x: is_max ? (a > 0 ? scale : 0) : (a < 0 ? scale : 0),
    y: is_max ? (b > 0 ? scale : 0) : (b < 0 ? scale : 0),
  };
  return is_feasible(test, lines);
}

function compute_clipped_unbounded_polygon(
  vertices: VertexData[],
  lines: Line[],
  viewport: Viewport,
): Point[] {
  // Start with the viewport rectangle as a polygon
  let polygon: Point[] = [
    { x: viewport.x_min, y: viewport.y_min },
    { x: viewport.x_max, y: viewport.y_min },
    { x: viewport.x_max, y: viewport.y_max },
    { x: viewport.x_min, y: viewport.y_max },
  ];

  // Clip the viewport polygon by each constraint half-plane (Sutherland-Hodgman)
  for (const line of lines) {
    polygon = clip_polygon_by_halfplane(polygon, line);
    if (polygon.length === 0) break;
  }

  return polygon;
}

function clip_polygon_by_halfplane(polygon: Point[], line: Line): Point[] {
  if (polygon.length === 0) return [];

  const result: Point[] = [];
  for (let i = 0; i < polygon.length; i++) {
    const current = polygon[i];
    const next = polygon[(i + 1) % polygon.length];
    const current_inside = point_in_halfplane(current, line);
    const next_inside = point_in_halfplane(next, line);

    if (current_inside) {
      result.push(current);
      if (!next_inside) {
        const intersection = line_segment_intersection(current, next, line);
        if (intersection) result.push(intersection);
      }
    } else if (next_inside) {
      const intersection = line_segment_intersection(current, next, line);
      if (intersection) result.push(intersection);
    }
  }

  return result;
}

function point_in_halfplane(point: Point, line: Line): boolean {
  const lhs = line.a * point.x + line.b * point.y;
  if (line.operator === "<=") return lhs <= line.rhs + EPSILON;
  if (line.operator === ">=") return lhs >= line.rhs - EPSILON;
  return true; // equality constraints handled separately
}

function line_segment_intersection(p1: Point, p2: Point, line: Line): Point | null {
  const lhs1 = line.a * p1.x + line.b * p1.y - line.rhs;
  const lhs2 = line.a * p2.x + line.b * p2.y - line.rhs;
  const denom = lhs1 - lhs2;
  if (Math.abs(denom) < EPSILON) return null;
  const t = lhs1 / denom;
  return {
    x: p1.x + t * (p2.x - p1.x),
    y: p1.y + t * (p2.y - p1.y),
  };
}

function intersect_lines(line_a: Line, line_b: Line): Point | null {
  const determinant = line_a.a * line_b.b - line_a.b * line_b.a;
  if (Math.abs(determinant) < EPSILON) return null; // parallel

  const x = (line_a.rhs * line_b.b - line_b.rhs * line_a.b) / determinant;
  const y = (line_a.a * line_b.rhs - line_b.a * line_a.rhs) / determinant;

  return { x, y };
}

function is_feasible(point: Point, lines: Line[]): boolean {
  for (const line of lines) {
    const lhs = line.a * point.x + line.b * point.y;
    if (line.operator === "<=") {
      if (lhs > line.rhs + EPSILON) return false;
    } else if (line.operator === ">=") {
      if (lhs < line.rhs - EPSILON) return false;
    } else {
      if (Math.abs(lhs - line.rhs) > EPSILON) return false;
    }
  }
  return true;
}

function find_binding_constraints(point: Point, lines: Line[]): number[] {
  const binding: number[] = [];
  for (const line of lines) {
    const lhs = line.a * point.x + line.b * point.y;
    if (Math.abs(lhs - line.rhs) < EPSILON * 100) {
      binding.push(line.constraint_index);
    }
  }
  return binding;
}

function evaluate_objective(point: Point, model: PlotModel): number {
  return model.objective.coefficients[0] * point.x + model.objective.coefficients[1] * point.y;
}

function deduplicate_vertices(vertices: VertexData[]): VertexData[] {
  const unique: VertexData[] = [];
  for (const vertex of vertices) {
    const is_duplicate = unique.some(
      (existing) =>
        Math.abs(existing.point.x - vertex.point.x) < EPSILON * 100 &&
        Math.abs(existing.point.y - vertex.point.y) < EPSILON * 100,
    );
    if (!is_duplicate) unique.push(vertex);
  }
  return unique;
}

function compute_viewport(vertices: VertexData[], solution: { x: number; y: number } | null): Viewport {
  if (vertices.length === 0) {
    return { x_min: -1, x_max: 12, y_min: -1, y_max: 12 };
  }

  let x_min = 0;
  let x_max = 0;
  let y_min = 0;
  let y_max = 0;

  for (const vertex of vertices) {
    x_max = Math.max(x_max, vertex.point.x);
    y_max = Math.max(y_max, vertex.point.y);
  }

  if (solution) {
    x_max = Math.max(x_max, solution.x);
    y_max = Math.max(y_max, solution.y);
  }

  // Add 25% padding
  const x_range = Math.max(x_max - x_min, 1);
  const y_range = Math.max(y_max - y_min, 1);
  const padding = 0.25;

  return {
    x_min: x_min - x_range * padding,
    x_max: x_max + x_range * padding,
    y_min: y_min - y_range * padding,
    y_max: y_max + y_range * padding,
  };
}

function compute_feasible_polygon(vertices: VertexData[]): Point[] {
  if (vertices.length <= 1) return vertices.map((vertex) => vertex.point);

  // Order vertices by angle from centroid (convex hull ordering)
  const centroid: Point = {
    x: vertices.reduce((sum, vertex) => sum + vertex.point.x, 0) / vertices.length,
    y: vertices.reduce((sum, vertex) => sum + vertex.point.y, 0) / vertices.length,
  };

  const sorted = [...vertices].sort((a, b) => {
    const angle_a = Math.atan2(a.point.y - centroid.y, a.point.x - centroid.x);
    const angle_b = Math.atan2(b.point.y - centroid.y, b.point.x - centroid.x);
    return angle_a - angle_b;
  });

  return sorted.map((vertex) => vertex.point);
}

function compute_constraint_lines(model: PlotModel, viewport: Viewport): ConstraintLineData[] {
  const result: ConstraintLineData[] = [];

  for (let i = 0; i < model.constraints.length; i++) {
    const constraint = model.constraints[i];
    const [a, b] = constraint.coefficients;

    // Find two points where the constraint line intersects the viewport edges
    const line_points = clip_line_to_viewport(a, b, constraint.rhs, viewport);
    if (!line_points) continue;

    result.push({
      constraint_index: i,
      name: constraint.name,
      color: constraint.color,
      enabled: constraint.enabled,
      start: line_points[0],
      end: line_points[1],
    });
  }

  return result;
}

function clip_line_to_viewport(
  a: number,
  b: number,
  rhs: number,
  viewport: Viewport,
): [Point, Point] | null {
  // Line: ax + by = rhs
  // Find intersections with viewport edges
  const candidates: Point[] = [];

  if (Math.abs(b) > EPSILON) {
    // Intersection with x = x_min
    const y_at_x_min = (rhs - a * viewport.x_min) / b;
    if (y_at_x_min >= viewport.y_min - EPSILON && y_at_x_min <= viewport.y_max + EPSILON) {
      candidates.push({ x: viewport.x_min, y: y_at_x_min });
    }
    // Intersection with x = x_max
    const y_at_x_max = (rhs - a * viewport.x_max) / b;
    if (y_at_x_max >= viewport.y_min - EPSILON && y_at_x_max <= viewport.y_max + EPSILON) {
      candidates.push({ x: viewport.x_max, y: y_at_x_max });
    }
  }

  if (Math.abs(a) > EPSILON) {
    // Intersection with y = y_min
    const x_at_y_min = (rhs - b * viewport.y_min) / a;
    if (x_at_y_min >= viewport.x_min - EPSILON && x_at_y_min <= viewport.x_max + EPSILON) {
      candidates.push({ x: x_at_y_min, y: viewport.y_min });
    }
    // Intersection with y = y_max
    const x_at_y_max = (rhs - b * viewport.y_max) / a;
    if (x_at_y_max >= viewport.x_min - EPSILON && x_at_y_max <= viewport.x_max + EPSILON) {
      candidates.push({ x: x_at_y_max, y: viewport.y_max });
    }
  }

  // Deduplicate
  const unique_candidates: Point[] = [];
  for (const point of candidates) {
    if (!unique_candidates.some((existing) => Math.abs(existing.x - point.x) < EPSILON && Math.abs(existing.y - point.y) < EPSILON)) {
      unique_candidates.push(point);
    }
  }

  if (unique_candidates.length < 2) return null;
  return [unique_candidates[0], unique_candidates[1]];
}

// Utility: check if a point satisfies a single constraint
export function point_satisfies_constraint(
  point: Point,
  constraint: PlotConstraint,
): boolean {
  const lhs = constraint.coefficients[0] * point.x + constraint.coefficients[1] * point.y;
  if (constraint.operator === "<=") return lhs <= constraint.rhs + EPSILON;
  if (constraint.operator === ">=") return lhs >= constraint.rhs - EPSILON;
  return Math.abs(lhs - constraint.rhs) < EPSILON;
}

// Utility: evaluate objective at a point
export function evaluate_objective_at(point: Point, model: PlotModel): number {
  return model.objective.coefficients[0] * point.x + model.objective.coefficients[1] * point.y;
}

// Compute iso-profit line endpoints through a point
export function compute_iso_profit_line(
  point: Point,
  model: PlotModel,
  viewport: Viewport,
): [Point, Point] | null {
  const [a, b] = model.objective.coefficients;
  const rhs = a * point.x + b * point.y;
  // iso-profit line: ax + by = rhs (same as constraint line math)
  return clip_line_to_viewport(a, b, rhs, viewport);
}
