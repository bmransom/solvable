import type { Lesson } from "../types";

export const lesson4: Lesson = {
  id: "numerical-gotchas",
  title: "Numerical Gotchas",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Solvers use floating-point arithmetic, which means they work with
        <strong>approximations</strong>, not exact numbers. Most of the time this doesn't
        matter. When it does, the symptoms are baffling: the solver says "optimal" but
        the solution looks wrong, or a constraint that should be tight has tiny slack,
        or a variable that should be zero is 1e-10.</p>
        <p>Here are the gotchas that catch engineers in practice.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>1. Coefficient scaling</h3>
        <p>If your model mixes very large and very small numbers (say, a constraint with
        coefficients of 0.001 and 1,000,000) the solver may lose precision. The
        condition number of the basis matrix blows up, and simplex pivots accumulate
        rounding errors.</p>
        <p><strong>Fix</strong>: rescale your model so coefficients are within a few orders
        of magnitude. If costs are in dollars, don't use cents in one constraint and
        millions in another. Pick consistent units.</p>
        <p>Rule of thumb: if the ratio between your largest and smallest nonzero
        coefficient exceeds 10<sup>6</sup>, you may have problems.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>2. Feasibility tolerance</h3>
        <p>Solvers have a <strong>feasibility tolerance</strong> (typically 10<sup>-6</sup>).
        A constraint <code>x + y <= 10</code> is considered satisfied if
        <code>x + y <= 10.000001</code>. This means:</p>
        <ul>
          <li>A "feasible" solution might slightly violate a constraint</li>
          <li>A variable with a lower bound of 0 might be -1e-8</li>
          <li>An equality constraint <code>x = 5</code> might give <code>x = 4.9999997</code></li>
        </ul>
        <p><strong>Fix</strong>: never compare solver output with <code>===</code>. Always
        use a tolerance: <code>Math.abs(x - 5) < 1e-6</code>. When passing solver
        output to downstream systems, round appropriately.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>3. The "zero but not zero" variable</h3>
        <p>You expect a variable to be exactly 0 in the optimal solution. The solver
        returns 3.7e-11. Is that zero? Almost certainly yes - it's within the solver's
        tolerance. But if your code checks <code>if (x > 0) { ship_order(); }</code>,
        you'll ship an order for 0.000000000037 units.</p>
        <p><strong>Fix</strong>: apply a rounding threshold before acting on solver output.
        For continuous variables, apply a threshold appropriate to your domain (e.g.,
        quantities below 0.01 units are treated as zero). When working with integer
        variables (covered in Chapter 6), round to the nearest integer.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>4. Big-M and numerical instability</h3>
        <p>We covered big-M in Chapter 4 as a formulation issue. It's also a numerical
        issue. A constraint like <code>x <= 999999 * y</code> (where y is binary) creates
        a coefficient of 999999 in the constraint matrix. This worsens the condition number
        and can cause the solver to report infeasible solutions as optimal, or vice versa.</p>
        <p><strong>Fix</strong>: as before, make M as small as possible. But also watch for
        solver warnings about numerical issues. Most solvers log these if you enable
        verbose output.</p>
      `,
    },
    {
      type: "prediction",
      question: "Your solver returns a variable with value 3.7e-11 that you expected to be zero. What should you do?",
      options: [
        "Report a solver bug",
        "Treat it as zero. Apply a rounding threshold before acting on solver output.",
        "Tighten the solver's tolerance settings until it returns exactly 0",
      ],
      correct_index: 1,
      explanation: `This is normal floating-point behavior. The solver considers this "zero" because
        it's within its feasibility tolerance (typically 10<sup>-6</sup>). Always apply rounding
        thresholds before acting on solver output. Tightening tolerances can make the solver slower
        and may not help. Floating-point arithmetic is inherently approximate.`,
    },
    {
      type: "go_deeper",
      title: "Detecting numerical trouble",
      content: `
        <p>Signs that your model has numerical issues:</p>
        <ul>
          <li>The solver reports "optimal" but the objective value doesn't match when you
          manually compute it from the variable values</li>
          <li>Small changes to the model (changing a coefficient by 0.001) produce wildly
          different solutions</li>
          <li>The solver log mentions "warning: large matrix coefficient" or "numerical difficulties"</li>
          <li>The solution has variables at unexpected values (e.g., a quantity of -1e-7)</li>
        </ul>
        <p>When you see these signs: check coefficient scaling, check for big-M constraints,
        and try the barrier (interior point) method instead of simplex, which is often more
        numerically stable for poorly scaled problems.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You know the common numerical pitfalls: scaling, tolerance, near-zero variables, and big-M instability, along with how to defend against them.",
    },
  ],
};
