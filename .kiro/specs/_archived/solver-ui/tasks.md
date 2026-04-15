# Implementation Plan

- [ ] 1. Scaffold the frontend project
  - Initialize `web/` directory with `package.json`, Vite config, Svelte plugin
  - Create `web/index.html` entry point
  - Create `web/src/main.ts` and `web/src/App.svelte` shell
  - Configure Vite to serve WASM files and handle Web Workers
  - Verify dev server starts and renders a blank page
  - _Requirements: UI-4.1, UI-4.2_

- [ ] 2. Build the CodeMirror 6 editor with LP syntax highlighting
  - Install CodeMirror 6 packages (`@codemirror/view`, `@codemirror/state`, `@codemirror/language`)
  - Create a custom LP language mode with Lezer grammar or `StreamLanguage`
  - Define token styles: keywords (bold), numbers, operators, comments, constraint names
  - Create `EditorPanel.svelte` wrapping CodeMirror with the LP mode
  - Verify syntax highlighting works for a sample LP model
  - _Requirements: UI-1.1, UI-1.2_

- [ ] 3. Implement live parsing with inline error diagnostics
  - Wire editor content changes (debounced 200ms) to `solvable-core` WASM `parse()` on the main thread (no worker round-trip — parsing is fast enough at <50ms)
  - Map parse errors to CodeMirror diagnostics (red squiggly underlines)
  - Show error messages on hover via CodeMirror's `lintGutter` or tooltip extension
  - Display model summary (variable count, constraint count) below the editor or in the toolbar
  - _Requirements: UI-1.3, UI-1.4_

- [ ] 4. Build the results panel
  - Create `ResultsPanel.svelte` with status badge, objective value, variable table, solve time
  - Style the status badge: green for Optimal, red for Infeasible/Error, amber for Unbounded/TimeLimit
  - Display variable values in a sortable table with variable name and value columns
  - Display parse/solve errors with clickable line numbers
  - Handle empty state (no solve yet) with a helpful prompt
  - _Requirements: UI-2.2, UI-2.3, UI-2.4, UI-2.5_

- [ ] 5. Implement the Solve workflow
  - Create Solve button in the editor toolbar
  - Wire Solve button to the Web Worker solver interface from the wasm-solver-core spec
  - Show spinner during solve, disable button, show Cancel button
  - On solve complete, populate the results panel
  - Implement cancel by terminating the Web Worker
  - _Requirements: UI-2.1, UI-2.6, UI-2.7_

- [ ] 6. Implement keyboard shortcuts
  - Register Ctrl+Enter / Cmd+Enter to trigger solve
  - Register Escape to cancel a running solve
  - Ensure shortcuts work when editor is focused
  - _Requirements: UI-5.1, UI-5.2_

- [ ] 7. Build the example loader
  - Create `.lp` files in `examples/` directory (single source of truth — also used by parser integration tests):
    - `production_mix.lp` (default on load)
    - `diet_problem.lp`
    - `transportation.lp`
    - `knapsack.lp` (integer)
    - `portfolio.lp`
  - Import via Vite raw imports (`import model from '../../examples/diet_problem.lp?raw'`)
  - Create an examples dropdown/menu in the toolbar with name and description for each
  - Wire example selection to replace editor contents (undo history preserved) and trigger a parse
  - _Requirements: UI-3.1, UI-3.2, UI-3.3, UI-3.4, UI-3.5_

- [ ] 8. Implement responsive layout
  - Use CSS Grid for the two-panel layout
  - Add media query at 768px to switch to vertical stacking
  - Test at various viewport widths
  - Ensure editor state is preserved across layout changes
  - _Requirements: UI-4.1, UI-4.2, UI-4.3_

- [ ] 9. Polish and cross-browser testing
  - Fine-tune styling: fonts, colors, spacing, transitions
  - Test in Chrome, Firefox, Safari, Edge (latest versions)
  - Verify Lighthouse performance score > 90
  - Verify total page load under 3 seconds on simulated 4G
  - _Requirements: UI-4.1, UI-4.2, UI-4.3_
