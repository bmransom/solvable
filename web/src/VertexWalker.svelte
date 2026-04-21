<script lang="ts">
  import type { PlotModel } from "./plot-model";
  import {
    compute_geometry,
    type PlotGeometry,
    type Point,
    type VertexData,
  } from "./geometry";

  interface Props {
    model: PlotModel;
  }

  let { model: initial_model }: Props = $props();

  let model: PlotModel = $state(JSON.parse(JSON.stringify(initial_model)));
  let geometry: PlotGeometry = $state(compute_geometry(model, null));

  interface VertexEdge {
    from_index: number;
    to_index: number;
    objective_change: number;
  }

  function build_adjacency(vertices: VertexData[]): VertexEdge[] {
    const edges: VertexEdge[] = [];
    for (let i = 0; i < vertices.length; i++) {
      for (let j = i + 1; j < vertices.length; j++) {
        const shared = vertices[i].binding_constraints.filter(
          (c) => vertices[j].binding_constraints.includes(c)
        );
        if (shared.length >= 1) {
          edges.push({
            from_index: i,
            to_index: j,
            objective_change: vertices[j].objective_value - vertices[i].objective_value,
          });
          edges.push({
            from_index: j,
            to_index: i,
            objective_change: vertices[i].objective_value - vertices[j].objective_value,
          });
        }
      }
    }
    return edges;
  }

  let adjacency: VertexEdge[] = $state(build_adjacency(geometry.vertices));

  // Find the vertex closest to the origin as the starting point
  function find_origin_vertex(vertices: VertexData[]): number {
    if (vertices.length === 0) return 0;
    let best = 0;
    let best_dist = Infinity;
    for (let i = 0; i < vertices.length; i++) {
      const dist = vertices[i].point.x * vertices[i].point.x + vertices[i].point.y * vertices[i].point.y;
      if (dist < best_dist) {
        best_dist = dist;
        best = i;
      }
    }
    return best;
  }

  let current_vertex_index: number = $state(find_origin_vertex(geometry.vertices));
  let visited_indices: number[] = $state([current_vertex_index]);
  let step_count = $state(0);
  let walk_complete = $state(false);

  // Check if starting vertex is already optimal
  $effect(() => {
    const neighbors = get_neighbors(current_vertex_index);
    const is_max = model.objective.sense === "max";
    const has_improving = neighbors.some((e) => is_max ? e.objective_change > 1e-8 : e.objective_change < -1e-8);
    if (!has_improving && step_count === 0) {
      walk_complete = true;
    }
  });

  function get_neighbors(vertex_index: number): VertexEdge[] {
    return adjacency.filter((e) => e.from_index === vertex_index);
  }

  function step() {
    if (walk_complete) return;

    const neighbors = get_neighbors(current_vertex_index);
    const is_max = model.objective.sense === "max";

    let best_edge: VertexEdge | null = null;
    for (const edge of neighbors) {
      if (is_max ? edge.objective_change > 1e-8 : edge.objective_change < -1e-8) {
        if (!best_edge || (is_max ? edge.objective_change > best_edge.objective_change : edge.objective_change < best_edge.objective_change)) {
          best_edge = edge;
        }
      }
    }

    if (best_edge) {
      current_vertex_index = best_edge.to_index;
      visited_indices = [...visited_indices, best_edge.to_index];
      step_count++;

      const new_neighbors = get_neighbors(best_edge.to_index);
      const has_improving = new_neighbors.some((e) => is_max ? e.objective_change > 1e-8 : e.objective_change < -1e-8);
      if (!has_improving) {
        walk_complete = true;
      }
    }
  }

  function reset() {
    const start = find_origin_vertex(geometry.vertices);
    current_vertex_index = start;
    visited_indices = [start];
    step_count = 0;
    walk_complete = false;
  }

  // SVG dimensions
  const SVG_WIDTH = 600;
  const SVG_HEIGHT = 480;
  const MARGIN = { top: 20, right: 20, bottom: 40, left: 50 };
  const PLOT_WIDTH = SVG_WIDTH - MARGIN.left - MARGIN.right;
  const PLOT_HEIGHT = SVG_HEIGHT - MARGIN.top - MARGIN.bottom;

  function to_svg_x(data_x: number): number {
    const viewport = geometry.viewport;
    return MARGIN.left + ((data_x - viewport.x_min) / (viewport.x_max - viewport.x_min)) * PLOT_WIDTH;
  }

  function to_svg_y(data_y: number): number {
    const viewport = geometry.viewport;
    return MARGIN.top + PLOT_HEIGHT - ((data_y - viewport.y_min) / (viewport.y_max - viewport.y_min)) * PLOT_HEIGHT;
  }

  function generate_ticks(range_min: number, range_max: number, target_count: number): number[] {
    const range = range_max - range_min;
    const raw_step = range / target_count;
    const magnitude = Math.pow(10, Math.floor(Math.log10(raw_step)));
    const normalized = raw_step / magnitude;
    let step: number;
    if (normalized < 1.5) step = 1 * magnitude;
    else if (normalized < 3.5) step = 2 * magnitude;
    else if (normalized < 7.5) step = 5 * magnitude;
    else step = 10 * magnitude;

    const ticks: number[] = [];
    const start_val = Math.ceil(range_min / step) * step;
    for (let t = start_val; t <= range_max; t += step) {
      ticks.push(Math.round(t * 1000) / 1000);
    }
    return ticks;
  }

  const x_ticks = $derived(generate_ticks(geometry.viewport.x_min, geometry.viewport.x_max, 6));
  const y_ticks = $derived(generate_ticks(geometry.viewport.y_min, geometry.viewport.y_max, 6));

  const feasible_path = $derived(() => {
    if (geometry.feasible_polygon.length === 0) return "";
    return geometry.feasible_polygon
      .map((p, i) => `${i === 0 ? "M" : "L"} ${to_svg_x(p.x)} ${to_svg_y(p.y)}`)
      .join(" ") + " Z";
  });

  const current_edges = $derived.by(() => {
    const neighbors = get_neighbors(current_vertex_index);
    const is_max = model.objective.sense === "max";
    return neighbors.map((edge) => {
      const from_vertex = geometry.vertices[edge.from_index];
      const to_vertex = geometry.vertices[edge.to_index];
      const is_improving = is_max ? edge.objective_change > 1e-8 : edge.objective_change < -1e-8;
      return {
        from: from_vertex.point,
        to: to_vertex.point,
        change: edge.objective_change,
        color: is_improving ? "#51cf66" : "#fa5252",
        is_improving,
      };
    });
  });

  const current_vertex = $derived(geometry.vertices[current_vertex_index]);
