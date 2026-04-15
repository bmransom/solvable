export interface ParseError {
  line: number;
  column: number;
  message: string;
  severity: "Error" | "Warning";
}

export interface ModelSummary {
  variable_count: number;
  constraint_count: number;
  sense: "Minimize" | "Maximize";
  has_integer_variables: boolean;
}

export interface ParseResult {
  model: unknown | null;
  errors: ParseError[];
  summary: ModelSummary | null;
}

export interface SolveResult {
  status: "Optimal" | "Infeasible" | "Unbounded" | "TimeLimit" | "Error";
  objective_value: number | null;
  variable_values: Record<string, ColumnInfo>;
  constraint_values: Record<string, RowInfo>;
  solve_time_ms: number;
  error_message?: string;
}

export interface ColumnInfo {
  name: string;
  index: number;
  primal: number;
  dual: number;
  basis_status: string;
  lower: number | null;
  upper: number | null;
  type: string;
}

export interface RowInfo {
  name: string;
  index: number;
  primal: number;
  dual: number;
  basis_status: string;
  lower: number | null;
  upper: number | null;
}

export type SolverState = "not-loaded" | "loading" | "ready" | "solving" | "reinitializing";

export interface SolverMessage {
  type: "solve";
  lp_string: string;
}

export interface SolverResponse {
  type: "ready" | "result" | "error";
  result?: SolveResult;
  error?: string;
}
