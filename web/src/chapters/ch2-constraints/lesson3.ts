import type { Lesson } from "../types";

export const lesson3: Lesson = {
  id: "changing-the-objective",
  title: "Changing What You Optimize",
  blocks: [
    {
      type: "prose",
      content: `
        <p>So far we've been maximizing <code>5 chairs + 4 tables</code>. But what if
        the profit per chair changes? Or tables suddenly become more valuable?</p>
        <p>The <strong>objective coefficients</strong> determine the direction of optimization.
        On the plot, this is the direction the gradient arrow points.</p>
        <p>In the plot below, try toggling constraints to see how different combinations
        of active constraints change which vertex is optimal. Notice how the gradient
        arrow "points at" the optimal vertex.</p>
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
            { name: "min_tables", coefficients: [0, 1] as [number, number], operator: ">=" as const, rhs: 2, enabled: false, color: "#be4bdb" },
          ],
        },
        allow_drag_constraints: true,
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
        <p>Try enabling the purple "min_tables" constraint — it requires at least 2 tables.
        This is a <strong>≥ constraint</strong> (greater-than-or-equal). Instead of limiting
        from above, it limits from below.</p>
        <p>You can also combine dragging and toggling: drag the min_tables constraint
        upward to require more tables, and watch the optimal mix shift toward more tables.</p>
      `,
    },
    {
      type: "go_deeper",
      title: "Allowable ranges: when does the solution change?",
      content: `
        <p>If you change an objective coefficient just a little, the same vertex stays
        optimal. But past a certain threshold, a <em>different</em> vertex becomes optimal
        and the solution "snaps" to a new point.</p>
        <p>The range of coefficient values where the current basis stays optimal is called
        the <strong>allowable range</strong>. Within this range, the solution point doesn't
        change (though the objective value does). Beyond it, you get a completely new solution.</p>
        <p>We'll visualize this precisely in Chapter 7.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You've seen how both constraint changes and objective changes affect the optimal solution. Constraints shape the region; the objective chooses the best vertex.",
    },
  ],
};
