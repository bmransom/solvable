import type { Lesson } from "../types";

export const lesson3: Lesson = {
  id: "debugging-models",
  title: "A Debugging Checklist",
  blocks: [
    {
      type: "prose",
      content: `
        <p>When your model doesn't behave as expected, work through this checklist:</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>1. Check the objective direction</h3>
        <p>Are you maximizing when you should minimize? This is the most common bug
        and the easiest to miss.</p>

        <h3>2. Check constraint signs</h3>
        <p>Is every ≤ / ≥ / = correct? Flipping a sign turns a valid constraint into
        a contradictory one.</p>

        <h3>3. Check units</h3>
        <p>Are all coefficients in the same units? Mixing dollars with cents, or
        kilograms with pounds, produces nonsensical results that "look reasonable."</p>

        <h3>4. Solve a tiny version first</h3>
        <p>Before running the full 10,000-variable model, solve a 3-variable version
        where you can verify the answer by hand. If the small version is wrong, the
        large version will be wrong too.</p>

        <h3>5. Check for infeasibility systematically</h3>
        <p>If infeasible: remove constraints one at a time until it becomes feasible.
        The last constraint you removed is part of the conflict. Solvers can also compute
        the IIS automatically.</p>

        <h3>6. Check for unboundedness</h3>
        <p>If unbounded: add constraints one at a time. Which constraint, when added,
        makes the problem bounded? That's the constraint you were missing.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>These steps work for models of any size. The interactive plots in this tutorial
        give you visual intuition for 2-variable problems, but the debugging principles
        are the same for problems with thousands of variables.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You have a systematic debugging approach for optimization models: check direction, signs, units, then isolate the problem incrementally.",
    },
  ],
};
