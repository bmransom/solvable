# WASM Solver Core - Design

## Overview

The WASM solver core compiles HiGHS into a WebAssembly module via Rust, exposed through a thin `wasm-bindgen` layer. The architecture uses a Cargo workspace with three crates: `solvable-core` (model IR, pure Rust), `solvable-solver` (HiGHS integration), and `solvable-wasm` (WASM bindings). The solver runs in a Web Worker to prevent UI blocking.

## Architecture

Parsing runs on the main thread for instant error feedback (<50ms, no worker round-trip). Solving runs in a Web Worker to keep the UI responsive during long MIP solves.

```
┌──────────────────────────────────────────────────────┐
│  Browser Main Thread                                  │
│  ┌─────────────┐     ┌────────────────────────────┐  │
│  │  UI / Editor │────▶│  solvable-core WASM        │  │
│  │              │     │  (parser + validation)      │  │
│  │              │     │  Instant error feedback     │  │
│  └─────────────┘     └────────────────────────────┘  │
│         │                                             │
│         │ solve()    ┌────────────────────────────┐   │
│         └───────────▶│  solver.ts (Worker manager) │  │
│                       └──────────┬───────────────┘   │
│                                  │ postMessage        │
├──────────────────────────────────┼───────────────────┤
│  Web Worker                      │                    │
│  ┌───────────────────────────────▼────────────────┐  │
│  │  solver-worker.ts                              │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  highs-js (WASM, via npm)                │  │  │
│  │  │  Pre-compiled HiGHS solver               │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │  Model bridge (TS)                       │  │  │
│  │  │  Convert parsed Model → HiGHS format     │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

## Components and Interfaces

### solvable-core (Rust crate)

**Purpose**: Define the model intermediate representation, LP format parser, and model validation logic. Pure Rust with no WASM or solver dependencies.

**Responsibilities**:
- Define `Model`, `Variable`, `Constraint`, `LinearExpression`, `Sense` types
- Parse CPLEX LP format strings into `Model`
- Validate models (undefined variables, empty constraints, type mismatches)
- Produce structured parse errors with line numbers

**Interfaces**:
- **Input**: LP format string
- **Output**: `Result<Model, Vec<ParseError>>`
- **Dependencies**: None (pure Rust, `no_std`-compatible where possible)

### solvable-solver (Rust crate — native testing only)

**Purpose**: Wrap HiGHS as a Rust-friendly solver interface for native integration testing. This crate is NOT compiled to WASM — it uses the system-installed HiGHS or the `highs` Rust crate for native tests. In the browser, `highs-js` handles solving.

**Responsibilities**:
- Convert `Model` into HiGHS problem representation
- Call HiGHS solve and extract results
- Map HiGHS status codes to `SolveStatus` enum
- Extract sensitivity data when available
- Provide reference implementations and test fixtures for verifying the TypeScript solver bridge

**Interfaces**:
- **Input**: `&Model` plus optional `SolveOptions` (time limit, etc.)
- **Output**: `Solution` (status, objective, variable values, timing, sensitivity)
- **Dependencies**: `solvable-core`, `highs` crate

### solvable-wasm (Rust crate, `cdylib` target)

**Purpose**: Thin `wasm-bindgen` layer that exposes `parse` and `version` to JavaScript. Compiled to WASM via `wasm-pack` targeting `wasm32-unknown-unknown`. Does NOT include the solver — solving is handled by `highs-js` in the worker.

**Responsibilities**:
- Call `solvable-core` parser and validator
- Serialize parse results to JSON via `serde_json`
- Handle panics gracefully (return error JSON, never crash)

**Interfaces**:
- **Input**: `&str` (LP format string) from JavaScript
- **Output**: JSON string (`ParseResult`)
- **Dependencies**: `solvable-core`, `wasm-bindgen`, `serde`, `serde_json`

### Model bridge (TypeScript, in Web Worker)

**Purpose**: Convert the parsed `Model` JSON from `solvable-core` WASM into the format expected by `highs-js`, and convert `highs-js` results back into the `SolveResult` format.

**Responsibilities**:
- Transform `Model` (variables, constraints, objective) into `highs-js` problem format (column-oriented sparse matrix)
- Call `highs-js` solve with options (time limit)
- Map `highs-js` status codes to `SolveStatus`
- Extract variable values, objective, sensitivity data from `highs-js` solution
- Package results as `SolveResult` JSON

### parser.ts (TypeScript, main thread)

**Purpose**: Load `solvable-core` WASM on the main thread for instant parse feedback.

**Responsibilities**:
- Load the lightweight parser WASM module on page init
- Provide synchronous-feeling `parse(lpString: string): ParseResult` API (WASM calls are synchronous once loaded)
- Report load failure with a clear error message if WASM initialization fails

**Interfaces**:
- **Input**: `parse(lpString: string): ParseResult`
- **Output**: Typed result with errors and model summary
- **Dependencies**: `solvable-wasm` WASM module

### solver.ts (TypeScript, main thread)

**Purpose**: Manage the solver Web Worker lifecycle and provide an async API for the UI.

**Responsibilities**:
- Spawn and terminate the solver Web Worker
- Post solve messages and return Promises
- Track loading state: `not-loaded | loading | ready | reinitializing`
- Implement cancel by terminating the worker, then automatically respawn and reinitialize
- Queue solve requests received during `reinitializing` state — execute when ready
- Detect WASM load failure via worker `error` event and surface to the UI with browser requirements

**Interfaces**:
- **Input**: `solve(lpString: string): Promise<SolveResult>`
- **Input**: `cancel(): void`
- **Output**: Typed result objects
- **Dependencies**: `solver-worker.ts`

### solver-worker.ts (TypeScript, Web Worker)

**Purpose**: Load `highs-js` WASM and the model bridge, handle solve messages from the main thread.

**Responsibilities**:
- Initialize `highs-js` WASM module on worker startup
- Listen for solve messages containing the parsed `Model` JSON
- Use the model bridge to convert `Model` → `highs-js` format, solve, convert results back
- Post `SolveResult` JSON back to main thread
- Report loading completion (or failure) to main thread

## Data Models

```rust
// solvable-core
pub struct Model {
    pub name: Option<String>,
    pub sense: Sense,
    pub objective: LinearExpression,
    pub variables: Vec<Variable>,
    pub constraints: Vec<Constraint>,
}

