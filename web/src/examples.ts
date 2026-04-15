import production_mix from "../../examples/production_mix.lp?raw";
import diet_problem from "../../examples/diet_problem.lp?raw";
import transportation from "../../examples/transportation.lp?raw";
import knapsack from "../../examples/knapsack.lp?raw";
import portfolio from "../../examples/portfolio.lp?raw";

export interface Example {
  name: string;
  description: string;
  lp_text: string;
}

export const EXAMPLES: Example[] = [
  {
    name: "Production Mix",
    description: "Maximize profit from two products with capacity constraints",
    lp_text: production_mix,
  },
  {
    name: "Diet Problem",
    description: "Minimize food cost while meeting nutritional requirements",
    lp_text: diet_problem,
  },
  {
    name: "Transportation",
    description: "Ship goods from warehouses to stores at minimum cost",
    lp_text: transportation,
  },
  {
    name: "Knapsack (Integer)",
    description: "Select items to maximize value under a weight limit",
    lp_text: knapsack,
  },
  {
    name: "Portfolio",
    description: "Allocate investments to maximize expected return",
    lp_text: portfolio,
  },
];

export const DEFAULT_EXAMPLE = EXAMPLES[0];
