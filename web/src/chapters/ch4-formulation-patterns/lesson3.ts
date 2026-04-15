import type { Lesson } from "../types";

export const lesson3: Lesson = {
  id: "formulation-tips",
  title: "Formulation Tips for Engineers",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Now that you know the patterns, here are the practical tips that separate
        a working model from a good model.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Tip 1: Name everything</h3>
        <p>Use descriptive variable names like <code>ship_warehouse1_store3</code> instead of
        <code>x13</code>. Name every constraint. When the model is infeasible and you're
        debugging at 2 AM, you'll thank yourself.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Tip 2: Start with a simple model and add complexity</h3>
        <p>Don't model everything at once. Start with the core objective and the most
        obvious constraints. Solve it. Verify the answer makes sense. Then add constraints
        one at a time, solving after each addition.</p>
        <p>If the model becomes infeasible after adding a constraint, you know exactly
        which constraint caused the conflict.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Tip 3: Beware big-M constraints</h3>
        <p>When you need "if-then" logic (e.g., "if the warehouse is open, then it can
        ship up to 1000 units"), the standard technique uses a large constant M:</p>
        <p><code>ship_from_warehouse1 <= M * is_warehouse1_open</code></p>
        <p>If <code>is_warehouse1_open = 0</code>, then <code>ship ≤ 0</code> (can't ship).
        If <code>is_warehouse1_open = 1</code>, then <code>ship ≤ M</code> (effectively unconstrained).</p>
        <p>The danger: if M is too large (e.g., 999999), the LP relaxation becomes very weak
        and the solver takes much longer. <strong>Always make M as small as possible</strong> —
        use the tightest valid upper bound.</p>
      `,
    },
    {
      type: "prediction",
      question: "If a warehouse can ship at most 1000 units, what should M be?",
      options: [
        "999999 (a very large number to be safe)",
        "1000 (the actual capacity)",
        "10000 (10x the capacity for safety margin)",
      ],
      correct_index: 1,
      explanation: `M should be exactly 1000 — the tightest valid bound. Using 999999 is technically correct
        but makes the LP relaxation almost useless, causing the solver to explore far more branches.
        A tight M = 1000 means the LP relaxation closely approximates the integer problem, giving
        the solver much better bounds and faster convergence.`,
    },
    {
      type: "prose",
      content: `
        <h3>Tip 4: Check your objective direction</h3>
        <p>A surprising number of real-world modeling bugs come from maximizing when you
        should minimize, or vice versa. If your "cost minimization" returns a suspiciously
        large number, check whether you accidentally wrote <code>Maximize</code>.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You have the formulation toolkit: patterns for common problems, naming discipline, incremental modeling, and big-M awareness.",
    },
  ],
};
