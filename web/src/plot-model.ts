export interface PlotModel {
  variables: [string, string];
  objective: { coefficients: [number, number]; sense: "max" | "min" };
  constraints: PlotConstraint[];
}

export interface PlotConstraint {
  name: string;
  coefficients: [number, number];
  operator: "<=" | ">=" | "=";
  rhs: number;
  enabled: boolean;
  color: string;
}

export interface SliderConfig {
  label: string;
  target:
    | { type: "rhs"; constraint_index: number }
    | { type: "objective"; variable_index: number }
    | { type: "bound"; variable: string; bound: "lower" | "upper" };
  min: number;
  max: number;
  step: number;
}

export function serialize_to_lp(model: PlotModel): string {
  const [var_x, var_y] = model.variables;
  const [obj_a, obj_b] = model.objective.coefficients;
  const sense = model.objective.sense === "max" ? "Maximize" : "Minimize";

  let lp = `${sense}\n  obj: ${format_term(obj_a, var_x, true)} ${format_term(obj_b, var_y, false)}\n`;
  lp += "Subject To\n";

  for (const constraint of model.constraints) {
    if (!constraint.enabled) continue;
    const [a, b] = constraint.coefficients;
    const op = constraint.operator === "<=" ? "<=" : constraint.operator === ">=" ? ">=" : "=";
    lp += `  ${constraint.name}: ${format_term(a, var_x, true)} ${format_term(b, var_y, false)} ${op} ${constraint.rhs}\n`;
  }

  lp += "Bounds\n";
  lp += `  0 <= ${var_x}\n`;
  lp += `  0 <= ${var_y}\n`;
  lp += "End\n";

  return lp;
}

function format_term(coefficient: number, variable: string, is_first: boolean): string {
  if (coefficient === 0) return is_first ? "0" : "";
  const sign = coefficient >= 0 ? (is_first ? "" : "+ ") : "- ";
  const abs_coeff = Math.abs(coefficient);
  const coeff_str = abs_coeff === 1 ? "" : `${abs_coeff} `;
  return `${sign}${coeff_str}${variable}`;
}
