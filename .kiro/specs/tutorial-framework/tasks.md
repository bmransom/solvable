# Implementation Plan

- [ ] 1. Define the lesson content data model
  - Create `web/src/chapters/types.ts` with `LessonBlock`, `Lesson`, `Chapter` types
  - Create `web/src/chapters/index.ts` as the chapter registry
  - Create a component registry mapping string names to Svelte components
  - _Requirements: TUTORIAL-2.1, TUTORIAL-2.2_

- [ ] 2. Build the app shell with chapter sidebar
  - Rearchitect `App.svelte` from two-panel solver to sidebar + lesson view layout
  - Create `ChapterSidebar.svelte` with chapter list, progress indicators, navigation
  - Implement responsive collapse to hamburger on narrow viewports
  - Wire chapter/lesson selection to update the main content area
  - _Requirements: TUTORIAL-1.1, TUTORIAL-1.2, TUTORIAL-1.3_

- [ ] 3. Build the lesson view and block renderers
  - Create `LessonView.svelte` that iterates over lesson blocks and mounts components
  - Create `ProseBlock.svelte` with styled typography
  - Create `InteractiveBlock.svelte` with dynamic component mounting
  - Create `RevealBlock.svelte` with collapsible LP formulation display
  - Create `GoDeeper.svelte` with collapsible "optional" section
  - Create `PredictionBlock.svelte` with answer lock-in before reveal
  - Create `CheckpointBlock.svelte` with progress marker
  - _Requirements: TUTORIAL-2.1, TUTORIAL-2.2, TUTORIAL-2.3, TUTORIAL-2.4, TUTORIAL-3.1, TUTORIAL-3.2, TUTORIAL-3.3_

- [ ] 4. Implement progress persistence
  - Create `web/src/progress.ts` with a Svelte store backed by localStorage
  - Track completed lessons, current chapter/lesson position
  - Restore progress on app load
  - Add "Reset Progress" option
  - _Requirements: TUTORIAL-4.1, TUTORIAL-4.2, TUTORIAL-4.3_

- [ ] 5. Implement shareable lesson URLs
  - Encode chapter, lesson, and interactive state in URL fragment with `v1,lesson=` prefix
  - Decode on page load, navigate to specified lesson with pre-configured state
  - Share button per lesson
  - _Requirements: TUTORIAL-5.1, TUTORIAL-5.2_

- [ ] 6. Write Chapter 1 content: "What is Optimization?"
  - Lesson 1: "Your First Optimization Problem" — profit counter, drag x/y point on 2D plot, discover that corners are best
  - Lesson 2: "Meet the Constraints" — toggle constraints on/off, watch feasible region shrink
  - Lesson 3: "The Math Behind It" — reveal LP formulation alongside the visualization they already understand
  - _Requirements: TUTORIAL-1.5, TUTORIAL-2.3, TUTORIAL-2.4_

- [ ] 7. Write Chapter 5 content: "When Things Go Wrong"
  - Lesson 1: "Infeasible" — start with working model, add contradictory constraint, watch feasible region vanish
  - Lesson 2: "Unbounded" — remove a bound, watch profit arrow extend forever
  - Lesson 3: "What went wrong?" — IIS intuition, identify the conflicting constraints
  - _Requirements: TUTORIAL-1.5, TUTORIAL-2.4_
