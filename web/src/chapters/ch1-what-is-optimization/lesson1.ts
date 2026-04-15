import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "maximize-profit",
  title: "Maximize Profit",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Optimization is about making the best decision under constraints.
        You have a goal (maximize profit, minimize cost, reduce waste) and
        limits on what's possible (budgets, capacities, deadlines). A <strong>solver</strong>
        is software that finds the best solution automatically — you describe the problem
        mathematically, and the solver does the search.</p>
        <p>You don't write the search algorithm. You write the <em>model</em> — the
        variables, constraints, and objective — and the solver handles the rest.
        This tutorial teaches you how to build those models and understand what the
        solver tells you.</p>
        <p>Let's start with a concrete example.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>A factory makes two products: <strong>chairs</strong> and <strong>tables</strong>.</p>
        <p>Each chair earns <strong>$5</strong> profit. Each table earns <strong>$4</strong> profit.</p>
        <p>Your job: <em>make as much money as possible.</em></p>
        <p>There's a catch — the factory has limited capacity, machine time, and labor.
        You can't make unlimited quantities of either product.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>The plot below shows the factory's production options. The <strong>x-axis</strong> is chairs
        and the <strong>y-axis</strong> is tables. The shaded region shows what the factory
        <em>can actually produce</em> given its constraints.</p>
        <p><strong>Drag the white point</strong> around the plot. Try to find the combination of
        chairs and tables that maximizes profit. The profit counter updates as you move.</p>
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
        allow_drag_point: true,
        allow_toggle_constraints: false,
        show_objective_contour: false,
        show_gradient_arrow: false,
        show_vertex_labels: false,
        highlight_optimal: false,
      },
    },
    {
      type: "prediction",
      question: "Where did you find the highest profit? Was it...",
      options: [
        "In the middle of the shaded region",
        "On the edge of the shaded region",
        "At a corner of the shaded region",
      ],
      correct_index: 2,
      explanation: `The best point is always at a <strong>corner</strong> (vertex) of the feasible region.
        This isn't a coincidence — it's a fundamental theorem of linear programming. When you're
        maximizing a linear function over a polygon, the maximum always occurs at a vertex.`,
    },
    {
      type: "prose",
      content: `
        <p>Now let's reveal the answer. The plot below shows the <strong>optimal point</strong>
        marked in green. This is the corner that gives the highest profit.</p>
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
        <p>The dashed lines are <strong>iso-profit contours</strong> — every point on the same
        dashed line gives the same profit. The arrow shows the direction where profit increases.</p>
        <p>The solver's job is to push the contour line as far as possible in the arrow's direction
        while staying inside the shaded region. The last point it touches is always a corner.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You've discovered the core insight of linear programming: the optimal solution is always at a vertex of the feasible region.",
    },
  ],
};
