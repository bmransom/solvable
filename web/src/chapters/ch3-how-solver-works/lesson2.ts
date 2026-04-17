import type { Lesson } from "../types";

export const lesson2: Lesson = {
  id: "reduced-costs-and-efficiency",
  title: "Reduced Costs and Efficiency",
  blocks: [
    {
      type: "prose",
      content: `
        <p>At each vertex, the solver computes a <strong>reduced cost</strong> for each
        edge: the rate at which the objective improves per unit of movement along that edge.</p>
        <p>Think of it as: "How much do I gain by taking one step in this direction?"</p>
        <ul>
          <li><strong>Positive reduced cost</strong> (for maximization): moving along this edge improves the objective. The solver should go this way.</li>
          <li><strong>Zero reduced cost</strong>: moving doesn't help or hurt. The solver is indifferent.</li>
          <li><strong>Negative reduced cost</strong>: moving makes things worse. Don't go this way.</li>
        </ul>
        <p>When ALL reduced costs are non-positive, no direction improves the objective, so the
        solver is at the optimal vertex.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>In the solver output, you'll see reduced costs reported for each variable.
        They tell you:</p>
        <ul>
          <li>A variable with reduced cost = 0 is <strong>in the solution</strong> (basic)</li>
          <li>A variable with negative reduced cost (for maximization) is at its lower bound, and increasing it would hurt the objective by that much per unit</li>
        </ul>
        <p>This connects to sensitivity analysis: the reduced cost tells you exactly how much
        a variable's objective coefficient would need to improve before it becomes worth using.</p>
      `,
    },
    {
      type: "go_deeper",
      title: "This is the simplex method",
      content: `
        <p>What we've described (start at a vertex, compute reduced costs, pivot to the
        best neighbor, repeat) <em>is</em> the simplex method. Invented by George Dantzig
        in 1947, it remains one of the most important algorithms in history.</p>
        <p>The formal version uses matrix algebra (the "tableau") to track which constraints
        are binding (the "basis") and to compute the step direction and length. But the
        geometric intuition is the same: walk along edges of the polytope toward improvement.</p>
        <p>In practice, modern solvers use a variant called the <strong>revised simplex
        method</strong> that is more numerically stable and memory-efficient. For very large
        problems, they may also use <strong>interior point methods</strong> that take a
        different geometric approach: travel through the interior of the polytope rather
        than along its edges.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You understand reduced costs as 'improvement per step' and the simplex stopping condition: all reduced costs non-positive means optimal.",
    },
  ],
};
