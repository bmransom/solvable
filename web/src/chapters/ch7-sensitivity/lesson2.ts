import type { Lesson } from "../types";

export const lesson2: Lesson = {
  id: "allowable-ranges",
  title: "When Does the Solution Change?",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Shadow prices and reduced costs don't last forever. They're valid within
        a range. Beyond that range, the <strong>basis changes</strong> — a different set
        of constraints becomes binding, and the optimal vertex shifts.</p>
        <p>The <strong>allowable range</strong> tells you exactly how far you can push
        a parameter before the solution structure changes.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>For RHS values (constraint limits):</p>
        <ul>
          <li>Within the allowable range: the same vertex is optimal, shadow price is constant</li>
          <li>At the boundary: a new constraint becomes binding or a binding constraint becomes non-binding</li>
          <li>Beyond the range: different vertex is optimal, different shadow price applies</li>
        </ul>
        <p>For objective coefficients:</p>
        <ul>
          <li>Within the allowable range: the same vertex is optimal (the iso-profit line rotates but the same corner is best)</li>
          <li>At the boundary: the iso-profit line is parallel to a constraint edge (alternative optima)</li>
          <li>Beyond the range: a different vertex becomes optimal</li>
        </ul>
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
        <p>Drag the blue capacity constraint slowly. Watch the optimal point — at some
        threshold, it "snaps" to a new vertex. That's the allowable range boundary.
        The shadow price was valid up to that point; beyond it, a different shadow price
        applies.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You understand that sensitivity information has a validity range, and beyond that range the solution structure changes.",
    },
  ],
};
