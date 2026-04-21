import type { Lesson } from "../types";

export const lesson2: Lesson = {
  id: "finding-the-signal",
  title: "Finding the Signal",
  blocks: [
    {
      type: "prose",
      content: `A production model returns 200 variables and 80 constraints.
The planner needs an answer in 30 seconds. You can't hand them a spreadsheet
of 200 rows and say "here's the plan."

The skill is filtering. Most of the output is noise — variables that didn't change,
constraints with plenty of slack, penalty variables at zero. The signal is buried
in 5-10 rows.`,
    },
    {
      type: "prose",
      content: `<h3>The filtering pattern</h3>

Start with the full output. Then apply three filters in sequence:

<strong>Filter 1: Non-zero penalty variables.</strong> These are the compromises.
Sort them by cost contribution (penalty coefficient &times; variable value).
The most expensive compromise is the headline.

<strong>Filter 2: Largest variable movements.</strong> Compare today's plan to
yesterday's. Rank variables by absolute change. The top 5 tell the story of
what moved.

<strong>Filter 3: Upstream bottlenecks.</strong> For each major compromise or movement,
look at the constraints feeding into it. Which capacity, contract, or resource
limit is forcing this? That's the "why."`,
    },
    {
      type: "prose",
      content: `After these three filters, you're down to a handful of numbers.
The planner sees: "Nashville is being shorted 45 units ($450K penalty)
because the Southeast carrier is at its volume cap." That's a 15-second read.
The other 195 variables are noise.`,
    },
    {
      type: "prediction",
      question: "Your model has 150 variables. 12 are penalty variables. Of those 12, 3 are non-zero. What do you report?",
      options: [
        "All 150 variable values in a dashboard",
        "The 12 penalty variables — they're the ones that matter structurally",
        "The 3 non-zero penalty variables, sorted by cost contribution, with the upstream constraint that caused each one",
      ],
      correct_index: 2,
      explanation: "Zero-valued penalty variables mean the solver didn't need to compromise there — they're noise. The 3 non-zero ones are the entire story. Sort by cost (which compromise is most expensive) and trace each to the constraint that forced it (the bottleneck). That's what the planner needs.",
    },
    {
      type: "go_deeper",
      title: "What about variables that aren't penalties?",
      content: `Decision variables (how much to ship, which facility to use) are
the outputs the planner acts on. But they're only interesting in context — "ship 300 units
to Nashville" means nothing unless you also know that yesterday it was 100 and the
reason it tripled is that the Dallas DC went offline.

The filtering pattern applies to decision variables too: compare to previous plan,
rank by absolute change, trace the change to an input or constraint. But penalty variables
come first because they represent <em>problems</em> — things the solver couldn't fully satisfy.
Decision variable changes are <em>adjustments</em>, which matter less unless they're large.`,
    },
    {
      type: "checkpoint",
      message: "You can filter solver output to the signal: non-zero penalties sorted by cost, largest movements, and upstream bottlenecks.",
    },
  ],
};
