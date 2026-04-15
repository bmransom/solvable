import type { Lesson } from "../types";

export const lesson2: Lesson = {
  id: "unbounded",
  title: "Unbounded: Infinite Improvement",
  blocks: [
    {
      type: "prose",
      content: `
        <p>The opposite problem: the objective can improve forever because nothing stops it.
        This is <strong>unboundedness</strong>.</p>
        <p>In the plot below, <strong>toggle off constraints</strong> one at a time.
        When the feasible region becomes unbounded in the direction the objective is
        improving, the solver reports "Unbounded."</p>
      `,
    },
    {
      type: "interactive",
      component: "InteractivePlot",
      props: {
        model: {
          variables: ["x", "y"] as [string, string],
          objective: { coefficients: [2, 3] as [number, number], sense: "max" as const },
          constraints: [
            { name: "budget", coefficients: [1, 1] as [number, number], operator: "<=" as const, rhs: 10, enabled: true, color: "#4c6ef5" },
            { name: "ratio", coefficients: [1, -1] as [number, number], operator: "<=" as const, rhs: 2, enabled: true, color: "#f76707" },
            { name: "min_x", coefficients: [-1, 0] as [number, number], operator: "<=" as const, rhs: 0, enabled: true, color: "#20c997" },
          ],
        },
        allow_drag_constraints: false,
        allow_drag_objective: false,
        allow_drag_point: true,
        allow_toggle_constraints: true,
        show_objective_contour: true,
        show_gradient_arrow: true,
        show_vertex_labels: true,
        highlight_optimal: true,
      },
    },
    {
      type: "prose",
      content: `
        <p>Try toggling off the blue "budget" constraint. Now x and y can grow without
        limit (as long as the ratio constraint holds). The profit arrow points into
        infinite space.</p>
        <p>Unboundedness almost always means your model is <strong>missing a constraint</strong>.
        In the real world, resources are always finite. If your model says "make infinite profit,"
        the model is wrong, not the math.</p>
        <p>Common causes:</p>
        <ul>
          <li>Forgot an upper bound on a variable</li>
          <li>Missing a capacity or budget constraint</li>
          <li>Wrong sign on a constraint (≤ instead of ≥ or vice versa)</li>
        </ul>
      `,
    },
    {
      type: "checkpoint",
      message: "You recognize unboundedness as a modeling error (missing constraint), not a math error.",
    },
  ],
};
