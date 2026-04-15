# Sensitivity Report - Design

## Overview

The sensitivity report extracts dual values, reduced costs, and basis ranges from HiGHS after an LP solve and presents them in two organized tables within the results panel. This requires extending the Rust solver layer to extract sensitivity data from HiGHS and passing it through the WASM interface as part of the solution JSON.

## Architecture

```
HiGHS solve complete
        │
        ▼
┌───────────────────┐
│ solvable-solver    │  Extract row duals, col duals,
│ sensitivity.rs     │  ranging info from HiGHS API
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ SensitivityReport  │  Structured Rust types
│ (in Solution JSON) │  → serialized to JSON
└────────┬──────────┘
         │
         ▼
┌───────────────────┐
│ SensitivityView    │  Two-table display in
│ .svelte            │  the results panel
└───────────────────┘
```

## Components and Interfaces

### Sensitivity extraction (`sensitivity.rs` in solvable-solver, and `model-bridge.ts` for WASM)

**Purpose**: Extract sensitivity data from HiGHS after an LP solve.

**Responsibilities**:
- Call HiGHS ranging API to get objective coefficient ranges and RHS ranges
- Extract row dual values (shadow prices) and column dual values (reduced costs)
- Extract row activity values and compute slack/surplus (RHS - activity for <= constraints, activity - RHS for >= constraints)
- Extract basis status for each variable (basic, at lower bound, at upper bound, superbasic)
- Detect degeneracy: check if any basic variable is at a bound, or any binding constraint (zero slack) has a zero shadow price
- Package into `SensitivityReport` struct
- Skip extraction for MIP solves (sensitivity not meaningful for integer programs)
- Implement in both Rust (native tests) and TypeScript (model bridge for `highs-js`)

### Data Models

```rust
pub struct SensitivityReport {
    pub constraint_sensitivity: Vec<ConstraintSensitivity>,
    pub variable_sensitivity: Vec<VariableSensitivity>,
    pub is_degenerate: bool,  // true if degeneracy detected
}

pub struct ConstraintSensitivity {
    pub name: String,
    pub slack_or_surplus: f64,       // 0 = binding
    pub shadow_price: f64,
    pub rhs_value: f64,
    pub rhs_allowable_increase: f64, // f64::INFINITY for unbounded
    pub rhs_allowable_decrease: f64,
}

pub enum BasisStatus {
    Basic,
    AtLowerBound,
    AtUpperBound,
    Superbasic,
}

pub struct VariableSensitivity {
    pub name: String,
    pub value: f64,
    pub basis_status: BasisStatus,
    pub reduced_cost: f64,
    pub objective_coefficient: f64,
    pub objective_allowable_increase: f64,
    pub objective_allowable_decrease: f64,
}
```

### SensitivityView.svelte

**Purpose**: Render the sensitivity report as two clearly labeled tables.

**Responsibilities**:
- Constraints table: name, slack/surplus, shadow price, RHS value, allowable increase, allowable decrease
- Variables table: name, value, basis status, reduced cost, obj coefficient, allowable increase, allowable decrease
- Format infinity values as "Infinity"
- De-emphasize rows where slack is nonzero (non-binding constraints) — use slack, not shadow price, as the visual indicator because degenerate LPs can have binding constraints with zero shadow prices
- Show basis status as human-readable labels: "Basic", "At Lower Bound", "At Upper Bound"
- Show tab only for LP solutions, hidden for MIP with explanatory note
- When `is_degenerate` is true, display a brief educational note: "This LP has a degenerate solution — some sensitivity ranges may be zero or smaller than expected. This occurs when a basic variable is at one of its bounds."

## Testing Strategy

- **Rust tests**: Solve a known LP and verify sensitivity values match hand-calculated results
- **WASM tests**: Verify sensitivity data appears in JSON output for LP, absent for MIP
- **UI tests**: Verify tables render with correct data, infinity formatting, and MIP hiding behavior
