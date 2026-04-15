# Requirements Document

## Introduction

The solver UI is the primary interface users interact with. It provides a code editor for writing LP models, a solve button, and panels for displaying results. The design follows a clean two-panel layout (editor left, results right) inspired by CodePen meets Desmos. The UI must work with zero friction — no signup, no install, open the URL and start solving.

**Depends on**: wasm-solver-core (parser WASM + solver worker), lp-format-parser (parse API)

## Requirements

### Requirement 1: Code editor with LP syntax highlighting

**User Story:** As a student writing my first LP model, I want syntax highlighting and a familiar code editor experience, so that I can focus on the model structure without getting lost in plain text.

#### Acceptance Criteria

1. WHEN the page loads THE SYSTEM SHALL display a CodeMirror 6 editor with LP syntax highlighting (keywords, numbers, operators, comments in distinct colors)
2. WHEN a user types in the editor THE SYSTEM SHALL provide line numbers, bracket matching, and standard editor keybindings
3. WHEN a parse error exists THE SYSTEM SHALL underline the problematic line in the editor with a red squiggly and show the error message on hover
4. WHEN the user modifies the LP text THE SYSTEM SHALL re-parse within 200ms (debounced) and update error markers

### Requirement 2: Solve and display results

**User Story:** As a user who has written an LP model, I want to click Solve and immediately see the results, so that I can iterate on my model quickly.

#### Acceptance Criteria

1. WHEN the user clicks the Solve button or presses Ctrl+Enter THE SYSTEM SHALL send the current editor contents to the WASM solver
2. WHEN the solve completes with Optimal status THE SYSTEM SHALL display the objective value, all variable values, and solve time in a results panel
3. WHEN the solve completes with Infeasible status THE SYSTEM SHALL display a clear message explaining the model has no feasible solution
4. WHEN the solve completes with Unbounded status THE SYSTEM SHALL display a clear message explaining the objective can improve without limit
5. WHEN the solve returns an error THE SYSTEM SHALL display the error message with context
6. WHILE a solve is running THE SYSTEM SHALL show a spinner on the Solve button and disable it
7. WHILE a solve is running THE SYSTEM SHALL show a Cancel button that terminates the solve

### Requirement 3: Built-in example models

**User Story:** As a first-time user, I want to load pre-built example models with one click, so that I can see what LP format looks like and start experimenting immediately.

#### Acceptance Criteria

1. WHEN the page loads THE SYSTEM SHALL pre-load the editor with a simple, well-commented example model (production mix)
2. WHEN the user clicks an example from the examples menu AND the editor contains unsaved modifications THE SYSTEM SHALL load the example (CodeMirror undo history is preserved so the user can Ctrl+Z to recover)
3. WHEN an example is loaded THE SYSTEM SHALL include comments explaining the problem being modeled
4. THE SYSTEM SHALL provide at least 5 built-in examples: diet problem, transportation, knapsack, portfolio optimization, production mix
5. THE SYSTEM SHALL store example models as `.lp` files in the `examples/` directory, loaded as string imports at build time — these same files are used by parser integration tests to ensure a single source of truth

### Requirement 4: Responsive layout

**User Story:** As a user on different screen sizes, I want the layout to adapt, so that I can use solvable on my laptop, desktop, or tablet.

#### Acceptance Criteria

1. WHEN the viewport is wide (> 768px) THE SYSTEM SHALL display a two-panel layout with editor on the left and results on the right
2. WHEN the viewport is narrow (<= 768px) THE SYSTEM SHALL stack the panels vertically with the editor on top
3. WHEN the user resizes the browser THE SYSTEM SHALL smoothly adjust the layout without losing editor state

### Requirement 5: Keyboard shortcuts

**User Story:** As a power user, I want keyboard shortcuts for common actions, so that I can work efficiently without reaching for the mouse.

#### Acceptance Criteria

1. WHEN the user presses Ctrl+Enter (Cmd+Enter on Mac) THE SYSTEM SHALL trigger a solve
2. WHEN the user presses Escape during a solve THE SYSTEM SHALL cancel the solve
