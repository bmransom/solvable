import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "drag-the-boundaries",
  title: "Drag the Boundaries",
  blocks: [
    {
      type: "prose",
      content: `
        <p>In the last chapter you saw that constraints create the feasible region.
        Now let's see what happens when constraints <strong>move</strong>.</p>
        <p>Imagine your factory gets more machine capacity. Or less labor is available.
        Each change shifts a constraint boundary, and the optimal solution shifts with it.</p>
        <p><strong>Drag the constraint lines</strong> in the plot below. Watch how the
        feasible region reshapes and the optimal point jumps to a new vertex.</p>
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
        allow_drag_constraints: true,
        allow_drag_objective: false,
        allow_drag_point: false,
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
        <p>Notice something: when you drag a constraint outward (increasing the RHS),
        the feasible region grows. When you drag it inward, it shrinks.</p>
        <p>But not every constraint matters equally. Some constraints are <strong>binding</strong>
        - the optimal solution sits right on them. Others have <strong>slack</strong> -
        there's room to spare.</p>
      `,
    },
    {
      type: "prediction",
      question: "If you drag a non-binding constraint (one the optimal point isn't touching), what happens to the optimal profit?",
      options: [
        "It changes immediately",
        "Nothing - the profit stays the same until the constraint becomes binding",
        "The problem becomes infeasible",
      ],
      correct_index: 1,
      explanation: `Exactly. If a constraint has slack (the optimal point isn't touching it), moving it
        a little doesn't change anything. Only <strong>binding constraints</strong> affect the optimal
        solution. This is the core intuition behind <em>sensitivity analysis</em> - which we'll explore
        in Chapter 7.`,
    },
    {
      type: "checkpoint",
      message: "You've discovered that only binding constraints affect the optimal solution - non-binding constraints have slack.",
    },
  ],
};
