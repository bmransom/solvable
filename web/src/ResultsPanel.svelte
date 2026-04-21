<script lang="ts">
  import type { SolveResult, ParseResult, SolverState } from "./types";
  import { push_route } from "./router";

  interface FilterStep {
    label: string;
    highlight_variables: string[];
    highlight_constraints: string[];
    annotation?: string;
  }

  interface Props {
    solve_result: SolveResult | null;
    parse_result: ParseResult | null;
    solve_error: string | null;
    solver_state: SolverState;
    highlight_variables?: string[];
    highlight_constraints?: string[];
    filter_steps?: FilterStep[];
  }

  let {
    solve_result,
    parse_result,
    solve_error,
    solver_state,
    highlight_variables,
    highlight_constraints,
    filter_steps,
  }: Props = $props();

  // Filter step state
  let current_filter_step = $state(0);

  const active_highlights = $derived.by(() => {
    if (filter_steps && filter_steps.length > 0 && current_filter_step > 0) {
      const step = filter_steps[current_filter_step - 1];
      return {
        variables: new Set(step.highlight_variables),
        constraints: new Set(step.highlight_constraints),
        annotation: step.annotation,
      };
    }
    if (highlight_variables || highlight_constraints) {
      return {
        variables: new Set(highlight_variables ?? []),
        constraints: new Set(highlight_constraints ?? []),
        annotation: undefined,
      };
    }
    return null;
  });

  const has_filtering = $derived(!!active_highlights);

  function is_variable_highlighted(name: string): boolean {
    if (!active_highlights) return true;
    return active_highlights.variables.has(name);
  }

  function is_constraint_highlighted(name: string): boolean {
    if (!active_highlights) return true;
    return active_highlights.constraints.has(name);
  }

  // Status-to-lesson cross-links
  const STATUS_LESSON_MAP: Record<string, { chapter: string; lesson: string; label: string }> = {
    "Infeasible": { chapter: "ch6-when-things-go-wrong", lesson: "infeasible", label: "Why is my model infeasible?" },
    "Unbounded": { chapter: "ch6-when-things-go-wrong", lesson: "unbounded", label: "What does unbounded mean?" },
    "TimeLimit": { chapter: "ch8-running-in-production", lesson: "time-limits-and-fallbacks", label: "Handling time limits" },
  };

  function navigate_to_lesson(chapter: string, lesson: string) {
    push_route({ view: "lesson", chapter_id: chapter, lesson_id: lesson });
  }

  const status_class = $derived.by(() => {
    if (!solve_result) return "";
    switch (solve_result.status) {
      case "Optimal": return "status-optimal";
      case "Infeasible": return "status-infeasible";
      case "Unbounded": return "status-unbounded";
      case "TimeLimit": return "status-timelimit";
      case "Error": return "status-error";
    }
  });

  const status_label = $derived.by(() => {
    if (!solve_result) return "";
    switch (solve_result.status) {
      case "Optimal": return "Optimal";
      case "Infeasible": return "Infeasible";
      case "Unbounded": return "Unbounded";
      case "TimeLimit": return "Time Limit";
      case "Error": return "Error";
    }
  });

  const sorted_variables = $derived.by(() => {
    if (!solve_result?.variable_values) return [];
    return Object.values(solve_result.variable_values).sort(
      (a, b) => a.index - b.index
    );
  });

  const sorted_constraints = $derived.by(() => {
    if (!solve_result?.constraint_values) return [];
    return Object.values(solve_result.constraint_values).sort(
      (a, b) => a.index - b.index
    );
  });

  const has_dual_info = $derived.by(() => {
    return sorted_variables.some((v) => v.basis_status !== "");
  });

  const parse_errors = $derived.by(() => {
    if (!parse_result) return [];
    return parse_result.errors.filter((e) => e.severity === "Error");
  });
</script>

