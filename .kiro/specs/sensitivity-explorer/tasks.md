# Implementation Plan

- [ ] 1. Build the basis change detector
  - Create `web/src/basis-change.ts` with `BasisSnapshot` type
  - Implement `detectBasisChange(before, after): boolean` from basis status comparison
  - Extract basis snapshots from `highs-js` solution objects
  - Unit tests with known solve pairs that do and don't change basis
  - _Requirements: SENS-1.3, SENS-2.3_

- [ ] 2. Build the empirical ranging computation
  - Create `web/src/ranging.ts`
  - Implement binary search for RHS allowable ranges: vary parameter until basis changes
  - Implement binary search for objective coefficient allowable ranges
  - Unit tests: compute ranges for the production mix model, verify against hand-calculated values
  - _Requirements: SENS-1.2, SENS-1.3, SENS-2.1, SENS-2.3_

- [ ] 3. Build the SensitivitySlider component
  - Create `web/src/SensitivitySlider.svelte`
  - Display current value, shadow price / reduced cost, and allowable range on the slider track
  - Detect and indicate basis changes during drag
  - Trigger explanatory text on basis change events
  - _Requirements: SENS-1.1, SENS-1.2, SENS-1.3, SENS-1.4, SENS-2.1, SENS-2.2, SENS-2.3, SENS-2.4_

- [ ] 4. Build the Monte Carlo runner
  - Create `web/src/monte-carlo.ts` with `RobustnessResult` type
  - Accept base model, uncertainty ranges, sample count
  - Run batch solves in the Web Worker, collect basis snapshots and objective values
  - Compute statistics: basis stability, objective distribution, parameter sensitivity ranking
  - Integration test: model with one clearly sensitive parameter → verify it ranks highest
  - _Requirements: SENS-3.1, SENS-3.2, SENS-3.3, SENS-3.4_

- [ ] 5. Build the RobustnessPanel component
  - Create `web/src/RobustnessPanel.svelte`
  - Render objective value histogram (SVG)
  - Render basis stability gauge
  - Render parameter sensitivity ranking
  - Show "Sensitive" / "Robust" badge
  - Progress bar during Monte Carlo execution
  - _Requirements: SENS-3.3, SENS-3.4_

- [ ] 6. Implement binding constraint visualization
  - Enhance interactive plot constraint rendering: thick + glow for binding, thin + faded for non-binding
  - Hover tooltips showing slack and shadow price
  - _Requirements: SENS-4.1, SENS-4.2, SENS-4.3_

- [ ] 7. Write Chapter 7 lesson content
  - Lesson 1: "The Price of a Resource" — RHS slider with shadow price annotation
  - Lesson 2: "When Does the Solution Change?" — objective coefficient slider with range visualization
  - Lesson 3: "Binding vs. Non-Binding" — prediction prompt + visual reveal on the plot
  - Lesson 4: "How Robust Is Your Solution?" — Monte Carlo robustness testing
  - Lesson 5 (Go Deeper): "Complementary Slackness and Duality" — connect the visual intuition to the theory
  - _Requirements: SENS-1.1, SENS-2.1, SENS-3.1, SENS-4.1, SENS-4.4_