</script>

<div class="vertex-walker">
  <svg
    role="img"
    aria-label="Vertex walker visualization"
    width={SVG_WIDTH}
    height={SVG_HEIGHT}
    viewBox="0 0 {SVG_WIDTH} {SVG_HEIGHT}"
  >
    <!-- Arrow markers (defined first) -->
    <defs>
      <marker id="arrow-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <path d="M0,0 L8,3 L0,6 Z" fill="#51cf66" />
      </marker>
      <marker id="arrow-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
        <path d="M0,0 L8,3 L0,6 Z" fill="#fa5252" />
      </marker>
    </defs>

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

    <!-- Tick labels -->
    {#each x_ticks as tick}
      <text x={to_svg_x(tick)} y={MARGIN.top + PLOT_HEIGHT + 18} text-anchor="middle" fill="#495162" font-size="11">{tick}</text>
    {/each}
    {#each y_ticks as tick}
      <text x={MARGIN.left - 8} y={to_svg_y(tick) + 4} text-anchor="end" fill="#495162" font-size="11">{tick}</text>
    {/each}

    <!-- Feasible region -->
    {#if geometry.feasible_polygon.length > 0}
      <path d={feasible_path()} fill="rgba(76, 110, 245, 0.12)" stroke="none" />
    {/if}

    <!-- Constraint lines -->
    {#each geometry.constraint_lines as line}
      {#if line.enabled}
        <line
          x1={to_svg_x(line.start.x)} y1={to_svg_y(line.start.y)}
          x2={to_svg_x(line.end.x)} y2={to_svg_y(line.end.y)}
          stroke={line.color} stroke-width="2" opacity="0.4"
        />
      {/if}
    {/each}

    <!-- Edge arrows from current vertex -->
    {#each current_edges as edge}
      {@const from_sx = to_svg_x(edge.from.x)}
      {@const from_sy = to_svg_y(edge.from.y)}
      {@const to_sx = to_svg_x(edge.to.x)}
      {@const to_sy = to_svg_y(edge.to.y)}
      {@const mx = (from_sx + to_sx) / 2}
      {@const my = (from_sy + to_sy) / 2}
      <!-- Shorten the arrow so it doesn't overlap the target vertex -->
      {@const dx = to_sx - from_sx}
      {@const dy = to_sy - from_sy}
      {@const len = Math.sqrt(dx * dx + dy * dy)}
      {@const shorten = 14}
      {@const end_x = to_sx - (dx / len) * shorten}
      {@const end_y = to_sy - (dy / len) * shorten}
      <line
        x1={from_sx} y1={from_sy}
        x2={end_x} y2={end_y}
        stroke={edge.color} stroke-width="3" opacity="0.8"
        marker-end="url(#arrow-{edge.is_improving ? 'green' : 'red'})"
      />
      <text
        x={mx + 10} y={my - 10}
        fill={edge.color} font-size="12" font-weight="600"
        font-family="'JetBrains Mono', monospace"
      >
        {edge.change > 0 ? "+" : ""}{edge.change.toFixed(1)}
      </text>
    {/each}

    <!-- All vertices -->
    {#each geometry.vertices as vertex, index}
      {@const is_current = index === current_vertex_index}
      {@const is_visited = visited_indices.includes(index)}
      <circle
        cx={to_svg_x(vertex.point.x)}
        cy={to_svg_y(vertex.point.y)}
        r={is_current ? 10 : is_visited ? 7 : 5}
        fill={is_current ? "#51cf66" : is_visited ? "#4c6ef5" : "#495162"}
        stroke={is_current ? "#fff" : "none"}
        stroke-width="2"
      />
      <text
        x={to_svg_x(vertex.point.x)}
        y={to_svg_y(vertex.point.y) - 14}
        text-anchor="middle"
        fill={is_current ? "#51cf66" : is_visited ? "#abb2bf" : "#6b7084"}
        font-size="11"
        font-family="'JetBrains Mono', monospace"
        font-weight={is_current ? "600" : "400"}
      >
        {vertex.objective_value.toFixed(1)}
      </text>
    {/each}
  </svg>

  <!-- Controls -->
  <div class="controls">
    <div class="status-line">
      {#if walk_complete}
        <span class="status optimal">
          Optimal. No neighbor improves the objective.
          {#if step_count > 0}Reached in {step_count} step{step_count !== 1 ? "s" : ""}.{/if}
        </span>
      {:else}
        <span class="status">
          Step {step_count}. Current objective: <strong>{current_vertex?.objective_value.toFixed(1)}</strong>
        </span>
      {/if}
    </div>

    <div class="buttons">
      {#if !walk_complete}
        <button class="step-button" onclick={step}>
          Step →
        </button>
      {/if}
      {#if step_count > 0}
        <button class="reset-button" onclick={reset}>
          Restart
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .vertex-walker {
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

  .controls {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .status-line {
    font-family: "JetBrains Mono", monospace;
  }

  .status {
    font-size: 0.9rem;
    color: #abb2bf;
  }

  .status :global(strong) {
    color: #51cf66;
  }

  .status.optimal {
    color: #51cf66;
  }

  .buttons {
    display: flex;
    gap: 0.5rem;
  }

  .step-button {
    padding: 0.5rem 1.5rem;
    background: #4c6ef5;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .step-button:hover {
    background: #5c7cfa;
  }

  .reset-button {
    padding: 0.5rem 1rem;
    background: transparent;
    color: #6b7084;
    border: 1px solid #2a2d3a;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
  }

  .reset-button:hover {
    border-color: #4c6ef5;
    color: #abb2bf;
  }
</style>
