import type { Lesson } from "../types";

export const lesson2: Lesson = {
  id: "tightening-and-loosening",
  title: "Tightening and Loosening",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Every constraint has a <strong>right-hand side (RHS)</strong> value - the number
        after the ≤ or ≥ sign. It represents a resource limit, a demand requirement, or
        a physical capacity.</p>
        <p>When you drag a constraint, you're changing this RHS value. In the real world,
        this means:</p>
        <ul>
          <li>Buying more machine capacity (increasing a ≤ constraint's RHS)</li>
          <li>A supplier reducing their delivery (decreasing a ≤ constraint's RHS)</li>
          <li>A customer demanding more product (increasing a ≥ constraint's RHS)</li>
        </ul>
        <p>Try dragging the <strong>capacity</strong> constraint (blue line) slowly inward.
        Watch the profit change. How much does each unit of capacity cost you?</p>
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
        show_gradient_arrow: false,
        show_vertex_labels: true,
        highlight_optimal: true,
      },
    },
    {
      type: "go_deeper",
      title: "Shadow prices: the price of a constraint",
      content: `
        <p>The rate at which the objective changes when you move a binding constraint
        is called the <strong>shadow price</strong> (or <strong>dual value</strong>).
        It answers: "What would I pay for one more unit of this resource?"</p>
        <p>If the capacity constraint has a shadow price of $3, it means each additional
        unit of capacity is worth $3 of profit. You'd pay up to $3 to get one more unit.</p>
        <p>Non-binding constraints have a shadow price of zero because they're not limiting you,
        so more of that resource is worthless (for now).</p>
        <p>We'll explore this deeply in Chapter 7.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You understand that changing a constraint's RHS changes the optimal profit at a rate determined by the shadow price.",
    },
  ],
};
