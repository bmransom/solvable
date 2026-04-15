import type { SolverMessage, SolverResponse, SolveResult, ColumnInfo, RowInfo } from "./types";

let highs: any = null;

async function initializeSolver() {
  try {
    const highsLoader = (await import("highs")).default;
    highs = await highsLoader({
      locateFile: (file: string) => {
        return new URL(`../node_modules/highs/build/${file}`, import.meta.url).href;
      },
    });
    const response: SolverResponse = { type: "ready" };
    self.postMessage(response);
  } catch (error) {
    const response: SolverResponse = {
      type: "error",
      error: `Failed to initialize HiGHS solver: ${error}`,
    };
    self.postMessage(response);
  }
}

function solve(lp_string: string): SolveResult {
  const start_time = performance.now();

  try {
    const solution = highs.solve(lp_string, {
      presolve: "on",
      // output_flag must stay true — setting it to false crashes MIP solves
      // because the JS wrapper parses stdout to build the solution object
    });

    const elapsed_ms = performance.now() - start_time;

    const status = mapStatus(solution.Status);

    if (status === "Optimal") {
      const variable_values: Record<string, ColumnInfo> = {};
      for (const [name, column] of Object.entries(solution.Columns) as [string, any][]) {
        variable_values[name] = {
          name: column.Name,
          index: column.Index,
          primal: column.Primal ?? 0,
          dual: column.Dual ?? 0,
          basis_status: column.Status ?? "",
          lower: column.Lower,
          upper: column.Upper,
          type: column.Type ?? "Continuous",
        };
      }

      const constraint_values: Record<string, RowInfo> = {};
      if (Array.isArray(solution.Rows)) {
        for (const row of solution.Rows as any[]) {
          const row_name = row.Name || `row_${row.Index}`;
          constraint_values[row_name] = {
            name: row_name,
            index: row.Index,
            primal: row.Primal ?? 0,
            dual: row.Dual ?? 0,
            basis_status: row.Status ?? "",
            lower: row.Lower,
            upper: row.Upper,
          };
        }
      }

      return {
        status: "Optimal",
        objective_value: solution.ObjectiveValue,
        variable_values,
        constraint_values,
        solve_time_ms: elapsed_ms,
      };
    }

    return {
      status,
      objective_value: null,
      variable_values: {},
      constraint_values: {},
      solve_time_ms: elapsed_ms,
    };
  } catch (error) {
    return {
      status: "Error",
      objective_value: null,
      variable_values: {},
      constraint_values: {},
      solve_time_ms: performance.now() - start_time,
      error_message: `${error}`,
    };
  }
}

function mapStatus(highs_status: string): SolveResult["status"] {
  switch (highs_status) {
    case "Optimal":
      return "Optimal";
    case "Infeasible":
      return "Infeasible";
    case "Unbounded":
      return "Unbounded";
    case "Time limit reached":
    case "Iteration limit reached":
      return "TimeLimit";
    default:
      return "Error";
  }
}

self.onmessage = (event: MessageEvent<SolverMessage>) => {
  const message = event.data;

  if (message.type === "solve") {
    if (!highs) {
      const response: SolverResponse = {
        type: "error",
        error: "Solver not initialized yet",
      };
      self.postMessage(response);
      return;
    }

    const result = solve(message.lp_string);
    const response: SolverResponse = { type: "result", result };
    self.postMessage(response);
  }
};

initializeSolver();