pub struct ParseError {
    pub line: usize,
    pub column: usize,
    pub message: String,
}

// solvable-solver
pub struct Solution {
    pub status: SolveStatus,
    pub objective_value: Option<f64>,
    pub variable_values: HashMap<String, f64>,
    pub solve_time_ms: f64,
    pub sensitivity: Option<SensitivityReport>,
}

pub struct SolveOptions {
    pub time_limit_seconds: Option<f64>,
}
```

```typescript
// TypeScript interfaces for JSON results
interface SolveResult {
  status: "Optimal" | "Infeasible" | "Unbounded" | "TimeLimit" | "Error";
  objective_value: number | null;
  variable_values: Record<string, number>;
  solve_time_ms: number;
  error_message?: string;
  sensitivity?: SensitivityReport; // null for MIP solves
}

interface ParseResult {
  success: boolean;
  errors: Array<{ line: number; column: number; message: string }>;
  summary?: { num_variables: number; num_constraints: number; sense: string };
  model?: Model; // parsed model JSON, passed to worker for solving
}
```

## HiGHS WASM Compilation Strategy

**Primary approach (recommended)**: Use the `highs-js` npm package — HiGHS pre-compiled to WASM via Emscripten, battle-tested, and maintained. Call it from TypeScript in the Web Worker. The Rust `solvable-core` crate handles parsing and validation (compiled to WASM via `wasm-pack` targeting `wasm32-unknown-unknown`), and TypeScript bridges the parsed model to `highs-js` for solving. This cleanly separates concerns: Rust for parsing, `highs-js` for solving.

**Why not compile the Rust `highs` crate to WASM?** The `highs` Rust crate builds HiGHS C++ source via the `cc` crate. The `cc` crate has no C++ compiler under `wasm32-unknown-unknown` — it will fail. Using `wasm32-unknown-emscripten` brings Emscripten's clang but `wasm-bindgen` does not fully support emscripten targets, creating friction across the entire WASM binding layer.

**Alternative approach (spike if primary is insufficient)**: Compile HiGHS C++ directly to WASM via Emscripten alongside the Rust WASM module, using separate compilation. The Rust crate would call HiGHS via FFI against the Emscripten-compiled WASM. More complex build chain but keeps everything in one WASM module.

**Bundle size target**: < 2MB gzipped. Mitigations: `wasm-opt -Os` on the parser WASM, lazy loading both WASM modules, streaming compilation, brotli compression.

## Error Handling

- Parser errors: collected as `Vec<ParseError>` with line/column numbers, returned as JSON array
- Solver errors: mapped from `highs-js` status codes to `SolveStatus` enum in the model bridge
- WASM panics in parser: caught via `console_error_panic_hook`, returned as error JSON
- Worker crashes: detected by main thread via worker `error` event, reported to UI as solve failure, worker respawned
- WASM load failure: detected during initialization (both parser WASM and `highs-js` WASM), surfaced to UI with clear error message and supported browser requirements
- Cancel reinitialization: after worker termination, new worker spawns and loads `highs-js` WASM; `solver.ts` tracks `reinitializing` state and queues any pending solve requests

## Testing Strategy

- **solvable-core**: Unit tests for parser against a corpus of LP files (valid and malformed). Property-based tests for round-trip parsing.
- **solvable-solver**: Integration tests that solve known LP/MIP problems and verify optimal values within tolerance.
- **solvable-wasm**: `wasm-pack test --node` to verify JSON serialization and end-to-end solve in a Node.js WASM runtime.
- **Web Worker**: Manual testing in browser. Verify non-blocking behavior with a slow MIP solve.
