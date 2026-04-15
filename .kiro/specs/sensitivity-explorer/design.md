# Sensitivity Explorer - Design

## Overview

The sensitivity explorer builds on the interactive plot's parameter slider system to create a dedicated sensitivity teaching environment. It adds three capabilities beyond basic sliders: (1) annotating sliders with shadow prices and allowable ranges from the solve, (2) detecting and visualizing basis changes, and (3) Monte Carlo robustness testing via batch solving.

## Components

### SensitivitySlider.svelte

**Purpose**: Enhanced parameter slider showing sensitivity information.

**Displays**:
- Current value and slider track
- Shadow price (for RHS sliders) or reduced cost (for objective sliders) as a number
- Allowable range as a colored segment on the slider track (green = current basis valid)
- "Basis changed!" indicator when dragging past the range boundary

**Implementation**: On each solve, extract dual values from `highs-js` solution:
- Row duals = shadow prices
- Column duals = reduced costs
- Allowable ranges: since `highs-js` doesn't expose ranging data, compute empirically by binary-searching for the breakpoint (the RHS value where a different vertex becomes optimal). For 2-variable problems with <10 constraints, this takes <10 solves at <5ms each — negligible.

### BasisChangeDetector (basis-change.ts)

**Purpose**: Detect when a parameter change causes the optimal basis to change.

**Implementation**: Compare the basis status strings from consecutive solves. If any variable's basis status changes (BS→LB, LB→BS, etc.), a basis change occurred.

```typescript
interface BasisSnapshot {
  variable_statuses: Record<string, string>;  // "BS", "LB", "UB"
  constraint_statuses: Record<string, string>;
  objective_value: number;
}

function detectBasisChange(before: BasisSnapshot, after: BasisSnapshot): boolean;
```

### MonteCarloRunner (monte-carlo.ts)

**Purpose**: Run batch solves with perturbed parameters for robustness analysis.

**Implementation**:
1. Accept: base model, parameter uncertainty ranges, sample count
2. For each sample: perturb parameters uniformly, serialize to LP, solve via worker
3. Collect: basis snapshots, objective values
4. Compute: basis stability percentage, objective distribution, worst case
5. Identify most sensitive parameters by measuring objective variance contribution

**Performance**: 100 solves of a 2-variable LP at ~5ms each = 500ms total. Run in the Web Worker sequentially (worker is single-threaded). Show a progress bar.

```typescript
interface RobustnessResult {
  sample_count: number;
  basis_stability_percentage: number;  // % of samples with same basis as nominal
  objective_mean: number;
  objective_std_dev: number;
  objective_worst_case: number;
  objective_best_case: number;
  parameter_sensitivity_ranking: Array<{ parameter: string; variance_contribution: number }>;
}
```

### RobustnessPanel.svelte

**Purpose**: Display Monte Carlo results.

- Histogram of objective values (SVG bar chart)
- Basis stability gauge (percentage circle)
- Parameter sensitivity ranking (sorted bar chart)
- "Sensitive" / "Robust" badge based on 80% threshold

### BindingConstraintOverlay

Integrated into the interactive plot via the existing constraint hover system:
- Binding constraints: thick line + glow effect
- Non-binding constraints: thin line + reduced opacity
- Hover tooltip with slack value and shadow price

## Ranging Data Workaround

Since `highs-js` doesn't expose the HiGHS ranging API, we compute allowable ranges empirically for 2-variable problems:

1. Start from the current optimal
2. Binary search on the parameter value to find where the basis changes
3. The search boundary is the allowable range limit

For RHS ranges: vary the RHS from current value outward in both directions, re-solving at each step, until the basis snapshot changes. Use binary search with tolerance 0.01.

For objective coefficient ranges: same approach, varying the coefficient.

This is only feasible for small models (fast solve times). For larger models in the sandbox, ranges would not be available without a `highs-js` fork.

## Testing Strategy

- **Basis change detection**: Unit test with two known solves that differ in basis
- **Monte Carlo**: Integration test with a model where one parameter clearly causes instability
- **Empirical ranging**: Verify computed ranges match hand-calculated ranges for the production mix model
- **UI**: Manual browser testing of slider interactions, basis change indicators, histogram rendering
