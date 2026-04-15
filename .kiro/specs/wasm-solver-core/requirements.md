# Requirements Document

## Introduction

The foundational capability of solvable is running the HiGHS optimization solver entirely in the browser via WebAssembly. This requires either compiling HiGHS to WASM via Emscripten (leveraging the existing `highs-js` npm package) or compiling the Rust `highs` crate to a WASM-compatible target. The solver is exposed through a thin TypeScript interface. Without this, nothing else works — it is the highest-risk, highest-priority feature.

**Depends on**: none (foundational spec)

## Requirements

### Requirement 1: Solve LP problems in the browser via WASM

**User Story:** As a student or analyst, I want to solve linear programming problems directly in my browser, so that I don't need to install any software or rely on a server.

#### Acceptance Criteria

1. WHEN a user provides a valid LP model THE SYSTEM SHALL solve it using HiGHS compiled to WebAssembly and return the optimal objective value and variable values
2. WHEN a user provides a valid MIP model THE SYSTEM SHALL solve it using HiGHS and return the optimal integer solution
3. WHEN a model is infeasible THE SYSTEM SHALL return a status of "Infeasible" with no objective value
4. WHEN a model is unbounded THE SYSTEM SHALL return a status of "Unbounded" with no objective value
5. WHEN a solve completes THE SYSTEM SHALL report the wall-clock solve time in milliseconds

### Requirement 2: Non-blocking solver execution

**User Story:** As a user solving a MIP problem that takes several seconds, I want the browser UI to remain responsive, so that I can cancel the solve or continue reading documentation.

#### Acceptance Criteria

1. WHEN a solve is initiated THE SYSTEM SHALL execute the WASM solver in a Web Worker, keeping the main thread unblocked
2. WHEN a solve is running THE SYSTEM SHALL allow the user to cancel the solve by terminating the worker
3. WHEN a solve exceeds a configurable time limit THE SYSTEM SHALL terminate the solve and return a "TimeLimit" status
4. WHEN a solve is cancelled via worker termination THE SYSTEM SHALL re-initialize the WASM module in a new worker and show a "Solver re-initializing..." state until the module is ready again
5. WHEN a user clicks Solve while the solver is re-initializing after a cancel THE SYSTEM SHALL queue the solve and execute it once re-initialization completes

### Requirement 3: Efficient WASM loading

**User Story:** As a user on a slow connection, I want the solver to load quickly and not block the initial page render, so that I can start writing my model while the solver loads in the background.

#### Acceptance Criteria

1. WHEN the page loads THE SYSTEM SHALL lazy-load the WASM module in the background without blocking the editor
2. WHEN the WASM module is loading THE SYSTEM SHALL display a loading indicator on the solve button
3. WHEN the WASM module finishes loading THE SYSTEM SHALL enable the solve button and be ready to solve within 3 seconds on a 4G connection
4. IF the WASM module is served with appropriate headers THE SYSTEM SHALL use `WebAssembly.instantiateStreaming` for optimal loading performance
5. WHEN the WASM module fails to load (old browser, ad blocker, corporate proxy) THE SYSTEM SHALL display a clear error message with supported browser requirements and suggest the user check for content blockers

### Requirement 4: JSON-based WASM interface

**User Story:** As a frontend developer integrating the solver, I want a simple JSON-based API across the WASM boundary, so that I don't need to deal with complex typed WASM bindings.

#### Acceptance Criteria

1. WHEN calling the `solve` function with an LP string THE SYSTEM SHALL return a JSON object containing status, objective value, variable values, and solve time
2. WHEN calling the `parse` function with an LP string THE SYSTEM SHALL return a JSON object containing either validation errors or a model summary
3. WHEN calling the `version` function THE SYSTEM SHALL return a version string identifying the solver and solvable versions
4. WHEN comparing solver results in tests THE SYSTEM SHALL use numerical tolerance (`|actual - expected| < 1e-6` for LP, `1e-4` for MIP objective values)
