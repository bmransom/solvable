# Requirements Document

## Introduction

The sandbox is Chapter 8 — an open-ended LP editor for students who have completed the tutorial and want to build and solve their own models. It is the current solver UI (CodeMirror editor + results panel), preserved as the endpoint of the learning journey. "You've learned the concepts — now build anything."

**Depends on**: wasm-solver-core, lp-format-parser, interactive-plot (for 2-variable models)

## Requirements

### Requirement 1: Free-form LP editor with solve

**User Story:** As a student who has completed the tutorial, I want a blank LP editor where I can write and solve any model, so that I can practice what I've learned on my own problems.

#### Acceptance Criteria

1. WHEN the user opens the Sandbox chapter THE SYSTEM SHALL display the two-panel layout: CodeMirror editor on the left, results on the right
2. WHEN the user writes an LP model and clicks Solve THE SYSTEM SHALL parse and solve it, displaying results in the right panel
3. WHEN the model has exactly 2 variables THE SYSTEM SHALL show the interactive plot alongside the results
4. WHEN the model has parse errors THE SYSTEM SHALL show inline diagnostics in the editor

### Requirement 2: Example library

**User Story:** As a student exploring, I want one-click access to example models from the tutorial, so that I can experiment with models I've already seen.

#### Acceptance Criteria

1. THE SYSTEM SHALL provide an examples dropdown containing all 5 example LP files plus any models introduced during the tutorial
2. WHEN an example is loaded THE SYSTEM SHALL populate the editor and trigger a parse

### Requirement 3: Shareable sandbox models

**User Story:** As a student or instructor, I want to share a sandbox model as a URL.

#### Acceptance Criteria

1. WHEN the user clicks Share in the sandbox THE SYSTEM SHALL encode the editor contents into the URL fragment with a `v1,sandbox=` prefix
2. WHEN a shared sandbox URL is opened THE SYSTEM SHALL navigate to the sandbox chapter with the model loaded
