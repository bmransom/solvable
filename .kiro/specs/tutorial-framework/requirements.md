# Requirements Document

## Introduction

The tutorial framework is the shell that organizes solvable as a guided, interactive OR course rather than a standalone solver tool. It manages chapter navigation, lesson rendering, progress tracking, and the content format that mixes prose, interactive visualizations, and embedded solver components. The pedagogical approach follows the Concrete-Representational-Abstract (CRA) progression: students manipulate visual elements first, see the math emerge from their actions, then formalize in LP notation.

**Depends on**: wasm-solver-core (solver infrastructure), lp-format-parser (parse API)

## Requirements

### Requirement 1: Chapter-based lesson navigation

**User Story:** As a software engineer learning OR for the first time, I want a clear chapter progression that builds on prior concepts, so that I can work through the material at my own pace without getting lost.

#### Acceptance Criteria

1. WHEN the user opens the app THE SYSTEM SHALL display a chapter list sidebar showing all available chapters with titles, short descriptions, and completion status
2. WHEN the user clicks a chapter THE SYSTEM SHALL load the first lesson of that chapter in the main content area
3. WHEN the user completes a lesson THE SYSTEM SHALL advance to the next lesson within the chapter and update the progress indicator
4. WHEN the user navigates between lessons THE SYSTEM SHALL preserve the state of any interactive elements in the current lesson so they can return without losing work
5. THE SYSTEM SHALL support the following chapter sequence:
   - Chapter 1: "What is Optimization?" — Direct manipulation, no math
   - Chapter 2: "Constraints Shape the Possible" — Adding/removing constraints, dragging boundaries
   - Chapter 3: "How the Solver Finds the Answer" — Vertex-walking, reduced cost intuition
   - Chapter 4: "Formulation Patterns" — The patterns that cover real problems
   - Chapter 5: "When Things Go Wrong" — Infeasible, unbounded, degenerate
   - Chapter 6: "Integer Programming — Why It's Hard" — LP relaxation, B&B, solve time explosion
   - Chapter 7: "Sensitivity and Robustness" — Parameter sliders, Monte Carlo
   - Chapter 8: "Sandbox" — Free-form LP editor for open-ended exploration

### Requirement 2: Interactive lesson content format

**User Story:** As a learner, I want each lesson to mix explanation with hands-on interactive elements inline, so that I'm doing, not just reading.

#### Acceptance Criteria

1. WHEN a lesson is displayed THE SYSTEM SHALL render a mix of prose blocks, interactive visualization blocks, and inline quiz/prediction blocks in a single scrollable view
2. WHEN an interactive block appears THE SYSTEM SHALL render it inline in the lesson flow — not in a separate panel or popup
3. WHEN a lesson includes a "reveal" block THE SYSTEM SHALL hide the LP formulation behind a clickable "Show the math" toggle that expands to show the LP notation alongside the visualization
4. WHEN a lesson includes a prediction prompt (e.g., "Before you click Solve, predict: will this model be feasible?") THE SYSTEM SHALL accept the student's answer before revealing the result, reinforcing active learning
5. WHEN prose references a concept from a previous chapter THE SYSTEM SHALL link to it so the student can review

### Requirement 3: Layered depth

**User Story:** As a curious engineer, I want optional "go deeper" sections that explain the theory behind the intuition, so that I can choose how far to go without the main flow being cluttered.

#### Acceptance Criteria

1. WHEN a lesson has additional depth available THE SYSTEM SHALL show a collapsed "Go Deeper" section that expands on click
2. WHEN the "Go Deeper" section is expanded THE SYSTEM SHALL show the theoretical underpinning (e.g., duality theorem, LP formulation) with more formal notation
3. WHEN "Go Deeper" sections exist THE SYSTEM SHALL clearly indicate they are optional and not required for progression

### Requirement 4: Progress persistence

**User Story:** As a learner who works through the tutorial across multiple sessions, I want my progress saved, so that I pick up where I left off.

#### Acceptance Criteria

1. WHEN the user completes a lesson THE SYSTEM SHALL persist the completion state to localStorage
2. WHEN the user returns to the app THE SYSTEM SHALL restore their progress and show the last incomplete lesson
3. WHEN the user wants to reset progress THE SYSTEM SHALL provide a "Reset Progress" option in the settings

### Requirement 5: Shareable lesson state

**User Story:** As an instructor, I want to link students directly to a specific lesson with a pre-configured interactive state, so that I can assign specific exercises.

#### Acceptance Criteria

1. WHEN a user clicks "Share" on any lesson THE SYSTEM SHALL encode the chapter, lesson, and interactive element state into the URL fragment
2. WHEN a user opens a shared URL THE SYSTEM SHALL load the specified lesson with the shared state pre-configured
