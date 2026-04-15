import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "walking-the-vertices",
  title: "Walking the Vertices",
  blocks: [
    {
      type: "prose",
      content: `
        <p>You've seen that the optimal solution is always at a vertex. So how does
        the solver find it?</p>
        <p>One approach: check every vertex. But a problem with 100 variables could have
        billions of vertices — checking them all is impossible.</p>
        <p>The solver uses a smarter strategy: <strong>start at any vertex, look at
        neighboring vertices, and walk to whichever one improves the objective.</strong>
        Repeat until no neighbor is better. That's the simplex method in one sentence.</p>
      `,
    },
    {
      type: "interactive",
      component: "InteractivePlot",
      props: {
        model: {
          variables: ["x", "y"] as [string, string],
          objective: { coefficients: [3, 5] as [number, number], sense: "max" as const },
          constraints: [
            { name: "c1", coefficients: [1, 0] as [number, number], operator: "<=" as const, rhs: 4, enabled: true, color: "#4c6ef5" },
            { name: "c2", coefficients: [0, 1] as [number, number], operator: "<=" as const, rhs: 6, enabled: true, color: "#f76707" },
            { name: "c3", coefficients: [1, 1] as [number, number], operator: "<=" as const, rhs: 8, enabled: true, color: "#20c997" },
            { name: "c4", coefficients: [2, 1] as [number, number], operator: "<=" as const, rhs: 12, enabled: true, color: "#be4bdb" },
          ],
        },
        allow_drag_constraints: false,
        allow_drag_objective: false,
        allow_drag_point: true,
        allow_toggle_constraints: false,
        show_objective_contour: true,
        show_gradient_arrow: true,
        show_vertex_labels: true,
        highlight_optimal: true,
      },
    },
    {
      type: "prose",
      content: `
        <p>The plot above has more vertices than our factory problem. Drag the explorer
        point to each vertex and note its objective value.</p>
        <p>Now imagine starting at the origin (0, 0). The solver looks at the two edges
        leaving that vertex — one goes along the x-axis, the other along the y-axis.
        Which direction improves <code>3x + 5y</code> faster? The y-direction (coefficient 5
        is larger). So the solver walks up the y-axis to the next vertex.</p>
        <p>At each vertex, it repeats: "Which neighboring vertex is best?" When no neighbor
        is better, it stops — and it's guaranteed to be at the global optimum.</p>
      `,
    },
    {
      type: "prediction",
      question: "Why does the solver always find the global optimum, not just a local one?",
      options: [
        "It checks every vertex before stopping",
        "The feasible region is convex — there are no local optima that aren't global",
        "It uses random restarts to escape local optima",
      ],
      correct_index: 1,
      explanation: `The feasible region of a linear program is always <strong>convex</strong> — a polygon
        (or higher-dimensional polytope) with no dents or holes. On a convex shape, any local optimum
        is automatically a global optimum. This is why the "greedy walk" strategy of simplex always
        finds the best answer, not just a good one.`,
    },
    {
      type: "checkpoint",
      message: "You understand the simplex strategy: start at a vertex, walk to the best neighbor, stop when no neighbor improves the objective.",
    },
  ],
};
