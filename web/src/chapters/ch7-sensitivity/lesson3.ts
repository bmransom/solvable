import type { Lesson } from "../types";

export const lesson3: Lesson = {
  id: "robustness",
  title: "How Robust Is Your Solution?",
  blocks: [
    {
      type: "prose",
      content: `
        <p>In the real world, your input data is approximate. Demand forecasts are
        off by 20%. Cost estimates drift. Constraint coefficients come from noisy
        measurements.</p>
        <p>The question isn't just "what's the optimal solution?" It's
        <strong>"should I trust this solution given my data uncertainty?"</strong></p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>Sensitivity analysis gives you the tools to answer this:</p>
        <ol>
          <li><strong>Check allowable ranges against your data uncertainty.</strong> If the
          demand could vary ±10% and the allowable range covers ±30%, your solution is robust
          to demand uncertainty.</li>
          <li><strong>Identify the most sensitive parameters.</strong> Which parameter, if wrong,
          would change the solution? Focus your data-collection effort there.</li>
          <li><strong>Run "what-if" scenarios.</strong> Re-solve with perturbed parameters
          and see if the solution structure changes.</li>
        </ol>
      `,
    },
    {
      type: "prediction",
      question: "Your LP solution has an allowable range of ±2 on the demand constraint, but demand uncertainty is ±5. What should you do?",
      options: [
        "Trust the solution — the solver found the optimum",
        "Worry — your data uncertainty exceeds the allowable range, meaning the optimal solution might be completely different under realistic demand scenarios",
        "Add more constraints to make the model more stable",
      ],
      correct_index: 1,
      explanation: `When data uncertainty exceeds the allowable range, the solution is <strong>not robust</strong> to
        that parameter. The basis could change under realistic conditions, meaning a completely different
        production plan might be optimal. You should either: (1) collect better data to reduce uncertainty,
        (2) solve multiple scenarios and pick a plan that's good across all of them, or (3) use robust
        optimization techniques that explicitly account for uncertainty.`,
    },
    {
      type: "go_deeper",
      title: "Robust optimization and stochastic programming",
      content: `
        <p>When sensitivity analysis reveals that your solution is fragile, there are
        more advanced techniques:</p>
        <ul>
          <li><strong>Robust optimization</strong>: optimize for the worst case within an
          uncertainty set. Gives a single solution that's good even if parameters are adversarial.</li>
          <li><strong>Stochastic programming</strong>: model uncertainty as probability distributions.
          Optimize the expected value (or a risk measure) across scenarios.</li>
          <li><strong>Scenario analysis</strong>: solve for a discrete set of scenarios and find
          a solution that performs well across all of them.</li>
        </ul>
        <p>These are graduate-level topics, but the intuition is the same: if your solution
        depends heavily on uncertain data, account for that uncertainty in the model itself.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You can assess solution robustness by comparing allowable ranges to data uncertainty, and you know the next steps when the solution is fragile.",
    },
  ],
};
