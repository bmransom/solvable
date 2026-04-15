<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from "@codemirror/view";
  import { EditorState } from "@codemirror/state";
  import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
  import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
  import { setDiagnostics, type Diagnostic } from "@codemirror/lint";
  import { tags } from "@lezer/highlight";
  import { lp_language } from "./lp-language";
  import type { ParseResult, SolverState } from "./types";
  import type { Example } from "./examples";

  interface Props {
    text: string;
    on_change: (text: string) => void;
    parse_result: ParseResult | null;
    solver_state: SolverState;
    can_solve: boolean;
    is_solving: boolean;
    on_solve: () => void;
    on_cancel: () => void;
    on_load_example: (example: Example) => void;
    examples: Example[];
  }

  let { text, on_change, parse_result, solver_state, can_solve, is_solving, on_solve, on_cancel, on_load_example, examples }: Props = $props();

  let editor_container: HTMLDivElement;
  let editor_view: EditorView;
  let examples_open = $state(false);

  const lp_highlight_style = HighlightStyle.define([
    { tag: tags.keyword, color: "#c678dd", fontWeight: "bold" },
    { tag: tags.comment, color: "#5c6370", fontStyle: "italic" },
    { tag: tags.number, color: "#d19a66" },
    { tag: tags.operator, color: "#56b6c2" },
    { tag: tags.labelName, color: "#61afef" },
    { tag: tags.variableName, color: "#e5c07b" },
    { tag: tags.punctuation, color: "#abb2bf" },
  ]);

  const dark_theme = EditorView.theme({
    "&": {
      backgroundColor: "#1a1d2e",
      color: "#abb2bf",
      fontSize: "14px",
      fontFamily: "'JetBrains Mono', monospace",
    },
    ".cm-content": { caretColor: "#528bff" },
    ".cm-cursor": { borderLeftColor: "#528bff" },
    ".cm-gutters": {
      backgroundColor: "#1a1d2e",
      color: "#495162",
      border: "none",
      borderRight: "1px solid #2a2d3a",
    },
    ".cm-activeLineGutter": { backgroundColor: "#21243a" },
    ".cm-activeLine": { backgroundColor: "#21243a" },
    ".cm-selectionBackground": { backgroundColor: "#3e4451 !important" },
    "&.cm-focused .cm-selectionBackground": { backgroundColor: "#3e4451 !important" },
    ".cm-line": { padding: "0 0.5rem" },
  });

  onMount(() => {
    const state = EditorState.create({
      doc: text,
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        drawSelection(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        lp_language,
        syntaxHighlighting(lp_highlight_style),
        dark_theme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            on_change(update.state.doc.toString());
          }
        }),
      ],
    });

    editor_view = new EditorView({
      state,
      parent: editor_container,
    });
  });

  onDestroy(() => {
    editor_view?.destroy();
  });

  // Update diagnostics when parse_result changes
  $effect(() => {
    if (!editor_view || !parse_result) return;

    const diagnostics: Diagnostic[] = parse_result.errors
      .filter((error) => error.line > 0)
      .map((error) => {
        const line_info = editor_view.state.doc.line(
          Math.min(error.line, editor_view.state.doc.lines)
        );
        return {
          from: line_info.from,
          to: line_info.to,
          severity: error.severity === "Error" ? "error" as const : "warning" as const,
          message: error.message,
        };
      });

    editor_view.dispatch(setDiagnostics(editor_view.state, diagnostics));
  });

  // Sync text prop changes (e.g., loading examples) into the editor
  $effect(() => {
    if (!editor_view) return;
    const current = editor_view.state.doc.toString();
    if (text !== current) {
      editor_view.dispatch({
        changes: { from: 0, to: current.length, insert: text },
      });
    }
  });

  function handleExampleSelect(example: Example) {
    examples_open = false;
    on_load_example(example);
  }

  function handleExamplesBlur(event: FocusEvent) {
    const related = event.relatedTarget as HTMLElement | null;
    if (!related?.closest(".examples-dropdown")) {
      examples_open = false;
    }
  }

  const solver_label = $derived.by(() => {
    switch (solver_state) {
      case "not-loaded": return "Loading...";
      case "loading": return "Loading solver...";
      case "ready": return "Solve";
      case "solving": return "Solving...";
      case "reinitializing": return "Restarting...";
    }
  });

  const summary_text = $derived.by(() => {
    if (!parse_result?.summary) return "";
    const s = parse_result.summary;
    return `${s.variable_count} variable${s.variable_count !== 1 ? "s" : ""}, ${s.constraint_count} constraint${s.constraint_count !== 1 ? "s" : ""} (${s.sense})`;
  });
