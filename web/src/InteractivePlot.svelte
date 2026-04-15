<script lang="ts">
  import { onMount } from "svelte";
  import type { PlotModel, PlotConstraint } from "./plot-model";
  import {
    compute_geometry,
    compute_iso_profit_line,
    evaluate_objective_at,
    point_satisfies_constraint,
    type PlotGeometry,
    type Point,
    type Viewport,
  } from "./geometry";

  interface Props {
    model: PlotModel;
    allow_drag_constraints: boolean;
    allow_drag_objective: boolean;
    allow_drag_point: boolean;
    allow_toggle_constraints: boolean;
    show_objective_contour: boolean;
    show_gradient_arrow: boolean;
    show_vertex_labels: boolean;
    highlight_optimal: boolean;
    show_integer_lattice?: boolean;
    sliders?: unknown[];
  }

  let {
    model: initial_model,
    allow_drag_constraints,
    allow_drag_objective,
    allow_drag_point,
    allow_toggle_constraints,
    show_objective_contour,
    show_gradient_arrow,
    show_vertex_labels,
    highlight_optimal,
    show_integer_lattice = false,
  }: Props = $props();

  // Mutable copy of the model for interactive manipulation
  // Use JSON round-trip instead of structuredClone because Svelte 5 $state proxies can't be cloned
  let model: PlotModel = $state(JSON.parse(JSON.stringify(initial_model)));
  let geometry: PlotGeometry = $state(compute_geometry(model, null));

  // Explorer point state
  let explorer_point: Point | null = $state(null);
  let is_dragging_explorer = $state(false);

  // Constraint dragging state
  let dragging_constraint_index: number | null = $state(null);
  let hovered_constraint_index: number | null = $state(null);

  // SVG dimensions
  const SVG_WIDTH = 600;
  const SVG_HEIGHT = 480;
  const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
  const PLOT_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const PLOT_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  let svg_element: SVGSVGElement;

  // Recompute geometry when model changes
  $effect(() => {
    geometry = compute_geometry(model, null);
  });

  // Coordinate transforms
  function to_svg_x(data_x: number): number {
    const viewport = geometry.viewport;
    return MARGIN.left + ((data_x - viewport.x_min) / (viewport.x_max - viewport.x_min)) * PLOT_WIDTH;
  }

  function to_svg_y(data_y: number): number {
    const viewport = geometry.viewport;
    return MARGIN.top + PLOT_HEIGHT - ((data_y - viewport.y_min) / (viewport.y_max - viewport.y_min)) * PLOT_HEIGHT;
  }

  function from_svg(svg_x: number, svg_y: number): Point {
    const viewport = geometry.viewport;
    return {
      x: viewport.x_min + ((svg_x - MARGIN.left) / PLOT_WIDTH) * (viewport.x_max - viewport.x_min),
      y: viewport.y_min + ((MARGIN.top + PLOT_HEIGHT - svg_y) / PLOT_HEIGHT) * (viewport.y_max - viewport.y_min),
    };
  }

  // Generate grid tick values
  function generate_ticks(range_min: number, range_max: number, target_count: number): number[] {
    const range = range_max - range_min;
    const raw_step = range / target_count;
    const magnitude = Math.pow(10, Math.floor(Math.log10(raw_step)));
    const nice_steps = [1, 2, 5, 10];
    const step = nice_steps.find((s) => s * magnitude >= raw_step)! * magnitude;

    const ticks: number[] = [];
    const start = Math.ceil(range_min / step) * step;
    for (let value = start; value <= range_max; value += step) {
      if (Math.abs(value) < 1e-10) value = 0;
      ticks.push(value);
    }
    return ticks;
  }

  // Polygon path from points
  function polygon_path(points: Point[]): string {
    if (points.length === 0) return "";
    return points.map((point, index) => `${index === 0 ? "M" : "L"} ${to_svg_x(point.x)} ${to_svg_y(point.y)}`).join(" ") + " Z";
  }

  // Constraint drag: start
  function handle_constraint_mousedown(event: MouseEvent, constraint_index: number) {
    if (!allow_drag_constraints) return;
    event.stopPropagation();
    dragging_constraint_index = constraint_index;
  }

  // Explorer point interactions
  function handle_plot_mousedown(event: MouseEvent) {
    if (allow_drag_point) {
      const rect = svg_element.getBoundingClientRect();
      const svg_x = event.clientX - rect.left;
      const svg_y = event.clientY - rect.top;
      explorer_point = from_svg(svg_x, svg_y);
      is_dragging_explorer = true;
    }
  }

  function handle_plot_mousemove(event: MouseEvent) {
    const rect = svg_element.getBoundingClientRect();
    const svg_x = event.clientX - rect.left;
    const svg_y = event.clientY - rect.top;

    if (dragging_constraint_index !== null && allow_drag_constraints) {
      // Compute new RHS from mouse position
      const data_point = from_svg(svg_x, svg_y);
      const constraint = model.constraints[dragging_constraint_index];
      const [a, b] = constraint.coefficients;
      const new_rhs = a * data_point.x + b * data_point.y;
      // Snap to 0.5 increments for clean values
      const snapped_rhs = Math.round(new_rhs * 2) / 2;
      model.constraints[dragging_constraint_index].rhs = snapped_rhs;
      model = { ...model };
      return;
    }

    if (is_dragging_explorer && allow_drag_point) {
      explorer_point = from_svg(svg_x, svg_y);
    }
  }

  function handle_plot_mouseup() {
    is_dragging_explorer = false;
    dragging_constraint_index = null;
  }

  // Constraint toggle
  function toggle_constraint(index: number) {
    model.constraints[index].enabled = !model.constraints[index].enabled;
    model = { ...model }; // trigger reactivity
  }

  // Derived values
  const x_ticks = $derived(generate_ticks(geometry.viewport.x_min, geometry.viewport.x_max, 8));
  const y_ticks = $derived(generate_ticks(geometry.viewport.y_min, geometry.viewport.y_max, 6));

  const explorer_objective = $derived(
    explorer_point ? evaluate_objective_at(explorer_point, model) : null,
  );

  const explorer_is_feasible = $derived.by(() => {
    if (!explorer_point) return true;
    return model.constraints.every(
      (constraint) => !constraint.enabled || point_satisfies_constraint(explorer_point!, constraint),
    );
  });

  const violated_constraints = $derived.by(() => {
    if (!explorer_point) return [];
    return model.constraints
      .map((constraint, index) => ({ constraint, index }))
      .filter(({ constraint }) => constraint.enabled && !point_satisfies_constraint(explorer_point!, constraint))
      .map(({ index }) => index);
  });

  const iso_profit_endpoints = $derived.by(() => {
    if (!show_objective_contour || !geometry.optimal_point) return null;
    return compute_iso_profit_line(geometry.optimal_point, model, geometry.viewport);
  });

  const gradient_arrow = $derived.by(() => {
    if (!show_gradient_arrow || !geometry.optimal_point) return null;
    const [a, b] = model.objective.coefficients;
    const magnitude = Math.sqrt(a * a + b * b);
    if (magnitude < 1e-10) return null;
    const scale = (geometry.viewport.x_max - geometry.viewport.x_min) * 0.12;
    return {
      start: geometry.optimal_point,
      end: {
        x: geometry.optimal_point.x + (a / magnitude) * scale,
        y: geometry.optimal_point.y + (b / magnitude) * scale,
      },
    };
  });

  // Integer lattice points within the viewport
  const integer_lattice_points = $derived.by(() => {
    if (!show_integer_lattice) return [];
    const viewport = geometry.viewport;
    const points: Array<{ x: number; y: number; feasible: boolean; objective: number }> = [];
    const x_start = Math.max(0, Math.ceil(viewport.x_min));
    const x_end = Math.floor(viewport.x_max);
    const y_start = Math.max(0, Math.ceil(viewport.y_min));
    const y_end = Math.floor(viewport.y_max);

    for (let ix = x_start; ix <= x_end; ix++) {
      for (let iy = y_start; iy <= y_end; iy++) {
        const point = { x: ix, y: iy };
        const feasible = model.constraints.every(
          (c) => !c.enabled || point_satisfies_constraint(point, c)
        );
        const objective = evaluate_objective_at(point, model);
        points.push({ ...point, feasible, objective });
      }
    }
    return points;
  });

  // Best integer feasible point
  const best_integer_point = $derived.by(() => {
    const feasible_points = integer_lattice_points.filter((p) => p.feasible);
    if (feasible_points.length === 0) return null;
    const is_max = model.objective.sense === "max";
    return feasible_points.reduce((best, p) =>
      (is_max ? p.objective > best.objective : p.objective < best.objective) ? p : best
    );
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="interactive-plot">
  <svg
    bind:this={svg_element}
    role="img"
    aria-label="Interactive optimization plot"
    width={SVG_WIDTH}
    height={SVG_HEIGHT}
    viewBox="0 0 {SVG_WIDTH} {SVG_HEIGHT}"
    onmousedown={handle_plot_mousedown}
    onmousemove={handle_plot_mousemove}
    onmouseup={handle_plot_mouseup}
    onmouseleave={handle_plot_mouseup}
    style="cursor: {allow_drag_point ? 'crosshair' : 'default'}"
  >
    <!-- Grid lines -->
    <g class="grid">
      {#each x_ticks as tick}
        <line
          x1={to_svg_x(tick)} y1={MARGIN.top}
          x2={to_svg_x(tick)} y2={MARGIN.top + PLOT_HEIGHT}
          stroke="#1e2030" stroke-width="1"
        />
      {/each}
      {#each y_ticks as tick}
        <line
          x1={MARGIN.left} y1={to_svg_y(tick)}
          x2={MARGIN.left + PLOT_WIDTH} y2={to_svg_y(tick)}
          stroke="#1e2030" stroke-width="1"
        />
      {/each}
    </g>

    <!-- Axes -->
    <line x1={MARGIN.left} y1={to_svg_y(0)} x2={MARGIN.left + PLOT_WIDTH} y2={to_svg_y(0)} stroke="#3a3f52" stroke-width="1.5" />
    <line x1={to_svg_x(0)} y1={MARGIN.top} x2={to_svg_x(0)} y2={MARGIN.top + PLOT_HEIGHT} stroke="#3a3f52" stroke-width="1.5" />

    <!-- Axis labels -->
    {#each x_ticks as tick}
      <text x={to_svg_x(tick)} y={MARGIN.top + PLOT_HEIGHT + 18} text-anchor="middle" fill="#495162" font-size="11">{tick}</text>
    {/each}
    {#each y_ticks as tick}
      <text x={MARGIN.left - 8} y={to_svg_y(tick) + 4} text-anchor="end" fill="#495162" font-size="11">{tick}</text>
    {/each}

    <!-- Axis names -->
    <text x={MARGIN.left + PLOT_WIDTH / 2} y={SVG_HEIGHT - 4} text-anchor="middle" fill="#6b7084" font-size="13" font-weight="500">{model.variables[0]}</text>
    <text x={14} y={MARGIN.top + PLOT_HEIGHT / 2} text-anchor="middle" fill="#6b7084" font-size="13" font-weight="500" transform="rotate(-90, 14, {MARGIN.top + PLOT_HEIGHT / 2})">{model.variables[1]}</text>

    <!-- Feasible region polygon -->
    {#if geometry.feasible_polygon.length > 0}
      <path
        d={polygon_path(geometry.feasible_polygon)}
        fill="#4c6ef5"
        fill-opacity="0.12"
        stroke="#4c6ef5"
        stroke-opacity="0.3"
        stroke-width="1"
      />
    {/if}

    <!-- Integer lattice points -->
    {#if show_integer_lattice}
      {#each integer_lattice_points as point}
        <circle
          cx={to_svg_x(point.x)}
          cy={to_svg_y(point.y)}
          r={point.feasible ? 4 : 2}
          fill={point.feasible ? "#e5c07b" : "#2a2d3a"}
          opacity={point.feasible ? 0.9 : 0.4}
        />
      {/each}
      <!-- Best integer point -->
      {#if best_integer_point}
        <circle
          cx={to_svg_x(best_integer_point.x)}
          cy={to_svg_y(best_integer_point.y)}
          r="7"
          fill="#e5c07b"
          stroke="white"
          stroke-width="2"
        />
        <text
          x={to_svg_x(best_integer_point.x) - 12}
          y={to_svg_y(best_integer_point.y) - 12}
          fill="#e5c07b"
          font-size="11"
          font-weight="600"
          text-anchor="end"
        >
          best integer ({best_integer_point.x}, {best_integer_point.y}) = {best_integer_point.objective.toFixed(1)}
        </text>
      {/if}
    {/if}

    <!-- Constraint lines -->
    {#each geometry.constraint_lines as line}
      <!-- Visible line -->
      <line
        x1={to_svg_x(line.start.x)} y1={to_svg_y(line.start.y)}
        x2={to_svg_x(line.end.x)} y2={to_svg_y(line.end.y)}
        stroke={line.enabled ? line.color : "#2a2d3a"}
        stroke-width={line.enabled ? (hovered_constraint_index === line.constraint_index && allow_drag_constraints ? 4 : 2) : 1}
        stroke-dasharray={line.enabled ? "none" : "6,4"}
        opacity={line.enabled ? 0.8 : 0.3}
      />
      <!-- Wide invisible hit target for dragging -->
      {#if allow_drag_constraints && line.enabled}
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <line
          x1={to_svg_x(line.start.x)} y1={to_svg_y(line.start.y)}
          x2={to_svg_x(line.end.x)} y2={to_svg_y(line.end.y)}
          stroke="transparent"
          stroke-width="14"
          style="cursor: grab"
          onmousedown={(e) => handle_constraint_mousedown(e, line.constraint_index)}
          onmouseenter={() => (hovered_constraint_index = line.constraint_index)}
          onmouseleave={() => { if (dragging_constraint_index === null) hovered_constraint_index = null; }}
        />
      {/if}
      <!-- Constraint label with RHS value -->
      {#if line.enabled}
        <text
          x={(to_svg_x(line.start.x) + to_svg_x(line.end.x)) / 2 + 8}
          y={(to_svg_y(line.start.y) + to_svg_y(line.end.y)) / 2 - 8}
          fill={line.color}
          font-size="11"
          font-weight="500"
          opacity="0.7"
        >{line.name}{allow_drag_constraints ? ` ≤ ${model.constraints[line.constraint_index]?.rhs}` : ""}</text>
      {/if}
    {/each}

    <!-- Iso-profit contour lines -->
    {#if iso_profit_endpoints}
      <line
        x1={to_svg_x(iso_profit_endpoints[0].x)} y1={to_svg_y(iso_profit_endpoints[0].y)}
        x2={to_svg_x(iso_profit_endpoints[1].x)} y2={to_svg_y(iso_profit_endpoints[1].y)}
        stroke="#e1e4eb"
        stroke-width="1"
        stroke-dasharray="4,4"
        opacity="0.4"
      />
    {/if}

    <!-- Gradient arrow -->
    {#if gradient_arrow}
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" fill="#e1e4eb" opacity="0.7" />
        </marker>
      </defs>
      <line
        x1={to_svg_x(gradient_arrow.start.x)} y1={to_svg_y(gradient_arrow.start.y)}
        x2={to_svg_x(gradient_arrow.end.x)} y2={to_svg_y(gradient_arrow.end.y)}
        stroke="#e1e4eb"
        stroke-width="2"
        opacity="0.7"
        marker-end="url(#arrowhead)"
      />
    {/if}

    <!-- Vertex dots -->
    {#if show_vertex_labels}
      {#each geometry.vertices as vertex}
        <circle
          cx={to_svg_x(vertex.point.x)}
          cy={to_svg_y(vertex.point.y)}
          r="4"
          fill="#6b7084"
          stroke="#0f1117"
          stroke-width="1.5"
        />
      {/each}
    {/if}

    <!-- Optimal point -->
    {#if highlight_optimal && geometry.optimal_point}
      <circle
        cx={to_svg_x(geometry.optimal_point.x)}
        cy={to_svg_y(geometry.optimal_point.y)}
        r="7"
        fill="#51cf66"
        stroke="white"
        stroke-width="2"
      />
      <text
        x={to_svg_x(geometry.optimal_point.x) + 12}
        y={to_svg_y(geometry.optimal_point.y) - 10}
        fill="#51cf66"
        font-size="12"
        font-weight="600"
      >
        ({geometry.optimal_point.x.toFixed(1)}, {geometry.optimal_point.y.toFixed(1)})
      </text>
      {#if geometry.optimal_value !== null}
        <text
          x={to_svg_x(geometry.optimal_point.x) + 12}
          y={to_svg_y(geometry.optimal_point.y) + 6}
          fill="#51cf66"
          font-size="11"
          opacity="0.8"
        >
          obj = {geometry.optimal_value.toFixed(1)}
        </text>
      {/if}
    {/if}

    <!-- Explorer point -->
    {#if allow_drag_point && explorer_point}
      <circle
        cx={to_svg_x(explorer_point.x)}
        cy={to_svg_y(explorer_point.y)}
        r="6"
        fill={explorer_is_feasible ? "white" : "#fa5252"}
        stroke={explorer_is_feasible ? "#4c6ef5" : "#fa5252"}
        stroke-width="2"
        style="cursor: grab"
      />
      <!-- Explorer info -->
      <text
        x={to_svg_x(explorer_point.x) + 12}
        y={to_svg_y(explorer_point.y) - 8}
        fill={explorer_is_feasible ? "#e1e4eb" : "#fa5252"}
        font-size="11"
        font-weight="500"
      >
        ({explorer_point.x.toFixed(1)}, {explorer_point.y.toFixed(1)})
        {#if explorer_objective !== null}
          — profit: {explorer_objective.toFixed(1)}
        {/if}
      </text>
      {#if !explorer_is_feasible}
        <text
          x={to_svg_x(explorer_point.x) + 12}
          y={to_svg_y(explorer_point.y) + 6}
          fill="#fa5252"
          font-size="10"
        >
          infeasible
        </text>
      {/if}
    {/if}

    <!-- Infeasible indicator -->
    {#if geometry.is_infeasible}
      <text
        x={MARGIN.left + PLOT_WIDTH / 2}
        y={MARGIN.top + PLOT_HEIGHT / 2}
        text-anchor="middle"
        fill="#fa5252"
        font-size="18"
        font-weight="600"
      >Infeasible</text>
    {/if}
  </svg>

  <!-- Objective value display -->
  {#if explorer_point && explorer_objective !== null}
    <div class="info-bar">
      <span class="info-label">Profit at ({explorer_point.x.toFixed(1)}, {explorer_point.y.toFixed(1)}):</span>
      <span class="info-value" class:infeasible={!explorer_is_feasible}>${explorer_objective.toFixed(2)}</span>
      {#if highlight_optimal && geometry.optimal_value !== null}
        <span class="info-gap">
          (optimal: ${geometry.optimal_value.toFixed(2)})
        </span>
      {/if}
    </div>
  {/if}

  <!-- Constraint toggles -->
  {#if allow_toggle_constraints}
    <div class="constraint-toggles">
      {#each model.constraints as constraint, index}
        <label class="constraint-toggle">
          <input
            type="checkbox"
            checked={constraint.enabled}
            onchange={() => toggle_constraint(index)}
          />
          <span class="constraint-color" style="background: {constraint.color}"></span>
          <span class="constraint-name">{constraint.name}</span>
        </label>
      {/each}
    </div>
  {/if}
</div>

<style>
  .interactive-plot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
  }

  svg {
    background: #12141e;
    border-radius: 8px;
    border: 1px solid #2a2d3a;
    max-width: 100%;
    height: auto;
    user-select: none;
  }

  .info-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.9rem;
    font-family: "JetBrains Mono", monospace;
  }

  .info-label {
    color: #6b7084;
  }

  .info-value {
    color: #51cf66;
    font-weight: 600;
  }

  .info-value.infeasible {
    color: #fa5252;
  }

  .info-gap {
    color: #495162;
    font-size: 0.85rem;
  }

  .constraint-toggles {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    justify-content: center;
  }

  .constraint-toggle {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    font-size: 0.85rem;
    color: #abb2bf;
  }

  .constraint-toggle input[type="checkbox"] {
    accent-color: #4c6ef5;
  }

  .constraint-color {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .constraint-name {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.8rem;
  }
</style>
