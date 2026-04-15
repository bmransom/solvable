import type { Lesson } from "../types";

export const lesson4: Lesson = {
  id: "reading-solver-logs",
  title: "Reading Solver Logs",
  blocks: [
    {
      type: "prose",
      content: `
        <p>When the solver is slow or producing unexpected results, the log tells you
        what's happening inside. Most engineers ignore solver logs because they look like
        noise. Once you know what to look for, they're the fastest diagnostic tool you have.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>A typical HiGHS log</h3>
        <p>Here's what a MIP solve log looks like. We'll walk through each section.</p>
      `,
    },
    {
      type: "reveal",
      label: "Show example solver log",
      content: `Presolve: 847 rows, 1203 cols, 4521 nonzeros
  243 rows removed, 118 cols removed, 1056 nonzeros removed
Presolved: 604 rows, 1085 cols, 3465 nonzeros

Solving LP relaxation...
  Iteration 412: objective = 34521.7
  Optimal LP relaxation: 34521.7 (0.8s)

Solving MIP...
  Nodes |   B&B Tree    |  Objective Bounds  |  Dynamic Coverage
       |  Left   Expl   |  Primal     Dual   |  Gap     Time
  1    |  0      0.0%   |  inf        34521.7 |  -       0.9s
  12   |  8      2.1%   |  33850.0    34480.2 |  1.83%   1.2s
  87   |  34     14.5%  |  34200.0    34420.1 |  0.64%   2.1s
  245  |  12     67.3%  |  34380.0    34395.5 |  0.05%   3.4s
  312  |  0      100%   |  34380.0    34380.0 |  0.00%   3.9s

Optimal solution found.
Objective: 34380.0
Solve time: 3.9s
Nodes explored: 312`,
    },
    {
      type: "prose",
      content: `
        <h3>Section 1: Presolve</h3>
        <pre><code>Presolve: 847 rows, 1203 cols, 4521 nonzeros
  243 rows removed, 118 cols removed</code></pre>
        <p>Before solving, the solver simplifies the model. It removes redundant constraints,
        fixes variables with tight bounds, and substitutes out variables that can be expressed
        in terms of others.</p>
        <p><strong>What to look for</strong>:</p>
        <ul>
          <li>If presolve removes a large fraction of the model (>50% of rows/cols), your
          formulation has a lot of redundancy. This isn't a problem, but it means you might
          be able to simplify the model yourself for clarity.</li>
          <li>If presolve detects infeasibility, the log will say so immediately — you
          don't need to wait for the solve.</li>
          <li>If presolve removes very little, the model is tight. Good for solve time.</li>
        </ul>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Section 2: LP relaxation</h3>
        <pre><code>Optimal LP relaxation: 34521.7 (0.8s)</code></pre>
        <p>The solver first solves the LP relaxation (ignoring integer requirements).
        This gives the <strong>dual bound</strong> — the best possible value for the
        integer problem.</p>
        <p><strong>What to look for</strong>:</p>
        <ul>
          <li>If the LP relaxation takes a long time (many iterations), the model may be
          poorly scaled or have numerical issues.</li>
          <li>The relaxation value (34521.7) is the ceiling. The integer optimal will be
          at or below this for maximization.</li>
        </ul>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Section 3: Branch and bound progress</h3>
        <pre><code>  Nodes |  Primal     Dual    |  Gap     Time
  1     |  inf        34521.7  |  -       0.9s
  12    |  33850.0    34480.2  |  1.83%   1.2s
  87    |  34200.0    34420.1  |  0.64%   2.1s
  245   |  34380.0    34395.5  |  0.05%   3.4s</code></pre>
        <p>This is the main event. Each row shows a snapshot of the search:</p>
        <ul>
          <li><strong>Nodes</strong>: how many B&B nodes have been explored</li>
          <li><strong>Primal</strong>: the best integer solution found so far (the incumbent).
          Starts at infinity (no solution yet), then improves as the solver finds better solutions.</li>
          <li><strong>Dual</strong>: the best possible value remaining (the relaxation bound).
          Starts at the LP relaxation value, then decreases as branches are pruned.</li>
          <li><strong>Gap</strong>: <code>(dual - primal) / primal</code>. When this reaches
          your tolerance (e.g., 1%), you can stop.</li>
        </ul>
      `,
    },
    {
      type: "prediction",
      question: "After 12 nodes, the primal is 33850 and the dual is 34480. The gap is 1.83%. What does this tell you?",
      options: [
        "The solver is stuck and making no progress",
        "The solver found a feasible solution worth 33850 and has proven that no solution can exceed 34480 — the true optimum is somewhere in between",
        "The solver needs 1.83% more time to finish",
      ],
      correct_index: 1,
      explanation: `The gap tells you the window of uncertainty. The best known solution is 33850 (primal).
        The best possible solution is 34480 (dual). The integer optimum is guaranteed to be somewhere
        between these two values. As the solver explores more nodes, both bounds converge until
        they meet (gap = 0%) or you stop early at your tolerance.`,
    },
    {
      type: "prose",
      content: `
        <h3>What to watch for in practice</h3>
        <p><strong>Gap not closing</strong>: if the gap stays flat for many nodes, the solver
        is exploring nodes without finding better solutions or tighter bounds. This usually means
        the LP relaxation is weak (large gap between relaxation and integer optimal). Fix the
        formulation, not the solver settings.</p>
        <p><strong>Primal not improving</strong>: the solver found one feasible solution early
        and can't find a better one. Consider providing a warm start or adding solver hints.</p>
        <p><strong>Dual not decreasing</strong>: the relaxation bound isn't tightening. The solver
        can't prune branches effectively. This often means big-M constraints are too loose.</p>
        <p><strong>Node count exploding</strong>: thousands of nodes explored per second but the
        gap barely moves. The problem has weak structure. Consider decomposition or a heuristic
        approach.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You can read a solver log and diagnose performance issues: presolve behavior, LP relaxation quality, B&B convergence, and gap stalls.",
    },
  ],
};
