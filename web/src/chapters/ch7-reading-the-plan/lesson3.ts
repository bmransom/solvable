import type { Lesson } from "../types";

export const lesson3: Lesson = {
  id: "telling-the-story",
  title: "Telling the Story",
  blocks: [
    {
      type: "prose",
      content: `You've filtered the output to the signal. Now translate it.

The planner doesn't speak solver. They don't know what <code>unmet_demand_nashville</code>
means, and they shouldn't have to. Your job is to translate solver output into
a business recommendation that they can act on — or override — in 30 seconds.`,
    },
    {
      type: "prose",
      content: `<h3>The translation pattern</h3>

Every solver output has three layers:

<strong>Layer 1: Variable names → business terms.</strong>
<code>unmet_demand_nashville = 45</code> → "We're shorting Nashville 45 units."

<strong>Layer 2: Constraint status → bottleneck narrative.</strong>
"The Southeast carrier is at its 500-unit volume cap" → "that's why Nashville is
being shorted — there's no carrier capacity left in the region."

<strong>Layer 3: Cost → business impact.</strong>
"Shorting Nashville costs $450,000 in penalty. Expanding the carrier contract
by 45 units would eliminate this penalty." → Now the planner has a decision to make.`,
    },
    {
      type: "prose",
      content: `Notice what's NOT in the narrative: shadow prices, reduced costs, basis status,
dual values. Those are solver internals. The planner needs:
<ul>
<li>What happened (Nashville is being shorted)</li>
<li>Why (carrier is maxed)</li>
<li>What it costs ($450K)</li>
<li>What would fix it (expand the contract by 45 units)</li>
</ul>

That's it. Four sentences. The solver gave you 200 variables and 80 constraints
to get there, but the planner sees four sentences.`,
    },
    {
      type: "prediction",
      question: "The solver output shows carrier_southeast_slack = 0 and overflow_memphis = 120. Which summary do you send to the planner?",
      options: [
        "The Southeast carrier constraint has zero slack and its shadow price is $3.50. Memphis overflow variable is at 120 with a reduced cost of $0.",
        "The Southeast carrier hit its volume cap. 120 units are overflowing through Memphis at an extra $2/unit ($240 total). We should renegotiate the carrier contract or find an alternate route.",
        "Constraint 7 is binding. Variable x_12 = 120. Objective contribution: $240.",
      ],
      correct_index: 1,
      explanation: "Option B is the business translation. It says what happened (carrier maxed), the consequence (Memphis overflow), the cost ($240), and the recommendation (renegotiate or find alternatives). The planner can act on this. Options A and C use solver jargon that the planner can't act on.",
    },
    {
      type: "go_deeper",
      title: "Shadow prices and reduced costs — the solver internals",
      content: `The solver gives you numbers that can inform your narrative, even if
you never show them to the planner:

<strong>Shadow price</strong> = the rate of change of the objective per unit increase in a constraint's RHS.
"Shadow price of $3.50 on the carrier capacity" means each additional unit of carrier capacity
saves $3.50 in total cost. In your report: "expanding the carrier contract by 100 units
would save roughly $350 per planning cycle."

<strong>Reduced cost</strong> = how much a variable's cost must improve before it enters the solution.
"Supplier X has a reduced cost of $0.80" means it won't be used until its price drops by
at least $0.80/unit. In your report: "Supplier X is $0.80/unit too expensive to be competitive."

These are tools for building the narrative, not outputs for the planner.
You translate them into business language before they leave your system.`,
    },
    {
      type: "checkpoint",
      message: "You can translate solver output into a business narrative: what happened, why, what it costs, and what would fix it.",
    },
  ],
};
