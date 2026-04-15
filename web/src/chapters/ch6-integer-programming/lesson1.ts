import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "when-rounding-breaks",
  title: "When Rounding Breaks Down",
  blocks: [
    {
      type: "prose",
      content: `
        <p>So far, our variables have been continuous — you can make 3.7 chairs.
        But many real decisions are discrete: you either build a warehouse or you don't.
        You assign 5 trucks, not 4.6.</p>
        <p><strong>Integer programming (IP)</strong> adds a requirement that some variables
        must be whole numbers. <strong>Mixed-integer programming (MIP)</strong> allows both
        integer and continuous variables in the same model.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>A natural instinct: solve the LP relaxation (ignore the integer requirement),
        then round to the nearest integer. Sometimes this works surprisingly well.
        Sometimes it fails catastrophically. Understanding <em>when</em> it fails is the key.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>When rounding is reasonable</h3>
        <p>If the LP relaxation gives x = 47.3 trucks, rounding to 47 or 48 is often
        a decent approximation. The variables are large, the rounding error is small relative
        to the total, and the rounded solution is likely still feasible (or close to it).</p>
        <p>Many practitioners use "solve the LP, round, check feasibility" as a fast heuristic
        for problems where near-optimal is good enough.</p>

        <h3>When rounding is dangerous</h3>
        <p>Rounding breaks down in two situations:</p>
        <ul>
          <li><strong>Binary decisions</strong>: "Open warehouse A or not?" gives x = 0.6.
          Rounding to 1 means "open it" — but 0.6 meant the LP was hedging, using a fraction
          of the warehouse's capacity. The rounded solution may violate capacity constraints
          or produce a very different cost structure.</li>
          <li><strong>Tight constraints</strong>: When the feasible region is narrow, rounding
          a fractional point can land you outside it entirely. The rounded solution is infeasible.</li>
        </ul>
      `,
    },
    {
      type: "interactive",
      component: "InteractivePlot",
      props: {
        model: {
          variables: ["x", "y"] as [string, string],
          objective: { coefficients: [5, 8] as [number, number], sense: "max" as const },
          constraints: [
            { name: "c1", coefficients: [2, 1] as [number, number], operator: "<=" as const, rhs: 10, enabled: true, color: "#4c6ef5" },
            { name: "c2", coefficients: [1, 2] as [number, number], operator: "<=" as const, rhs: 10, enabled: true, color: "#f76707" },
            { name: "c3", coefficients: [1, 1] as [number, number], operator: "<=" as const, rhs: 7, enabled: true, color: "#20c997" },
          ],
        },
        allow_drag_constraints: true,
        allow_drag_objective: false,
        allow_drag_point: true,
        allow_toggle_constraints: false,
        show_objective_contour: true,
        show_gradient_arrow: true,
        show_vertex_labels: true,
        highlight_optimal: true,
        show_integer_lattice: true,
      },
    },
    {
      type: "prose",
      content: `
        <p>The <strong>yellow dots</strong> are integer-feasible points. The large yellow dot
        is the best integer solution. The <strong>green dot</strong> is the LP relaxation
        optimum (which may have fractional coordinates).</p>
        <p>Notice: the best integer point is not necessarily the one closest to the LP optimum.
        Drag the constraints to create different shapes and see how the gap between the LP optimum
        and the best integer point changes. In some configurations they're close; in others, the
        nearest integer to the LP solution isn't even the best integer point.</p>
      `,
    },
    {
      type: "prediction",
      question: "If the LP relaxation optimal is 42.7, what can you say about the integer optimal?",
      options: [
        "It's 42 or 43 (the nearest integers to 42.7)",
        "It's at most 42.7 (for maximization) — the LP relaxation is an upper bound, but the best integer solution could be much lower",
        "You can't say anything without solving the integer problem",
      ],
      correct_index: 1,
      explanation: `The LP relaxation is always a <strong>bound</strong> on the integer optimal. For maximization,
        the LP optimal is an upper bound (the integer optimal can't be better, but could be much worse).
        For minimization, it's a lower bound. The gap between the LP bound and the best known integer
        solution is the <strong>MIP gap</strong> — and it's what makes branch and bound work. The solver
        uses it to prune branches that provably can't beat the best integer solution found so far.`,
    },
    {
      type: "go_deeper",
      title: "The integrality gap",
      content: `
        <p>The worst-case ratio between the LP relaxation optimum and the integer optimum
        is called the <strong>integrality gap</strong>. It depends on the problem structure:</p>
        <ul>
          <li><strong>Assignment problems</strong>: integrality gap is 0 — the LP relaxation
          naturally gives integer solutions (the constraint matrix is "totally unimodular").
          You get integer solutions for free!</li>
          <li><strong>Knapsack problems</strong>: the gap is usually small. Rounding works
          reasonably well.</li>
          <li><strong>Facility location with big-M</strong>: the gap can be enormous.
          A loose big-M makes the LP relaxation nearly useless as a bound.</li>
        </ul>
        <p>This is why formulation matters: a tighter formulation has a smaller integrality
        gap, which means less work for the solver.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You understand when rounding works (large quantities, loose constraints) vs. when it fails (binary decisions, tight constraints), and that the LP relaxation always provides a bound.",
    },
  ],
};
