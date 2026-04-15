<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import EditorPanel from "./EditorPanel.svelte";
  import ResultsPanel from "./ResultsPanel.svelte";
  import { SolverManager } from "./solver";
  import { parse } from "./parser";
  import { DEFAULT_EXAMPLE, EXAMPLES, type Example } from "./examples";
  import type { ParseResult, SolveResult, SolverState } from "./types";

  let editor_text = $state(DEFAULT_EXAMPLE.lp_text);
  let parse_result: ParseResult | null = $state(null);
  let solve_result: SolveResult | null = $state(null);
  let solver_state: SolverState = $state("not-loaded");
  let solve_error: string | null = $state(null);

  let solver: SolverManager;
  let debounce_timer: ReturnType<typeof setTimeout> | null = null;

  onMount(() => {
    solver = new SolverManager((state) => {
      solver_state = state;
    });
    doParse(editor_text);
  });

  onDestroy(() => {
    solver?.destroy();
    if (debounce_timer) clearTimeout(debounce_timer);
  });

  function onEditorChange(text: string) {
    editor_text = text;
    solve_error = null;

    if (debounce_timer) clearTimeout(debounce_timer);
    debounce_timer = setTimeout(() => {
      doParse(text);
    }, 200);
  }

  function doParse(text: string) {
    parse_result = parse(text);
  }

  async function onSolve() {
    if (solver_state !== "ready") return;
    solve_error = null;

    try {
      solve_result = await solver.solve(editor_text);
    } catch (error) {
      solve_error = `${error}`;
      solve_result = null;
    }
  }

  function onCancel() {
    solver?.cancel();
    solve_error = null;
  }

  function onLoadExample(example: Example) {
    editor_text = example.lp_text;
    solve_result = null;
    solve_error = null;
    doParse(example.lp_text);
  }

  function handleKeydown(event: KeyboardEvent) {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      event.preventDefault();
      onSolve();
    }
    if (event.key === "Escape" && solver_state === "solving") {
      event.preventDefault();
      onCancel();
    }
  }

  const is_solving = $derived(solver_state === "solving");
  const can_solve = $derived(solver_state === "ready" && !is_solving);
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="sandbox">
  <div class="sandbox-header">
    <h2 class="sandbox-title">Sandbox</h2>
    <p class="sandbox-subtitle">Write and solve any LP or MIP model. Use Ctrl+Enter to solve.</p>
  </div>

  <div class="sandbox-panels">
    <div class="editor-side">
      <EditorPanel
        text={editor_text}
        on_change={onEditorChange}
        {parse_result}
        {solver_state}
        {can_solve}
        {is_solving}
        on_solve={onSolve}
        on_cancel={onCancel}
        on_load_example={onLoadExample}
        examples={EXAMPLES}
      />
    </div>

    <div class="results-side">
      <ResultsPanel
        {solve_result}
        {parse_result}
        {solve_error}
        {solver_state}
      />
    </div>
  </div>
</div>

<style>
  .sandbox {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .sandbox-header {
    padding: 1rem 1.25rem 0.75rem;
    flex-shrink: 0;
  }

  .sandbox-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #f0f2f7;
    letter-spacing: -0.02em;
  }

  .sandbox-subtitle {
    font-size: 0.85rem;
    color: #6b7084;
    margin-top: 0.2rem;
  }

  .sandbox-panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    flex: 1;
    min-height: 0;
  }

  .editor-side {
    border-right: 1px solid #2a2d3a;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .results-side {
    display: flex;
    flex-direction: column;
    min-height: 0;
    overflow: auto;
  }

  @media (max-width: 768px) {
    .sandbox-panels {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr 1fr;
    }

    .editor-side {
      border-right: none;
      border-bottom: 1px solid #2a2d3a;
    }
  }
</style>
