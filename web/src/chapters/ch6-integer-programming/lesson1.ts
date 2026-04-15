import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "rounding-doesnt-work",
  title: "Rounding Doesn't Work",
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
        <p>The naive approach: solve the LP relaxation (ignore the integer requirement),
        then round to the nearest integer. This seems reasonable. It's also wrong.</p>
        <p>In the plot below, the feasible region is the same polygon. But the integer-feasible
        points are only the <strong>dots at grid intersections</strong> inside the region.
        The LP optimum (fractional) may be far from the best integer point.</p>
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
        <p>Drag the explorer point to the LP optimal vertex. Now look at the nearest
        integer points. The rounded point may not even be feasible (it might violate a constraint).
        And even if it's feasible, it's often not the best integer point.</p>
        <p>This is why integer programming is fundamentally harder than LP: you can't just
        solve the relaxation and round.</p>
      `,
    },
    {
      type: "prediction",
      question: "If the LP relaxation optimal is 42.7, what can you say about the integer optimal?",
      options: [
        "It's 42 or 43 (the nearest integers)",
        "It's at most 42.7 (for maximization) — the LP relaxation is an upper bound",
        "You can't say anything without solving the integer problem",
      ],
      correct_index: 1,
      explanation: `The LP relaxation is always a <strong>bound</strong> on the integer optimal. For maximization,
        the LP optimal is an upper bound (the integer optimal can't be better). For minimization, it's
        a lower bound. This bound is what makes branch and bound work — the solver uses it to prune
        branches that can't beat the best known integer solution.`,
    },
    {
      type: "checkpoint",
      message: "You understand why rounding fails and that the LP relaxation provides a bound on the integer optimal.",
    },
  ],
};
