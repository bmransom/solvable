import type { Lesson } from "../types";

export const lesson2: Lesson = {
  id: "re-solving-and-warm-starting",
  title: "Re-solving and Warm Starting",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Many production optimization systems solve the same problem repeatedly with
        slightly different data: a dispatch system re-optimizes routes every 15 minutes
        as new orders arrive, a pricing engine re-solves hourly as demand shifts.</p>
        <p>The naive approach: build a fresh model from scratch each time. The smart
        approach: exploit the similarity between consecutive solves.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Warm starting</h3>
        <p>Warm starting means giving the solver a head start using information from a
        previous solve. How this works depends on the problem type:</p>
        <p><strong>For LP</strong>: the solver can warm-start with the previous
        <strong>basis</strong>. If only a few coefficients changed, the previous basis is
        still feasible (or close to it), and simplex only needs a few pivots to re-optimize
        instead of starting from scratch. For large-scale LPs with millions of variables,
        this can reduce solve time from minutes to seconds. Basis warm-starting is one of
        the main reasons simplex remains competitive with interior point methods for
        re-solving workflows, even though barrier may be faster on a cold start.</p>
        <p><strong>For MIP</strong>: you can pass a feasible solution as a warm start,
        giving the solver an immediate incumbent. This can dramatically reduce solve time
        because:</p>
        <ul>
          <li>The solver can prune branches immediately (anything worse than the warm start is pruned)</li>
          <li>The gap starts small instead of at infinity</li>
          <li>If the data didn't change much, the warm start might already be optimal or near-optimal</li>
        </ul>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Incremental model updates</h3>
        <p>Instead of rebuilding the entire model, some solver APIs let you modify the
        existing model in place: change a coefficient, add a constraint, remove a variable.
        The solver can then re-optimize from the current basis, which is much faster than
        solving from scratch.</p>
        <p>This is particularly effective when:</p>
        <ul>
          <li>Only a few constraints change between solves (e.g., updated demand forecasts)</li>
          <li>You're adding new variables (e.g., a new order arrives)</li>
          <li>You're doing sensitivity analysis by varying one parameter at a time</li>
        </ul>
      `,
    },
    {
      type: "prediction",
      question: "Your dispatch system solves a 10,000-variable MIP every 15 minutes. Each solve takes 45 seconds. New orders arrive between solves, changing ~5% of the data. What's the most effective speedup?",
      options: [
        "Buy a faster machine",
        "Warm-start with the previous solution - the solver skips discovering a feasible solution and can prune more branches immediately",
        "Reduce the model size by aggregating orders",
      ],
      correct_index: 1,
      explanation: `When consecutive solves are similar, warm starting is often the single biggest speedup.
        The previous solution is likely still feasible (or close to it) for the updated problem.
        The solver gets a strong incumbent immediately, pruning large parts of the B&B tree.
        In practice, this can reduce solve time from 45 seconds to 5-10 seconds for small data changes.`,
    },
    {
      type: "checkpoint",
      message: "You understand warm starting and incremental re-solving, the key techniques for production optimization systems that solve repeatedly.",
    },
  ],
};
