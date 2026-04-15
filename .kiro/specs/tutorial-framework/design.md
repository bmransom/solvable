# Tutorial Framework - Design

## Overview

The tutorial framework replaces the current two-panel solver UI with a guided lesson experience. The app becomes a single-column scrollable lesson view with a chapter sidebar, where interactive elements (plots, sliders, embedded editors) appear inline in the content flow. The solver and parser run behind the scenes, triggered reactively by interactive element state changes.

## Architecture

```
┌────────────────────────────────────────────────────────┐
│  App Shell                                              │
│  ┌──────────┐  ┌────────────────────────────────────┐  │
│  │ Chapter   │  │  Lesson View (scrollable)          │  │
│  │ Sidebar   │  │  ┌──────────────────────────────┐  │  │
│  │           │  │  │  Prose Block                 │  │  │
│  │ Ch 1 ●   │  │  └──────────────────────────────┘  │  │
│  │ Ch 2 ○   │  │  ┌──────────────────────────────┐  │  │
│  │ Ch 3 ○   │  │  │  Interactive Block            │  │  │
│  │ Ch 4 ○   │  │  │  (Plot / Sliders / Editor)   │  │  │
│  │ ...      │  │  └──────────────────────────────┘  │  │
│  │          │  │  ┌──────────────────────────────┐  │  │
│  │          │  │  │  Reveal Block (collapsed)     │  │  │
│  │          │  │  └──────────────────────────────┘  │  │
│  │          │  │  ┌──────────────────────────────┐  │  │
│  │          │  │  │  Prediction Prompt            │  │  │
│  │          │  │  └──────────────────────────────┘  │  │
│  └──────────┘  └────────────────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Lesson Content Format

Lessons are defined as arrays of typed blocks in TypeScript. No custom markdown parser — the content is structured data that Svelte components render directly.

```typescript
type LessonBlock =
  | { type: "prose"; content: string }         // HTML-safe prose
  | { type: "interactive"; component: string; props: Record<string, unknown> }
  | { type: "reveal"; label: string; content: string }
  | { type: "go_deeper"; title: string; content: string }
  | { type: "prediction"; question: string; options: string[]; answer: number; explanation: string }
  | { type: "checkpoint"; message: string }

interface Lesson {
  id: string;
  title: string;
  blocks: LessonBlock[];
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}
```

### App.svelte (rearchitected)

**Purpose**: Top-level layout with chapter sidebar and lesson view.

**Responsibilities**:
- Render chapter sidebar with progress indicators
- Load and display the current lesson
- Manage global state: current chapter, current lesson, solver instance
- Handle keyboard shortcuts and navigation

### ChapterSidebar.svelte

**Purpose**: Left sidebar showing all chapters with completion state.

**Responsibilities**:
- List chapters with icons: filled circle (complete), half circle (in progress), empty circle (not started)
- Highlight current chapter
- Collapse on narrow viewports into a hamburger menu

### LessonView.svelte

**Purpose**: Render a sequence of lesson blocks as a scrollable page.

**Responsibilities**:
- Map each `LessonBlock` to its corresponding Svelte component
- Handle block-level state (expanded/collapsed reveals, prediction answers)
- Scroll to next block after completing an interaction

### Block Components

- **ProseBlock.svelte**: Render HTML prose with styled typography
- **InteractiveBlock.svelte**: Dynamically mount interactive components (plots, sliders, editors) based on the `component` field
- **RevealBlock.svelte**: Collapsible LP formulation display with syntax highlighting
- **GoDeeper.svelte**: Collapsible section with "optional" badge
- **PredictionBlock.svelte**: Multiple-choice question, locks in answer before reveal
- **CheckpointBlock.svelte**: Progress marker with motivational message

### Progress Store

**Purpose**: Persist lesson completion to localStorage.

**Implementation**: Svelte writable store backed by localStorage. Shape:
```typescript
interface Progress {
  completed_lessons: Set<string>;  // "chapter_id/lesson_id"
  current_chapter: string;
  current_lesson: string;
}
```

### Shareable State

Encode `{ chapter, lesson, interactive_state }` as compressed JSON in the URL fragment, using the same `pako` + base64url approach from the archived shareable-urls spec. Add a `v1,lesson=` prefix.

## Content Pipeline

Lesson content lives in `web/src/chapters/` as TypeScript modules:
```
web/src/chapters/
├── index.ts              # Chapter registry
├── ch1-what-is-optimization/
│   ├── index.ts          # Chapter metadata + lesson list
│   ├── lesson1.ts        # "Your first optimization problem"
│   ├── lesson2.ts        # "Meet the constraints"
│   └── lesson3.ts        # "Finding the best point"
├── ch2-constraints/
│   └── ...
└── ...
```

Each lesson exports a `Lesson` object. Interactive components are referenced by string name and mounted dynamically via a component registry.

## Styling

- Single-column content, max-width 720px, centered — like a well-typeset article
- Interactive blocks break out to full width of the content area
- Dark theme consistent with current app design
- Generous vertical spacing between blocks
- Monospace font for LP formulations and numbers
- Sans-serif for prose

## Testing Strategy

- **Navigation tests**: Verify chapter/lesson routing, forward/back navigation, progress persistence
- **Block rendering**: Verify each block type renders correctly
- **Progress**: Verify localStorage persistence and restore
- **Responsive**: Verify sidebar collapse on narrow viewports
