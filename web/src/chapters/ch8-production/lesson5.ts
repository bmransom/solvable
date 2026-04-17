import type { Lesson } from "../types";

export const lesson5: Lesson = {
  id: "choosing-a-solver",
  title: "Choosing a Solver",
  blocks: [
    {
      type: "prose",
      content: `
        <p>This tutorial uses <strong>HiGHS</strong>, an open-source solver that runs
        in your browser. But when you're building a production system, you'll need to
        choose a solver. Here's the landscape.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>What a solver actually does</h3>
        <p>A solver takes your model (variables, constraints, objective) and finds the
        optimal solution using algorithms like the simplex method, interior point methods,
        and branch and bound. All solvers implement these same core algorithms. The
        differences are in how well they're tuned, how they handle edge cases, and what
        features they offer on top.</p>
        <p>Choosing a solver is like choosing a database: they all store and query data,
        but the performance characteristics, licensing, and ecosystem matter for your
        specific workload.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Commercial solvers</h3>
        <p><strong>Gurobi</strong> and <strong>CPLEX</strong> (IBM) are the industry leaders.
        They're typically 10-100x faster than open-source solvers on hard MIP problems.
        The speed difference comes from decades of engineering: better heuristics, tighter
        cuts, smarter branching, and extensive numerical tuning.</p>
        <ul>
          <li><strong>Gurobi</strong>: widely considered the fastest. Excellent Python API.
          Free for academics. Commercial licenses are expensive (tens of thousands per year)
          but the cost is usually justified if optimization is core to your business.</li>
          <li><strong>CPLEX</strong>: IBM's solver. Comparable performance to Gurobi. Often
          bundled with IBM's Decision Optimization suite. Strong in enterprise environments.</li>
          <li><strong>FICO Xpress</strong>: third major commercial solver. Strong modeling
          language (Mosel). Common in financial services.</li>
        </ul>
        <p>For pure LP (no integers), the speed gap between commercial and open-source
        is smaller. For hard MIPs, it can be the difference between solving in 10 seconds
        and not solving at all.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Open-source solvers</h3>
        <ul>
          <li><strong>HiGHS</strong>: the solver powering this tutorial. MIT license.
          The best open-source LP/MIP solver as of 2024. Actively developed at the University
          of Edinburgh. Good performance for most problems, especially LP. MIP performance
          is improving rapidly but still behind Gurobi/CPLEX on hard instances.</li>
          <li><strong>COIN-OR CBC</strong>: mature open-source MIP solver. Slower than HiGHS
          on most benchmarks but has a long track record and a large user base.</li>
          <li><strong>GLPK</strong>: the GNU Linear Programming Kit. Simple, well-documented,
          but significantly slower than HiGHS or CBC. Fine for small problems and teaching.</li>
          <li><strong>SCIP</strong>: technically "open" (academic license) but not MIT/Apache.
          Excellent for research and constraint programming. Performance between open-source
          and commercial solvers.</li>
          <li><strong>OR-Tools</strong>: Google's operations research toolkit. Wraps multiple
          solvers (including GLPK, CBC, SCIP, and optionally Gurobi/CPLEX). Good routing
          and scheduling APIs. The bundled solver is decent but not best-in-class.</li>
        </ul>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>How to choose</h3>
        <p>Start with the simplest option that works:</p>
        <ol>
          <li><strong>Prototype with HiGHS or OR-Tools</strong> (free, easy to install).
          Get the formulation right. Measure solve times on realistic data.</li>
          <li><strong>If LP-only</strong>: HiGHS is likely sufficient for production.
          Open-source LP solvers are quite good.</li>
          <li><strong>If MIP and solve times matter</strong>: try Gurobi's free trial.
          If it's 10x faster on your problem, that's your answer. If it's only 2x faster,
          HiGHS may be fine.</li>
          <li><strong>If solving millions of small models</strong> (e.g., per-request pricing):
          solver startup overhead matters. Gurobi and CPLEX have optimized APIs for
          repeated solves. Also consider whether you even need a solver. For very
          simple models, a direct algorithm may be faster.</li>
        </ol>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>How you'll interact with a solver</h3>
        <p>There are two approaches, and both are common:</p>
        <p><strong>Direct solver APIs</strong>: you call the solver's C, C++, or Python API
        to build the model programmatically (<code>addVariable()</code>, <code>addConstraint()</code>,
        <code>optimize()</code>). This gives full control over model construction, solver parameters,
        and solution extraction. Most production systems work this way.</p>
        <p><strong>Modeling layers</strong>: higher-level libraries that let you write models
        more concisely and swap solvers without rewriting code:</p>
        <ul>
          <li><strong>Python</strong>: PuLP (simple, wraps multiple solvers), Pyomo (powerful,
          academic-flavored), gurobipy (Gurobi-specific, excellent)</li>
          <li><strong>Julia</strong>: JuMP (best-in-class modeling language, wraps all major solvers)</li>
          <li><strong>JavaScript</strong>: highs-js (HiGHS compiled to WebAssembly, as used in this tutorial)</li>
          <li><strong>AMPL / GAMS</strong>: dedicated algebraic modeling languages. Powerful for
          large models but add a language to your stack.</li>
        </ul>
        <p>The choice depends on your priorities: direct APIs for maximum control and performance,
        modeling layers for faster development and solver portability.</p>
      `,
    },
    {
      type: "go_deeper",
      title: "Benchmarking solvers on your problem",
      content: `
        <p>Published solver benchmarks (like Hans Mittelmann's benchmarks at Arizona State)
        test on standard problem libraries. Your problem may behave differently.</p>
        <p>To benchmark properly:</p>
        <ul>
          <li>Test on your actual data, not toy problems</li>
          <li>Test on a range of instance sizes (small, medium, large)</li>
          <li>Measure both solve time and solution quality (for MIP with time limits)</li>
          <li>Test edge cases: what happens with empty input, infeasible input, huge input?</li>
          <li>Measure solver startup time if you're solving many small models</li>
        </ul>
        <p>Most commercial solvers offer free academic licenses or 30-day trials.
        Use them to benchmark before committing.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You know the solver landscape: HiGHS for open-source, Gurobi/CPLEX for commercial, and the decision framework for choosing between them.",
    },
  ],
};
