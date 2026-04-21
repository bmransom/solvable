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
        billions of vertices, and checking them all is impossible.</p>
        <p>The solver uses a smarter strategy: <strong>start at a vertex, walk to
        the best neighbor, repeat until no neighbor improves the objective.</strong>
        That's the simplex method.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>The solver starts at a vertex (the origin below) and looks at its neighbors.
        <span style="color: #51cf66">Green arrows</span> show directions that improve the
        objective, with the gain shown. <span style="color: #fa5252">Red arrows</span> make
        it worse. Click <strong>Step</strong> to move to the best neighbor. When all arrows
        are red, the solver is at the optimum.</p>
      `,
    },
    {
      type: "interactive",
      component: "VertexWalker",
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
      },
    },
    {
      type: "prose",
      content: `
        <p>Each number on an arrow is the objective change if the solver moves in that
        direction. The solver always picks the best improving direction. When no arrow is
        green, every neighbor is worse or equal, and the solver stops.</p>
      `,
    },
    {
      type: "prediction",
      question: "Why does the solver always find the global optimum, not just a local one?",
      options: [
        "It checks every vertex before stopping",
        "The feasible region is convex - there are no local optima that aren't global",
        "It uses random restarts to escape local optima",
      ],
      correct_index: 1,
      explanation: `The feasible region of a linear program is always <strong>convex</strong>, a polygon
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
