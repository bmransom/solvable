# Sandbox Mode - Design

## Overview

The sandbox is essentially the current solver UI (EditorPanel + ResultsPanel) wrapped as a chapter in the tutorial framework. It reuses the existing CodeMirror editor, LP syntax highlighting, Web Worker solver, and results display — no new components needed beyond integration with the tutorial shell and the interactive plot for 2-variable models.

## Architecture

```
Tutorial Framework (Chapter 8: Sandbox)
        │
        ▼
┌────────────────────────────────────┐
│  SandboxView.svelte                │
│  ┌──────────┐  ┌────────────────┐  │
│  │ Editor    │  │ Results +      │  │
│  │ Panel     │  │ Interactive    │  │
│  │ (existing)│  │ Plot (if 2var) │  │
│  └──────────┘  └────────────────┘  │
└─────────────��──────────────────────┘
```

## Components

### SandboxView.svelte

**Purpose**: Two-panel layout hosting the existing editor and results components, plus conditional interactive plot.

**Responsibilities**:
- Render EditorPanel (left) and ResultsPanel (right) — existing components
- After solve, check if model has exactly 2 variables
- If 2 variables: render interactive plot below or alongside the results panel
- Wire the interactive plot's parameter changes back to the editor (bidirectional sync)

### URL Sharing

Same as the archived shareable-urls spec, with prefix `v1,sandbox=` instead of `v1,model=`. On page load, detect this prefix and navigate to sandbox with pre-loaded content.

## What's Reused vs. New

| Component | Status |
|-----------|--------|
| EditorPanel.svelte | Reused as-is |
| ResultsPanel.svelte | Reused as-is |
| solver.ts / solver-worker.ts | Reused as-is |
| parser.ts | Reused as-is |
| lp-language.ts | Reused as-is |
| examples.ts | Extended with tutorial models |
| InteractivePlot.svelte | New integration for 2-var models |
| SandboxView.svelte | New — wraps existing components |
| URL sharing | New — pako + base64url encoding |

## Testing Strategy

- Verify sandbox loads with default example, solve works, results display
- Verify 2-variable models show the interactive plot
- Verify 3+ variable models hide the plot
- Verify share URL round-trip
