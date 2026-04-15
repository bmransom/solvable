# Implementation Plan

- [ ] 1. Extend solvable-solver to extract sensitivity data (native)
  - Create `crates/solvable-solver/src/sensitivity.rs`
  - Call HiGHS ranging API after LP solve to get objective and RHS ranges
  - Extract row dual values (shadow prices) and column dual values (reduced costs)
  - Compute slack/surplus for each constraint (RHS - activity or activity - RHS depending on constraint sense)
  - Extract basis status for each variable (basic, at lower bound, at upper bound)
  - Detect degeneracy: basic variable at a bound, or binding constraint with zero shadow price
  - Package into `SensitivityReport` struct with `is_degenerate` flag
  - Skip extraction for MIP solves
  - Write integration tests verifying sensitivity values for a known LP (diet problem) — compare against hand-calculated values within tolerance
  - Write integration test for a degenerate LP — verify `is_degenerate` flag is set
  - _Requirements: SENS-1.1, SENS-1.2, SENS-1.3, SENS-1.4, SENS-1.5, SENS-1.6, SENS-1.7, SENS-1.8, SENS-1.9_

- [ ] 2. Extend the TypeScript model bridge for sensitivity extraction
  - Extract ranging data, duals, slack, and basis status from `highs-js` solution
  - Compute `is_degenerate` flag using the same logic as the Rust implementation
  - Map to `SensitivityReport` JSON matching the Rust struct shape
  - Write tests verifying TypeScript results match Rust native results for the same models
  - _Requirements: SENS-1.1, SENS-1.7, SENS-1.8, SENS-1.9_

- [ ] 3. Pass sensitivity data through the solve pipeline
  - Include `SensitivityReport` in the `SolveResult` JSON from the worker
  - Update TypeScript `SolveResult` interface to include sensitivity fields, slack, basis status
  - Write end-to-end test: parse LP → solve via worker → verify sensitivity in result
  - _Requirements: SENS-1.1, SENS-1.6_

- [ ] 4. Build the SensitivityView component
  - Create `web/src/SensitivityView.svelte`
  - Render constraints table: name, slack/surplus, shadow price, RHS, allowable increase/decrease
  - Render variables table: name, value, basis status (human-readable), reduced cost, obj coefficient, allowable increase/decrease
  - Format infinity values as "Infinity"
  - De-emphasize rows with nonzero slack (non-binding constraints)
  - Show basis status as "Basic", "At Lower Bound", "At Upper Bound"
  - Show degeneracy note when `is_degenerate` is true
  - _Requirements: SENS-1.2, SENS-1.3, SENS-1.4, SENS-1.5, SENS-1.7, SENS-1.8, SENS-1.9, SENS-2.1, SENS-2.2, SENS-2.3_

- [ ] 5. Integrate into the results panel
  - Add a Sensitivity tab/section to `ResultsPanel.svelte`
  - Show the tab only for LP solutions
  - Show a note for MIP solutions explaining sensitivity is LP-only
  - Test end-to-end: solve an LP, verify sensitivity tab appears with correct data including slack and basis status
  - Test with a degenerate LP: verify degeneracy note appears
  - _Requirements: SENS-1.1, SENS-1.6, SENS-1.9, SENS-2.1_
