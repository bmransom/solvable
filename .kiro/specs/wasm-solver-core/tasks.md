# Implementation Plan

- [ ] 1. Scaffold Cargo workspace and crate structure
  - Create root `Cargo.toml` with workspace members
  - Create `crates/solvable-core/` with `Cargo.toml` and `src/lib.rs`
  - Create `crates/solvable-solver/` with `Cargo.toml` and `src/lib.rs` (native-only, not compiled to WASM)
  - Create `crates/solvable-wasm/` with `Cargo.toml` and `src/lib.rs` (cdylib target, parser only)
  - Add shared dependencies: `serde`, `serde_json` in workspace `[dependencies]`
  - _Requirements: WASM-4.1, WASM-4.2, WASM-4.3_

- [ ] 2. Define core data types in solvable-core
  - Implement `Sense`, `VariableType`, `Variable`, `ConstraintOperator` enums/structs
  - Implement `LinearExpression`, `Constraint`, `Model` structs
  - Implement `ParseError` with line, column, message fields
  - Implement `Solution`, `SolveStatus`, `SolveOptions` types
  - Derive `Serialize`/`Deserialize` for all types
  - Write unit tests for type construction and serialization
  - _Requirements: WASM-1.1, WASM-4.1, WASM-4.2_

- [ ] 3. Research and spike HiGHS WASM integration
  - Install `highs-js` npm package and verify it solves a simple LP in Node.js
  - Document the `highs-js` API: how to construct problems, call solve, extract results
  - Verify `solvable-core` compiles to `wasm32-unknown-unknown` via `wasm-pack` (no C++ dependencies)
  - Measure `highs-js` WASM bundle size (gzipped) against the 2MB target
  - Document the chosen architecture and any constraints discovered
  - _Requirements: WASM-1.1, WASM-1.2_

- [ ] 4. Build solvable-wasm parser bindings
  - Add `wasm-bindgen` and `console_error_panic_hook` dependencies
  - Implement `#[wasm_bindgen] pub fn parse(lp_string: &str) -> String` (JSON ParseResult)
  - Implement `#[wasm_bindgen] pub fn version() -> String`
  - Set up panic hook for readable WASM error messages
  - Build with `wasm-pack build --target web`
  - Run `wasm-opt -Os` on output and measure bundle size
  - _Requirements: WASM-4.2, WASM-4.3, WASM-3.4_

- [ ] 5. Integrate HiGHS in solvable-solver (native testing)
  - Add `highs` crate dependency for native builds
  - Implement `solve(model: &Model, options: &SolveOptions) -> Solution`
  - Map HiGHS status codes to `SolveStatus` enum
  - Extract variable values and objective from HiGHS solution
  - Write integration tests solving known LP problems with numerical tolerance (|actual - expected| < 1e-6)
  - Write integration tests for infeasible and unbounded models
  - These tests serve as reference values for the TypeScript model bridge
  - _Requirements: WASM-1.1, WASM-1.2, WASM-1.3, WASM-1.4, WASM-1.5, WASM-4.4_

- [ ] 6. Build the TypeScript model bridge
  - Create `web/src/model-bridge.ts`
  - Implement conversion from `Model` JSON (from solvable-core WASM) to `highs-js` problem format
  - Implement conversion from `highs-js` solution to `SolveResult` JSON
  - Map `highs-js` status codes to `SolveStatus`
  - Write unit tests verifying conversions using the same test models as solvable-solver native tests
  - Verify solve results match native Rust solver results within tolerance
  - _Requirements: WASM-1.1, WASM-1.2, WASM-1.3, WASM-1.4, WASM-1.5_

- [ ] 7. Create Web Worker solver infrastructure
  - Create `web/src/solver-worker.ts` that loads `highs-js` WASM and handles solve messages
  - Create `web/src/solver.ts` with async `solve()` API, worker lifecycle management
  - Implement loading states: `not-loaded | loading | ready | reinitializing`
  - Implement cancel by terminating the worker, then respawn and reinitialize with queued solve support
  - Detect WASM load failure and report to main thread with clear error context
  - _Requirements: WASM-2.1, WASM-2.2, WASM-2.3, WASM-2.4, WASM-2.5, WASM-3.1, WASM-3.2, WASM-3.3, WASM-3.5_

- [ ] 8. Create main-thread parser loader
  - Create `web/src/parser.ts` that loads `solvable-core` WASM on the main thread
  - Expose synchronous `parse(lpString: string): ParseResult` API
  - Handle load failure gracefully with error message
  - _Requirements: WASM-3.1, WASM-3.5, WASM-4.2_

- [ ] 9. Write integration tests
  - Test `parse` with valid LP returns model summary (via solvable-wasm in Node.js)
  - Test `parse` with malformed LP returns errors with line numbers
  - Test `version` returns a non-empty string
  - Test model bridge + `highs-js` solve for valid LP matches expected optimal value within tolerance
  - Test model bridge + `highs-js` solve for infeasible model returns Infeasible status
  - Test model bridge + `highs-js` solve for unbounded model returns Unbounded status
  - _Requirements: WASM-1.1, WASM-1.2, WASM-1.3, WASM-1.4, WASM-4.1, WASM-4.2, WASM-4.3, WASM-4.4_
