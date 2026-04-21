import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "where-the-solver-compromised",
  title: "Where the Solver Compromised",
  blocks: [
    {
      type: "prose",
      content: `Your solver returned "Optimal." But optimal doesn't mean perfect.
In production models, most constraints are kept feasible by design. The model
includes slack variables — penalty terms that let the solver violate a soft
constraint at a cost rather than going infeasible. The solver almost never
returns infeasible because the model is designed to absorb bad input by paying penalties.`,
    },
    {
      type: "prose",
      content: `This means the interesting output isn't "which constraints are binding"
in the textbook sense. It's: <strong>which penalty variables did the solver choose to use,
and how much did they cost?</strong>`,
    },
    {
      type: "prose",
      content: `Consider a supply chain model. You have demand at 5 regional DCs,
capacity at 3 warehouses, and carrier contracts with volume limits.
Instead of a hard constraint that says "meet all demand," the model says:

<code>shipped_to_nashville + unmet_demand_nashville = demand_nashville</code>

where <code>unmet_demand_nashville</code> has a penalty cost of $10,000/unit in the objective.
If the solver sets <code>unmet_demand_nashville = 45</code>, it chose to leave 45 units unmet
because fulfilling them was more expensive than the penalty.`,
    },
    {
      type: "prose",
      content: `That's the story. Not "constraint 14 is binding." The story is:
"The solver chose to short Nashville 45 units and pay the $450,000 penalty
rather than route through a more expensive carrier." Every non-zero penalty
variable is a compromise the solver made reluctantly. Those compromises are
what you report.`,
    },
    {
      type: "prediction",
      question: "Your solver returns Optimal with objective = $1,240,000. You see unmet_demand_nashville = 45 and overflow_memphis = 120. What should you investigate first?",
      options: [
        "The objective value — is $1,240,000 good or bad?",
        "The non-zero penalty variables — why is demand being shorted and where is overflow going?",
        "The binding constraints — which capacity limits are hit?",
      ],
      correct_index: 1,
      explanation: "The penalty variables tell you where the solver compromised. unmet_demand_nashville = 45 means Nashville is being shorted. overflow_memphis = 120 means Memphis is absorbing excess volume at a cost. These are the decisions the planner needs to understand — they're the story of the plan.",
    },
    {
      type: "checkpoint",
      message: "You understand that in production models, penalty variables — not binding constraints — tell you where the solver compromised and why.",
    },
  ],
};
