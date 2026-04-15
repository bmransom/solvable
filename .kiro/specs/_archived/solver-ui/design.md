# Solver UI - Design

## Overview

The frontend is a lightweight Svelte application with a two-panel layout: a CodeMirror 6 editor on the left and a results panel on the right. It communicates with the WASM solver via the Web Worker interface defined in the wasm-solver-core spec. The UI prioritizes zero-friction first use — the page loads with a pre-populated example and the solver ready to go.

## Architecture

```
┌───────────────────────────────────────────────────────┐
│  App.svelte                                            │
│  ┌─────────────────────┐  ┌─────────────────────────┐ │
│  │  EditorPanel.svelte  │  │  ResultsPanel.svelte    │ │
│  │  ┌────────────────┐  │  │  ┌──────────────────┐  │ │
│  │  │  CodeMirror 6   │  │  │  │  SolutionView    │  │ │
│  │  │  (LP mode)      │  │  │  │  (table/status)  │  │ │
│  │  └────────────────┘  │  │  └──────────────────┘  │ │
│  │  ┌────────────────┐  │  │  ┌──────────────────┐  │ │
│  │  │  Toolbar        │  │  │  │  ErrorView       │  │ │
│  │  │  (Solve, Exmpl) │  │  │  │  (parse/solve)   │  │ │
│  │  └────────────────┘  │  │  └──────────────────┘  │ │
│  └─────────────────────┘  └─────────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

## Components and Interfaces

### App.svelte

**Purpose**: Top-level layout, state coordination, keyboard shortcuts.

**Responsibilities**:
- Manage application state: current LP text, solve result, loading state
- Handle global keyboard shortcuts (Ctrl+Enter to solve, Escape to cancel)
- Coordinate editor ↔ solver ↔ results data flow
- Responsive layout with CSS grid/flexbox

### EditorPanel.svelte

**Purpose**: Wrap CodeMirror 6 with LP-specific configuration.

**Responsibilities**:
- Initialize CodeMirror 6 with custom LP language mode
- Dispatch editor content changes (debounced) for live parsing
- Display inline error diagnostics from parse results
- Provide the toolbar with Solve button, example selector, and loading indicator

### LP Language Mode (CodeMirror extension)

**Purpose**: Syntax highlighting for CPLEX LP format.

**Token categories**:
- **Keywords**: `Minimize`, `Maximize`, `Subject To`, `Bounds`, `General`, `Binary`, `End` — bold, primary color
- **Constraint names**: identifiers followed by `:` — secondary color
- **Numbers**: integer and decimal literals — numeric color
- **Operators**: `+`, `-`, `>=`, `<=`, `=` — operator color
- **Comments**: lines starting with `\` — dimmed/italic

### ResultsPanel.svelte

**Purpose**: Display solve results, errors, and model summary.

**Responsibilities**:
- Show solve status badge (Optimal, Infeasible, Unbounded, Error)
- Display objective value prominently
- Display variable values in a clean table
- Show solve time
- Display parse errors with line numbers (clickable to jump to line in editor)
- Show model summary from live parsing (variable count, constraint count)

### ExampleLoader (module)

**Purpose**: Provide built-in LP example models.

**Responsibilities**:
- Load example models from `.lp` files in the `examples/` directory via Vite raw imports — these same files are used by parser integration tests (single source of truth)
- Each example has metadata: name, description, category
- Examples: diet problem, transportation, knapsack, portfolio, production mix

## Data Flow

1. User types in editor → debounced `parse()` call on main thread (via `solvable-core` WASM, no worker round-trip) → update error markers + model summary instantly
2. User clicks Solve → `solve()` via Web Worker (`highs-js` WASM) → show spinner → receive result → display in results panel
3. User loads example → replace editor content (undo history preserved) → trigger parse → clear previous results

## Frontend Build

- **Framework**: Svelte (SvelteKit not needed — single page, no routing, no SSR)
- **Build tool**: Vite with `@sveltejs/vite-plugin-svelte`
- **Editor**: CodeMirror 6 (`@codemirror/view`, `@codemirror/state`, `@codemirror/language`, `@codemirror/lang-*` for reference)
- **Styles**: CSS custom properties for theming, no CSS framework
- **Output**: Static files deployable to any CDN (Cloudflare Pages, Netlify, etc.)

## Styling Principles

- Two-panel layout using CSS Grid
- Monospace font for editor and variable values
- Clean sans-serif for UI elements
- Accent color for optimal status, red for errors, amber for warnings
- Subtle borders and shadows — no heavy chrome
- Dark background for editor (dark theme), light results panel, or respect system preference

## Testing Strategy

- **Component tests**: Verify solve button triggers solver, example loading replaces editor content
- **Integration test**: Load page, type an LP model, click solve, verify results appear
- **Responsive test**: Verify layout switches at 768px breakpoint
- **Keyboard test**: Verify Ctrl+Enter triggers solve
- **Browser testing**: Manual verification in Chrome, Firefox, Safari, Edge
