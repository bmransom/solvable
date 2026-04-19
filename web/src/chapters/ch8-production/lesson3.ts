import type { Lesson } from "../types";

export const lesson3: Lesson = {
  id: "monitoring-and-trust",
  title: "Monitoring: Is the Optimizer Still Working?",
  blocks: [
    {
      type: "prose",
      content: `
        <p>An optimization model that works perfectly today can silently degrade tomorrow.
        Input data drifts. Business rules change. The model that once produced excellent
        plans starts producing plans that are feasible but bad, and nobody notices because
        the solver still says "optimal."</p>
        <p>You need monitoring that catches this.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>What to monitor</h3>
        <p><strong>Solve time</strong>: Track p50, p95, and p99 solve times. A gradual
        increase means the problem is getting harder (more variables, tighter constraints).
        A sudden spike means something changed in the input data that makes the model
        harder to solve. This matters for both LP and MIP. Large-scale LPs with complex
        structure can be just as sensitive to input changes as MIPs.</p>

        <p><strong>MIP gap at termination</strong> (MIP only): If you're solving to a gap
        tolerance (e.g., 1%), track how often the solver hits the time limit before reaching
        the gap target. If this starts happening frequently, the problems are getting harder
        faster than you expected.</p>

        <p><strong>Numerical health</strong> (especially large LP): Track solver warnings
        about conditioning, large coefficients, or basis singularity. For large-scale LPs
        with millions of variables, numerical stability is a primary concern. Monitor whether
        the solver switches algorithms (simplex to barrier or vice versa) and whether
        presolve effectiveness changes as the problem structure evolves.</p>

        <p><strong>Objective value trend</strong>: Plot the optimal objective over time.
        If cost is increasing week over week, is it because input prices rose, or because
        the model is making worse decisions? Compare the optimizer's cost against a simple
        baseline (e.g., "do what we did last week") to measure the optimization lift.</p>

        <p><strong>Constraint slack distribution</strong>: If a constraint that used to be
        binding is now always slack, the world may have changed and that constraint is
        no longer relevant. If a constraint is always tight with zero slack, you're
        capacity-constrained and should investigate expanding that resource.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Shadow testing</h3>
        <p>Before deploying a new model version, run it in shadow mode: feed it the same
        inputs as the current model and compare the outputs. If the new model produces
        significantly different solutions, understand why before switching over.</p>
        <p>Key comparisons:</p>
        <ul>
          <li>Objective value: is the new model consistently better?</li>
          <li>Solution structure: are the same facilities/routes/assignments selected, or completely different?</li>
          <li>Solve time: is the new model faster or slower?</li>
          <li>Edge cases: does the new model handle extreme inputs (empty orders, zero demand) gracefully?</li>
        </ul>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>The trust problem</h3>
        <p>The hardest part of production optimization isn't the math; it's getting
        stakeholders to trust the output. A dispatcher who has been routing trucks for
        20 years will not blindly follow an algorithm's recommendation.</p>
        <p>Build trust incrementally:</p>
        <ul>
          <li><strong>Explain decisions</strong>: don't just output "assign order 7 to truck B."
          Explain why: "truck B is closest, has capacity, and this avoids overtime on truck A."
          Shadow prices and binding constraints are your tools here.</li>
          <li><strong>Show the tradeoff</strong>: "the optimizer saved $4,200 vs. last week's
          manual plan. Here's where the savings came from."</li>
          <li><strong>Allow overrides</strong>: let operators fix certain assignments and
          re-optimize around their constraints. This makes the tool feel like an assistant,
          not a replacement.</li>
          <li><strong>Start with suggestions, not automation</strong>: the optimizer recommends
          a plan. A human approves or modifies it. Automate only after months of consistent trust.</li>
        </ul>
      `,
    },
    {
      type: "prediction",
      question: "Your optimizer has been running in production for 6 months. Solve times have gradually increased from 3s to 12s. What's the most likely cause?",
      options: [
        "A bug in the solver library",
        "The problem has grown - more variables/constraints as the business scaled - and the model hasn't been re-tuned",
        "The server hardware is degrading",
      ],
      correct_index: 1,
      explanation: `This is the most common production issue: the model was tuned for the problem size at launch,
        but the business grew. More orders, more vehicles, more warehouses = more variables and
        constraints. The fix is usually: tighten the formulation, add decomposition, increase the
        time limit, or accept a larger MIP gap. Regular model performance reviews should be part of
        the operational cadence.`,
    },
    {
      type: "go_deeper",
      title: "When the LP is very large",
      content: `
        <p>The examples in this tutorial have a handful of variables. Production planning
        models (supply chain, logistics, energy) can have millions of variables and
        constraints spanning weeks or months of decisions linked together over time.</p>
        <p>At this scale, the failure modes are different from small models:</p>
        <ul>
          <li><strong>Numerical conditioning</strong>: with millions of coefficients spanning
          many orders of magnitude, the solver's floating-point arithmetic accumulates
          errors. Watch for solver warnings about large matrix coefficients or ill-conditioned
          bases. These are early signs that results may be unreliable.</li>
          <li><strong>Memory</strong>: the constraint matrix, basis factorization, and solution
          vectors all consume memory. A model that solves fine in staging can OOM in production
          if the instance is larger than expected. Monitor memory alongside solve time.</li>
          <li><strong>Presolve sensitivity</strong>: for large models, the presolve step
          (where the solver simplifies the model before solving) can dramatically affect
          performance. A model that presolves well might solve in 30 seconds; the same
          model with slightly different data that doesn't presolve as effectively might
          take 30 minutes. If solve times are volatile, check whether presolve reductions
          are consistent across runs.</li>
        </ul>
        <p>These issues are specific to large-scale LP. MIP has its own scaling challenges
        (exponential branching), but large LP scaling is about numerical stability and
        memory, not combinatorics.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You know how to monitor an optimization system in production: track solve time, gap, objective trend, and constraint slack. And you know how to build stakeholder trust incrementally.",
    },
  ],
};
