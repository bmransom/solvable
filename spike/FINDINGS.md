# HiGHS WASM Spike Findings

## Package Details

- **npm package name:** `highs` (published as `highs`, repo is `lovasoa/highs-js`)
- **Version installed:** 1.8.0
- **WASM bundle size:** 2.7 MB (`node_modules/highs/build/highs.wasm`)
- **JS wrapper size:** 27 KB (`node_modules/highs/build/highs.js`)
- **Types:** Shipped as `types.d.ts` (comprehensive, 748 lines)

## API Summary

### Initialization

```js
import highsLoader from "highs";
const highs = await highsLoader();

// In browser, pass locateFile to find the .wasm file:
const highs = await highsLoader({
  locateFile: (file) => `/assets/${file}`
});
```

The loader returns a `Promise<Highs>`. The `Highs` object has a single method: `solve()`.

### Solving Problems

```js
const solution = highs.solve(problemString, options);
```

**Input format:** Problems must be passed as a string in
[CPLEX LP format](http://web.mit.edu/lpsolve/doc/CPLEX-format.htm). There is no
programmatic model-building API (no `addVariable()`, `addConstraint()`, etc.).
You construct the LP/MIP as a text string.

Example LP format:

```
Maximize
 obj: 5 x + 4 y
Subject To
 capacity: x + y <= 10
 x_limit: x <= 6
Bounds
 0 <= x
 0 <= y
General
 x y
End
```

- `General` section declares integer variables (for MIP).
- `Bounds` section sets variable bounds (unbounded upper by default if omitted).
- Constraint names (e.g. `capacity:`) are optional but recommended.

### Solution Object

For a feasible LP:

```js
{
  Status: "Optimal",          // HighsModelStatus string
  ObjectiveValue: 46,
  Columns: {
    x: {
      Index: 0,
      Status: "BS",           // Basis status: BS, LB, UB, FX, FR, NB
      Lower: 0,
      Upper: null,            // null = infinity
      Primal: 6,              // Variable value
      Dual: 0,                // Reduced cost
      Name: "x",
      Type: "Continuous"
    },
    // ...
  },
  Rows: [
    {
      Index: 0,
      Status: "UB",
      Lower: null,
      Upper: 10,
      Primal: 10,            // Constraint activity
      Dual: 4,               // Shadow price
      Name: "capacity"
    },
    // ...
  ]
}
```

For MIP solutions, columns omit `Status` and `Dual` fields (no LP basis info)
and include `Type: "Integer"`.

For infeasible models:

```js
{
  Status: "Infeasible",
  ObjectiveValue: 0,
  Columns: { x: { Index, Lower, Upper, Name, Type } },  // No Primal/Dual
  Rows: [ { Index, Lower, Upper, Name } ]                // No Primal/Dual
}
```

### Status Values

`Status` is one of: `"Optimal"`, `"Infeasible"`, `"Unbounded"`,
`"Not Set"`, `"Load error"`, `"Model error"`, `"Time limit reached"`,
`"Iteration limit reached"`, etc.

### Options

Passed as second argument to `solve()`:

```js
highs.solve(problem, {
  presolve: "on",           // "off" | "choose" | "on"
  solver: "simplex",        // "simplex" | "ipm" | "pdlp" | "choose"
  time_limit: 30,           // seconds
  ranging: "on",            // enable sensitivity analysis
  mip_rel_gap: 0.01,        // relative optimality gap for MIP
  output_flag: true,        // solver log output (MUST be true, see bug below)
});
```

## Sensitivity / Ranging Data

The `ranging: "on"` option is accepted but **does not add any extra fields to the
returned solution object**. The ranging data appears to be computed internally by
HiGHS but is not exposed through the JS wrapper's parsed output. The solution
object with `ranging: "on"` is identical to without it.

To get sensitivity data, you would need to either:
1. Fork the JS wrapper to parse HiGHS's ranging output
2. Use the raw C API via a custom WASM build
3. Extract it from solver log output (if HiGHS prints it)

## Issues and Surprises

1. **No programmatic model builder.** The only input format is CPLEX LP strings.
   For solvable, we will need to build our own model-building layer that
   serializes to LP format. This is straightforward but means the package is
   really just "HiGHS compiled to WASM with a string-in, object-out wrapper."

2. **`output_flag: false` crashes MIP solving.** Setting `output_flag: false`
   causes an `"Unable to parse solution. Too few lines."` error on MIP problems.
   The wrapper parses HiGHS's text output to build the solution object, so
   suppressing output breaks the parser. This is a known architectural fragility.
   LP solves are unaffected.

3. **`null` represents infinity.** Upper/Lower bounds use `null` instead of
   `Infinity` for unbounded values, despite the README example showing
   `Infinity`. The actual returned values are `null`.

4. **Ranging not surfaced.** See above -- sensitivity data is computed but not
   returned in the JS API.

5. **2.7 MB WASM binary.** Acceptable for a desktop-class solver, but needs
   consideration for initial page load. Should be lazy-loaded.

6. **Synchronous solve.** `solve()` is synchronous and blocks the main thread.
   For large problems in a browser, this will freeze the UI. Consider running
   in a Web Worker.

7. **Package maintenance.** Last published ~1 year ago. 4,300 weekly downloads.
   The underlying HiGHS solver is actively maintained, but this JS wrapper lags.

## Verified Working

- LP solving (continuous variables): correct optimal solution
- MIP solving (integer variables): correct optimal solution
- Infeasible detection: returns `Status: "Infeasible"` with no primal values
- Dual values (shadow prices) and reduced costs: present for LP solutions
- Basis status information: present for LP solutions
- Named constraints and variables: preserved in solution object
