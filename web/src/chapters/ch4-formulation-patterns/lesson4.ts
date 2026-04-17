import type { Lesson } from "../types";

export const lesson4: Lesson = {
  id: "lexicographic-optimization",
  title: "Multiple Objectives: Lexicographic Optimization",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Real problems rarely have a single objective. A logistics team wants to
        <strong>minimize cost</strong> but also <strong>maximize on-time delivery</strong>.
        A hospital wants to <strong>minimize wait times</strong> but also
        <strong>maximize staff utilization</strong>.</p>
        <p>LP solvers optimize one objective at a time. So how do you handle two?</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>The wrong approach: weighted sum</h3>
        <p>The tempting shortcut: combine objectives into one.</p>
        <p><code>minimize 0.7 * cost + 0.3 * late_deliveries</code></p>
        <p>This "works" but hides a critical decision in the weights. Why 0.7 and 0.3?
        What are the units? Cost is in dollars, late deliveries is a count, so you're
        adding apples and oranges. Small changes to the weights can produce wildly
        different solutions, and explaining to stakeholders why you picked those weights
        is harder than explaining the actual optimization.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>The better approach: lexicographic (priority-based) optimization</h3>
        <p>Optimize objectives in <strong>priority order</strong>. First optimize the
        most important objective. Then optimize the second objective, but only among
        solutions that don't worsen the first.</p>
        <p>The procedure:</p>
        <ol>
          <li><strong>Solve for the primary objective.</strong> Get the optimal value z₁*.</li>
          <li><strong>Add a constraint</strong> fixing the primary objective: z₁ = z₁* (or z₁ ≤ z₁* + ε for a small tolerance).</li>
          <li><strong>Solve for the secondary objective</strong> with the new constraint.</li>
          <li>Repeat for additional objectives.</li>
        </ol>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Example: factory production</h3>
        <p>Your factory has two goals:</p>
        <ol>
          <li><strong>Primary</strong>: Maximize profit (most important)</li>
          <li><strong>Secondary</strong>: Among all maximum-profit plans, minimize overtime hours</li>
        </ol>
      `,
    },
    {
      type: "reveal",
      label: "Show Step 1: Maximize profit",
      content: `Maximize
  profit: 5 chairs + 4 tables
Subject To
  capacity: chairs + tables <= 10
  machine: 2 chairs + tables <= 14
  labor: chairs + 3 tables <= 18
Bounds
  0 <= chairs
  0 <= tables
End

\\ Solve this first. Suppose optimal profit = 46.`,
    },
    {
      type: "reveal",
      label: "Show Step 2: Minimize overtime, preserving optimal profit",
      content: `Minimize
  overtime: 0.5 chairs + 0.8 tables
Subject To
  capacity: chairs + tables <= 10
  machine: 2 chairs + tables <= 14
  labor: chairs + 3 tables <= 18
  lock_profit: 5 chairs + 4 tables >= 46
Bounds
  0 <= chairs
  0 <= tables
End

\\ The lock_profit constraint ensures we don't sacrifice any profit.
\\ Among all plans with profit = 46, find the one with least overtime.`,
    },
    {
      type: "prose",
      content: `
        <p>The key line is <code>lock_profit: 5 chairs + 4 tables >= 46</code>. This
        constraint locks in the result of the first solve, so the second solve can only
        explore solutions that are equally profitable.</p>
        <p>In practice, you might use a small tolerance:
        <code>5 chairs + 4 tables >= 45.5</code> (within 1% of optimal). This gives
        the secondary objective more room to improve, at the cost of a tiny sacrifice
        on the primary.</p>
      `,
    },
    {
      type: "prediction",
      question: "When would you use lexicographic optimization instead of a weighted sum?",
      options: [
        "When you can't decide the weights",
        "When the objectives have clear priority ordering and you don't want to trade off the primary for the secondary",
        "When you have more than two objectives",
      ],
      correct_index: 1,
      explanation: `Lexicographic optimization is the right choice when objectives have a natural priority:
        "first ensure safety, then optimize cost" or "first meet all demand, then minimize fuel."
        The primary objective is never sacrificed for the secondary. It's a hard priority, not a
        tradeoff. Weighted sums are better when you genuinely want to trade off between objectives
        (e.g., risk vs. return in a portfolio).`,
    },
    {
      type: "go_deeper",
      title: "Pareto frontiers and multi-objective optimization",
      content: `
        <p>Lexicographic optimization finds one specific point on the <strong>Pareto frontier</strong>,
        the set of solutions where you can't improve one objective without worsening another.</p>
        <p>More sophisticated approaches explore the full Pareto frontier:</p>
        <ul>
          <li><strong>ε-constraint method</strong>: fix one objective at various levels, optimize
          the other. This traces out the frontier.</li>
          <li><strong>Weighted sum with varying weights</strong>: sweep the weights to find different
          points on the frontier. But this only finds supported points (convex parts of the frontier).</li>
          <li><strong>Goal programming</strong>: set targets for each objective and minimize the
          total deviation from targets.</li>
        </ul>
        <p>For most engineering applications, lexicographic with 2-3 priority levels is sufficient
        and much easier to explain to stakeholders than a Pareto frontier.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You can handle multiple objectives by solving in priority order, locking in each result as a constraint for the next solve.",
    },
  ],
};
