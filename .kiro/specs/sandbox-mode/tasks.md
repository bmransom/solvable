# Implementation Plan

- [ ] 1. Create SandboxView.svelte
  - Wrap existing EditorPanel and ResultsPanel in a two-panel layout
  - Wire solve workflow: editor → parser → solver worker → results
  - Conditionally render interactive plot when model has exactly 2 variables
  - _Requirements: SANDBOX-1.1, SANDBOX-1.2, SANDBOX-1.3, SANDBOX-1.4_

- [ ] 2. Integrate with tutorial framework
  - Register sandbox as Chapter 8 in the chapter registry
  - Render SandboxView instead of LessonView when Chapter 8 is active
  - _Requirements: SANDBOX-1.1_

- [ ] 3. Extend the example library
  - Add models from tutorial chapters (formulation pattern examples) to the examples dropdown
  - _Requirements: SANDBOX-2.1, SANDBOX-2.2_

- [ ] 4. Implement shareable sandbox URLs
  - Encode editor contents with `v1,sandbox=` prefix using pako + base64url
  - On page load, detect prefix and navigate to sandbox with content
  - Share button in the sandbox toolbar
  - _Requirements: SANDBOX-3.1, SANDBOX-3.2_

- [ ] 5. Browser testing
  - Write and solve a model in the sandbox
  - Load examples, verify solve works
  - Test with a 2-variable model, verify interactive plot appears
  - Test share URL round-trip
  - _Requirements: SANDBOX-1.1, SANDBOX-1.2, SANDBOX-1.3, SANDBOX-2.1, SANDBOX-3.1_
