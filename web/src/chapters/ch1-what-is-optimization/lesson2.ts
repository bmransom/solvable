import type { Lesson } from "../types";

export const lesson2: Lesson = {
  id: "meet-the-constraints",
  title: "Meet the Constraints",
  blocks: [
    {
      type: "prose",
      content: `
        <p>What makes optimization interesting is <strong>constraints</strong> — the limits that
        define what's possible.</p>
        <p>Each constraint is a line that cuts the plane in half. The feasible region is where
        <em>all</em> constraints are satisfied simultaneously.</p>
        <p>Use the checkboxes below the plot to <strong>toggle constraints on and off</strong>.
        Watch how the feasible region changes shape — and how the optimal point moves.</p>
      `,
    },
    {
      type: "interactive",
      component: "InteractivePlot",
      props: {
        model: {
          variables: ["chairs", "tables"] as [string, string],
          objective: { coefficients: [5, 4] as [number, number], sense: "max" as const },
          constraints: [
            { name: "capacity", coefficients: [1, 1] as [number, number], operator: "<=" as const, rhs: 10, enabled: true, color: "#4c6ef5" },
            { name: "machine_time", coefficients: [2, 1] as [number, number], operator: "<=" as const, rhs: 14, enabled: true, color: "#f76707" },
            { name: "labor", coefficients: [1, 3] as [number, number], operator: "<=" as const, rhs: 18, enabled: true, color: "#20c997" },
          ],
        },
        allow_drag_constraints: false,
        allow_drag_objective: false,
        allow_drag_point: false,
        allow_toggle_constraints: true,
        show_objective_contour: true,
        show_gradient_arrow: true,
        show_vertex_labels: true,
        highlight_optimal: true,
      },
    },
    {
      type: "prediction",
      question: "What happens to the optimal profit when you remove a constraint?",
      options: [
        "It always stays the same",
        "It always gets worse (lower profit)",
        "It always gets better or stays the same (more profit or equal)",
      ],
      correct_index: 2,
      explanation: `Removing a constraint can only <em>expand</em> the feasible region (or leave it unchanged).
        A larger feasible region means the solver has more room to find a better solution. Constraints
        are restrictions — removing one can never make things worse.`,
    },
    {
      type: "prose",
      content: `
        <p>This is an important principle: <strong>every constraint you add can only hurt
        (or not change) the objective.</strong> Constraints are the price you pay for reality.</p>
        <p>When you're building a model, ask yourself: "Is this constraint real, or am I
        over-constraining the problem?" Unnecessary constraints leave money on the table.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You understand how constraints shape the feasible region and affect the optimal solution.",
    },
  ],
};