<div class="results-panel">
  {#if solve_error}
    <div class="error-banner">
      <span class="error-icon">!</span>
      {solve_error}
    </div>
  {/if}

  {#if solver_state === "not-loaded" || solver_state === "loading"}
    <div class="empty-state">
      <div class="loading-indicator">
        <span class="spinner-large"></span>
        <p>Loading solver...</p>
      </div>
    </div>
  {:else if !solve_result && parse_errors.length === 0}
    <div class="empty-state">
      <p class="empty-title">No results yet</p>
      <p class="empty-hint">Write an LP model and click Solve or press Ctrl+Enter</p>
    </div>
  {:else if parse_errors.length > 0 && !solve_result}
    <div class="errors-section">
      <h3 class="section-title">Parse Errors</h3>
      {#each parse_errors as error}
        <div class="error-item">
          <span class="error-location">Line {error.line}</span>
          <span class="error-message">{error.message}</span>
        </div>
      {/each}
    </div>
  {/if}

  {#if solve_result}
    <div class="result-header">
      <span class="status-badge {status_class}">{status_label}</span>
      <span class="solve-time">{solve_result.solve_time_ms.toFixed(1)} ms</span>
    </div>

    {#if solve_result.status === "Optimal" && solve_result.objective_value != null}
      <div class="objective-section">
        <span class="objective-label">Objective Value</span>
        <span class="objective-value">{solve_result.objective_value}</span>
      </div>

      {#if filter_steps && filter_steps.length > 0}
        <div class="filter-controls">
          <div class="filter-step-label">
            {current_filter_step === 0 ? "Full output" : filter_steps[current_filter_step - 1].label}
          </div>
          <div class="filter-buttons">
            {#if current_filter_step > 0}
              <button class="filter-button" onclick={() => current_filter_step--}>Back</button>
            {/if}
            {#if current_filter_step < filter_steps.length}
              <button class="filter-button filter-button-primary" onclick={() => current_filter_step++}>
                {current_filter_step === 0 ? "Start filtering" : "Next"}
              </button>
            {/if}
          </div>
          {#if active_highlights?.annotation}
            <p class="filter-annotation">{active_highlights.annotation}</p>
          {/if}
        </div>
      {/if}

      <div class="section">
        <h3 class="section-title">Variables</h3>
        <table class="results-table">
          <thead>
            <tr>
              <th>Variable</th>
              <th class="numeric">Value</th>
              {#if has_dual_info}
                <th class="numeric">Reduced Cost</th>
                <th>Basis</th>
              {/if}
            </tr>
          </thead>
          <tbody>
            {#each sorted_variables as variable}
              <tr class:dimmed={has_filtering && !is_variable_highlighted(variable.name)} class:highlighted={has_filtering && is_variable_highlighted(variable.name)}>
                <td class="variable-name">{variable.name}</td>
                <td class="numeric">{formatNumber(variable.primal)}</td>
                {#if has_dual_info}
                  <td class="numeric">{formatNumber(variable.dual)}</td>
                  <td class="basis-status">{formatBasis(variable.basis_status)}</td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      {#if sorted_constraints.length > 0}
        <div class="section">
          <h3 class="section-title">Constraints</h3>
          <table class="results-table">
            <thead>
              <tr>
                <th>Constraint</th>
                <th class="numeric">Activity</th>
                {#if has_dual_info}
                  <th class="numeric">Shadow Price</th>
                  <th class="numeric">Slack</th>
                {/if}
              </tr>
            </thead>
            <tbody>
              {#each sorted_constraints as constraint}
                {@const slack = computeSlack(constraint)}
                <tr class:non-binding={has_dual_info && Math.abs(slack) > 1e-8 && !has_filtering} class:dimmed={has_filtering && !is_constraint_highlighted(constraint.name)} class:highlighted={has_filtering && is_constraint_highlighted(constraint.name)}>
                  <td class="variable-name">{constraint.name}</td>
                  <td class="numeric">{formatNumber(constraint.primal)}</td>
                  {#if has_dual_info}
                    <td class="numeric">{formatNumber(constraint.dual)}</td>
                    <td class="numeric">{formatNumber(slack)}</td>
                  {/if}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    {:else if solve_result.status === "Infeasible"}
      <div class="status-message">
        <p>This model has no feasible solution. The constraints are contradictory — no variable values can satisfy all of them simultaneously.</p>
        <p class="hint">Try relaxing a constraint or checking for typos in the right-hand side values.</p>
        {#if STATUS_LESSON_MAP["Infeasible"]}
          <button class="lesson-link" onclick={() => navigate_to_lesson(STATUS_LESSON_MAP["Infeasible"].chapter, STATUS_LESSON_MAP["Infeasible"].lesson)}>
            {STATUS_LESSON_MAP["Infeasible"].label} →
          </button>
        {/if}
      </div>
    {:else if solve_result.status === "Unbounded"}
      <div class="status-message">
        <p>The objective can improve without limit. There is no finite optimal solution.</p>
        <p class="hint">This usually means a constraint is missing. Check that all variables have appropriate upper bounds.</p>
        {#if STATUS_LESSON_MAP["Unbounded"]}
          <button class="lesson-link" onclick={() => navigate_to_lesson(STATUS_LESSON_MAP["Unbounded"].chapter, STATUS_LESSON_MAP["Unbounded"].lesson)}>
            {STATUS_LESSON_MAP["Unbounded"].label} →
          </button>
        {/if}
      </div>
    {:else if solve_result.status === "Error"}
      <div class="status-message error">
        <p>{solve_result.error_message ?? "An unknown error occurred during solving."}</p>
      </div>
    {/if}
  {/if}
</div>

<script lang="ts" module>
  import type { RowInfo } from "./types";

  function formatNumber(value: number): string {
    if (Math.abs(value) < 1e-10) return "0";
    if (Number.isInteger(value)) return value.toString();
    return value.toPrecision(6).replace(/\.?0+$/, "");
  }

  function formatBasis(status: string): string {
    switch (status) {
      case "BS": return "Basic";
      case "LB": return "At Lower";
      case "UB": return "At Upper";
      case "FX": return "Fixed";
      case "FR": return "Free";
      default: return status || "-";
    }
  }

  function computeSlack(row: RowInfo): number {
    if (row.upper != null && row.lower == null) {
      return row.upper - row.primal;
    }
    if (row.lower != null && row.upper == null) {
      return row.primal - row.lower;
    }
    if (row.upper != null && row.lower != null) {
      return Math.min(row.upper - row.primal, row.primal - row.lower);
    }
    return 0;
  }
</script>

<style>
  .results-panel {
    padding: 1rem 1.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    color: #6b7084;
  }

  .empty-title {
    font-size: 1rem;
    color: #abb2bf;
    margin-bottom: 0.3rem;
  }

  .empty-hint {
    font-size: 0.85rem;
  }

  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    color: #6b7084;
  }

  .spinner-large {
    display: inline-block;
    width: 24px;
    height: 24px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top-color: #4c6ef5;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.6rem 0.8rem;
    background: rgba(250, 82, 82, 0.1);
    border: 1px solid rgba(250, 82, 82, 0.3);
    border-radius: 6px;
    color: #fa5252;
    font-size: 0.85rem;
  }

  .error-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fa5252;
    color: white;
    font-size: 0.7rem;
    font-weight: bold;
    flex-shrink: 0;
  }

  .errors-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .error-item {
    display: flex;
    gap: 0.5rem;
    padding: 0.4rem 0.6rem;
    background: rgba(250, 82, 82, 0.05);
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .error-location {
    color: #fa5252;
    font-weight: 500;
    white-space: nowrap;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.8rem;
  }

  .error-message {
    color: #abb2bf;
  }

  .result-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .status-badge {
    padding: 0.25rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .status-optimal {
    background: rgba(81, 207, 102, 0.15);
    color: #51cf66;
  }

  .status-infeasible, .status-error {
    background: rgba(250, 82, 82, 0.15);
    color: #fa5252;
  }

  .status-unbounded, .status-timelimit {
    background: rgba(255, 192, 32, 0.15);
    color: #ffc020;
  }

  .solve-time {
    font-size: 0.8rem;
    color: #6b7084;
    font-family: "JetBrains Mono", monospace;
  }

  .objective-section {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    padding: 0.75rem 1rem;
    background: #1a1d2e;
    border-radius: 8px;
    border: 1px solid #2a2d3a;
  }

  .objective-label {
    font-size: 0.75rem;
    color: #6b7084;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .objective-value {
    font-size: 1.75rem;
    font-weight: 600;
    font-family: "JetBrains Mono", monospace;
    color: #f0f2f7;
  }

  .section {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .section-title {
    font-size: 0.8rem;
    font-weight: 600;
    color: #6b7084;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .results-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.85rem;
  }

  .results-table th {
    text-align: left;
    padding: 0.4rem 0.6rem;
    border-bottom: 1px solid #2a2d3a;
    font-weight: 500;
    font-size: 0.75rem;
    color: #6b7084;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .results-table td {
    padding: 0.35rem 0.6rem;
    border-bottom: 1px solid rgba(42, 45, 58, 0.5);
  }

  .results-table .numeric {
    text-align: right;
    font-family: "JetBrains Mono", monospace;
    font-size: 0.8rem;
  }

  .variable-name {
    font-family: "JetBrains Mono", monospace;
    color: #e5c07b;
    font-size: 0.8rem;
  }

  .basis-status {
    font-size: 0.75rem;
    color: #6b7084;
  }

  .non-binding {
    opacity: 0.5;
  }

  .status-message {
    padding: 1rem;
    background: #1a1d2e;
    border-radius: 8px;
    border: 1px solid #2a2d3a;
    font-size: 0.9rem;
    line-height: 1.5;
  }

  .status-message.error {
    border-color: rgba(250, 82, 82, 0.3);
  }

  .hint {
    margin-top: 0.5rem;
    color: #6b7084;
    font-size: 0.85rem;
  }

  .dimmed {
    opacity: 0.3;
  }

  .highlighted {
    border-left: 3px solid #4c6ef5;
  }

  .highlighted td:first-child {
    padding-left: calc(0.6rem - 3px);
  }

  .filter-controls {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    background: #1a1d2e;
    border-radius: 8px;
    border: 1px solid #2a2d3a;
  }

  .filter-step-label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #abb2bf;
  }

  .filter-buttons {
    display: flex;
    gap: 0.5rem;
  }

  .filter-button {
    padding: 0.3rem 0.75rem;
    background: transparent;
    color: #abb2bf;
    border: 1px solid #2a2d3a;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .filter-button:hover {
    border-color: #4c6ef5;
    color: #e1e4eb;
  }

  .filter-button-primary {
    background: #4c6ef5;
    border-color: #4c6ef5;
    color: white;
  }

  .filter-button-primary:hover {
    background: #5c7cfa;
  }

  .filter-annotation {
    font-size: 0.8rem;
    color: #6b7084;
    line-height: 1.4;
    border-top: 1px solid #2a2d3a;
    padding-top: 0.5rem;
  }

  .lesson-link {
    display: inline-block;
    margin-top: 0.75rem;
    background: none;
    border: 1px solid #4c6ef5;
    color: #4c6ef5;
    padding: 0.3rem 0.75rem;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .lesson-link:hover {
    background: rgba(76, 110, 245, 0.1);
  }
</style>
