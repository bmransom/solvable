import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "infeasible",
  title: "Infeasible: No Solution Exists",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Not every optimization problem has a solution. When the constraints
        contradict each other, there's no point that satisfies all of them simultaneously.
        This is called <strong>infeasibility</strong>.</p>
        <p>The model below starts feasible. <strong>Drag the constraints inward</strong>
        until the feasible region vanishes. Watch the exact moment it becomes infeasible.</p>
      `,
    },
    {
      type: "interactive",
      component: "InteractivePlot",
      props: {
        model: {
          variables: ["x", "y"] as [string, string],
          objective: { coefficients: [1, 1] as [number, number], sense: "max" as const },
          constraints: [
            { name: "upper_x", coefficients: [1, 0] as [number, number], operator: "<=" as const, rhs: 6, enabled: true, color: "#4c6ef5" },
            { name: "upper_y", coefficients: [0, 1] as [number, number], operator: "<=" as const, rhs: 6, enabled: true, color: "#f76707" },
            { name: "min_total", coefficients: [1, 1] as [number, number], operator: ">=" as const, rhs: 4, enabled: true, color: "#20c997" },
          ],
        },
        allow_drag_constraints: true,
        allow_drag_objective: false,
        allow_drag_point: false,
        allow_toggle_constraints: true,
        show_objective_contour: false,
        show_gradient_arrow: false,
        show_vertex_labels: true,
        highlight_optimal: true,
      },
    },
    {
      type: "prose",
      content: `
        <p>Try dragging the green "min_total" constraint upward (increase its RHS)
        while the blue and orange constraints limit x and y. At some point, the constraints
        become impossible to satisfy simultaneously.</p>
        <p>In practice, infeasibility usually means one of:</p>
        <ul>
          <li>A constraint was entered incorrectly (wrong sign, wrong coefficient)</li>
          <li>Requirements are genuinely contradictory (demand exceeds supply)</li>
          <li>A bound is too tight (a variable is forced to be 0 but also appears with a minimum)</li>
        </ul>
      `,
    },
    {
      type: "prediction",
      question: "Your model is infeasible. What should you do first?",
      options: [
        "Add more variables",
        "Change the objective function",
        "Find which constraints conflict — the solver can identify the minimal set of conflicting constraints (IIS)",
      ],
      correct_index: 2,
      explanation: `When a model is infeasible, the objective doesn't matter — there's no feasible solution to optimize.
        The first step is diagnosing <em>which constraints</em> conflict. Solvers can compute an
        <strong>Irreducible Infeasible Subsystem (IIS)</strong>: the smallest set of constraints that
        are mutually contradictory. This tells you exactly where the conflict is.`,
    },
    {
      type: "checkpoint",
      message: "You can recognize infeasibility visually (empty feasible region) and know the first debugging step: find the conflicting constraints.",
    },
  ],
};
