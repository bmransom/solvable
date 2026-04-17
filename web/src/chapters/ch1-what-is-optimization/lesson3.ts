import type { Lesson } from "../types";

export const lesson3: Lesson = {
  id: "the-math-behind-it",
  title: "The Math Behind It",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Everything you've been doing (dragging points, toggling constraints, watching
        profit change) has a precise mathematical representation. Let's look at it.</p>
        <p>The factory problem you've been solving is called a <strong>linear program (LP)</strong>.
        It has three parts:</p>
        <ol>
          <li><strong>Decision variables</strong> - what you're choosing (how many chairs and tables)</li>
          <li><strong>Objective function</strong> - what you're optimizing (maximize profit)</li>
          <li><strong>Constraints</strong> - what limits your choices (capacity, machine time, labor)</li>
        </ol>
      `,
    },
    {
      type: "reveal",
      label: "Show the LP formulation",
      content: `Maximize
  profit: 5 chairs + 4 tables
Subject To
  capacity:     chairs + tables     <= 10
  machine_time: 2 chairs + tables   <= 14
  labor:        chairs + 3 tables   <= 18
Bounds
  0 <= chairs
  0 <= tables
End`,
    },
    {
      type: "prose",
      content: `
        <p>This is the <strong>CPLEX LP format</strong>, a standard text format that solvers understand.
        Every element maps to what you saw on the plot:</p>
        <ul>
          <li><code>5 chairs + 4 tables</code> - the profit function (the arrow direction on the plot)</li>
          <li><code>chairs + tables <= 10</code> - the blue capacity line</li>
          <li><code>2 chairs + tables <= 14</code> - the orange machine time line</li>
          <li><code>chairs + 3 tables <= 18</code> - the green labor line</li>
        </ul>
        <p>The solver reads this text, finds the optimal vertex of the feasible polygon, and
        returns the answer. What you did by dragging a point, the solver does by algebra, but
        for problems with thousands of variables where you can't draw a picture.</p>
      `,
    },
    {
      type: "go_deeper",
      title: "Why is it called 'linear'?",
      content: `
        <p>A linear program is "linear" because both the objective and constraints are
        <strong>linear functions</strong> of the decision variables: no squares, no products
        of variables, no exponentials. Just coefficients times variables, added together.</p>
        <p>This linearity is what makes the feasible region a polygon (a <em>polytope</em> in
        higher dimensions) and guarantees that the optimal solution is at a vertex. If the
        functions were nonlinear, the feasible region could be curved, and the optimum could
        be anywhere.</p>
        <p>Linear programs can be solved very efficiently; problems with millions of variables
        are routine. Nonlinear optimization is fundamentally harder.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You've connected the visual intuition to the mathematical formulation. You can read an LP and understand what it means geometrically.",
    },
  ],
};
