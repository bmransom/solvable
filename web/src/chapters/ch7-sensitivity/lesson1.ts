import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "shadow-prices",
  title: "The Price of a Resource",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Your boss asks: "If we could get 10 more units of machine capacity, how much
        more profit would we make?"</p>
        <p>You could re-solve the model with the updated constraint. Or you could look
        at the <strong>shadow price</strong> — a number the solver already computed that
        answers this question directly.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>The shadow price of a constraint is the <strong>rate of change of the optimal
        objective per unit increase in the RHS</strong>. If the machine_time constraint
        has a shadow price of $3, then each additional unit of machine time is worth $3
        of profit.</p>
        <p>In Chapter 2, you discovered this by dragging constraint lines. Now let's
        make it precise.</p>
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
        <p>Drag the capacity constraint (blue) outward slowly. Watch the profit increase.
        The rate of increase IS the shadow price.</p>
        <p>Now try dragging the labor constraint (green). If it's not binding (the optimal
        point isn't on it), dragging it has no effect. Its shadow price is zero.</p>
        <p>Key rules:</p>
        <ul>
          <li><strong>Binding constraints</strong> (slack = 0) typically have nonzero shadow prices</li>
          <li><strong>Non-binding constraints</strong> (slack > 0) always have shadow price = 0</li>
          <li>Shadow prices are valid only within an <strong>allowable range</strong> — drag too far and the basis changes</li>
        </ul>
      `,
    },
    {
      type: "checkpoint",
      message: "You understand shadow prices as 'the value of one more unit of resource' and that only binding constraints have nonzero shadow prices.",
    },
  ],
};