</script>

<div class="editor-panel">
  <div class="toolbar">
    <div class="toolbar-left">
      <button
        class="solve-button"
        onclick={on_solve}
        disabled={!can_solve}
      >
        {#if is_solving}
          <span class="spinner"></span>
        {/if}
        {solver_label}
      </button>

      {#if is_solving}
        <button class="cancel-button" onclick={on_cancel}>Cancel</button>
      {/if}

      <div class="examples-dropdown" onfocusout={handleExamplesBlur}>
        <button
          class="examples-button"
          onclick={() => (examples_open = !examples_open)}
        >
          Examples
          <span class="caret">{examples_open ? "▲" : "▼"}</span>
        </button>
        {#if examples_open}
          <div class="examples-menu">
            {#each examples as example}
              <button
                class="example-item"
                onclick={() => handleExampleSelect(example)}
              >
                <span class="example-name">{example.name}</span>
                <span class="example-desc">{example.description}</span>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="toolbar-right">
      {#if summary_text}
        <span class="model-summary">{summary_text}</span>
      {/if}
      <span class="shortcut-hint">Ctrl+Enter to solve</span>
    </div>
  </div>

  <div class="editor-container" bind:this={editor_container}></div>
</div>

<style>
  .editor-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0.75rem;
    background: #161822;
    border-bottom: 1px solid #2a2d3a;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .toolbar-left {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .solve-button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 1rem;
    background: #4c6ef5;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .solve-button:hover:not(:disabled) {
    background: #5c7cfa;
  }

  .solve-button:disabled {
    background: #3a3f52;
    color: #6b7084;
    cursor: not-allowed;
  }

  .cancel-button {
    padding: 0.4rem 0.75rem;
    background: transparent;
    color: #fa5252;
    border: 1px solid #fa5252;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .cancel-button:hover {
    background: rgba(250, 82, 82, 0.1);
  }

  .examples-dropdown {
    position: relative;
  }

  .examples-button {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.4rem 0.75rem;
    background: transparent;
    color: #abb2bf;
    border: 1px solid #2a2d3a;
    border-radius: 6px;
    font-size: 0.8rem;
    cursor: pointer;
  }

  .examples-button:hover {
    border-color: #4c6ef5;
    color: #e1e4eb;
  }

  .caret {
    font-size: 0.6rem;
  }

  .examples-menu {
    position: absolute;
    top: 100%;
    left: 0;
    margin-top: 0.25rem;
    background: #1e2030;
    border: 1px solid #2a2d3a;
    border-radius: 8px;
    padding: 0.25rem;
    min-width: 300px;
    z-index: 100;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  }

  .example-item {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: none;
    border: none;
    border-radius: 6px;
    text-align: left;
    cursor: pointer;
    color: #e1e4eb;
  }

  .example-item:hover {
    background: #2a2d3a;
  }

  .example-name {
    font-size: 0.85rem;
    font-weight: 500;
  }

  .example-desc {
    font-size: 0.75rem;
    color: #6b7084;
  }

  .model-summary {
    font-size: 0.75rem;
    color: #6b7084;
    font-family: "JetBrains Mono", monospace;
  }

  .shortcut-hint {
    font-size: 0.7rem;
    color: #495162;
  }

  .editor-container {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .editor-container :global(.cm-editor) {
    height: 100%;
  }

  .spinner {
    display: inline-block;
    width: 12px;
    height: 12px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
