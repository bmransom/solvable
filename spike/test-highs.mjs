import highsLoader from "highs";

const highs = await highsLoader();

// --- Feasible LP: Production Mix ---
// Maximize 5x + 4y
// Subject to:
//   x + y <= 10
//   x <= 6
//   y <= 8
//   x, y >= 0
const PRODUCTION_MIX = `Maximize
 obj: 5 x + 4 y
Subject To
 capacity: x + y <= 10
 x_limit: x <= 6
 y_limit: y <= 8
Bounds
 0 <= x
 0 <= y
End`;

console.log("=== Feasible LP: Production Mix ===");
const feasibleSolution = highs.solve(PRODUCTION_MIX);
console.log("Status:", feasibleSolution.Status);
console.log("Objective Value:", feasibleSolution.ObjectiveValue);
console.log("Columns:", JSON.stringify(feasibleSolution.Columns, null, 2));
console.log("Rows:", JSON.stringify(feasibleSolution.Rows, null, 2));

// --- Feasible LP with ranging (sensitivity analysis) ---
console.log("\n=== Feasible LP with Ranging (Sensitivity) ===");
const rangingSolution = highs.solve(PRODUCTION_MIX, { ranging: "on" });
console.log("Status:", rangingSolution.Status);
console.log("Columns:", JSON.stringify(rangingSolution.Columns, null, 2));
console.log("Rows:", JSON.stringify(rangingSolution.Rows, null, 2));

// --- Infeasible LP ---
// x <= 2 AND x >= 5 is infeasible
const INFEASIBLE_PROBLEM = `Minimize
 obj: x
Subject To
 c1: x <= 2
 c2: x >= 5
Bounds
 0 <= x
End`;

console.log("\n=== Infeasible LP ===");
const infeasibleSolution = highs.solve(INFEASIBLE_PROBLEM);
console.log("Status:", infeasibleSolution.Status);
console.log("Full result:", JSON.stringify(infeasibleSolution, null, 2));

// --- MIP: Integer programming ---
const MIP_PROBLEM = `Maximize
 obj: 5 x + 4 y
Subject To
 capacity: x + y <= 10
 x_limit: x <= 6
 y_limit: y <= 8
Bounds
 0 <= x
 0 <= y
General
 x y
End`;

console.log("\n=== MIP: Integer Variables ===");
const mipSolution = highs.solve(MIP_PROBLEM);
console.log("Status:", mipSolution.Status);
console.log("Objective Value:", mipSolution.ObjectiveValue);
console.log("Columns:", JSON.stringify(mipSolution.Columns, null, 2));
