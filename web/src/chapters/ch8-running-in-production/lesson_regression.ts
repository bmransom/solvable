import type { Lesson } from "../types";

export const lesson_regression: Lesson = {
  id: "model-regression-testing",
  title: "Model Regression Testing",
  blocks: [
    {
      type: "prose",
      content: `You changed a constraint coefficient. You added a new variable. You updated
a penalty cost. How do you know the model still produces reasonable plans?

In software, you write tests. In optimization, the equivalent is regression testing:
run a fixed set of inputs through the model and compare outputs against known-good baselines.`,
    },
    {
      type: "prose",
      content: `<h3>What to test</h3>

A model regression test has three parts:

<strong>1. Golden inputs.</strong> A frozen snapshot of demand, capacity, costs, and constraints
that represents a realistic planning scenario. You need at least 3: a typical day,
a high-demand day, and an edge case (a facility offline, a carrier unavailable).

<strong>2. Expected outputs.</strong> The solve result from the last known-good model version.
Store the objective value, the top 5 decision variables, and any non-zero penalty variables.

<strong>3. Tolerance bands.</strong> The objective can shift by up to X% without failing the test.
Decision variables can shift by up to Y units. If a penalty variable was zero and is now
non-zero, that's a failure — the model is now compromising where it didn't before.`,
    },
    {
      type: "prose",
      content: `<h3>When to run</h3>

Run regression tests on every model change — new constraints, updated coefficients,
added variables. This is your CI/CD for optimization. The test catches:

<ul>
<li>Typos in constraint coefficients (objective jumps 40%)</li>
<li>Missing bounds (a variable goes to infinity)</li>
<li>Over-constrained models (new penalty variables activate)</li>
<li>Under-constrained models (existing penalty variables disappear — sounds good, but might mean a constraint was accidentally removed)</li>
</ul>`,
    },
    {
      type: "reveal",
      label: "Show a regression test structure",
      content: `<pre><code>test_cases:
  - name: "typical_monday"
    input: "fixtures/demand_2024_03_04.json"
    expected:
      objective: 1_240_000
      objective_tolerance_pct: 2.0
      variables:
        ship_nashville: { value: 300, tolerance: 50 }
        ship_memphis: { value: 150, tolerance: 30 }
      penalty_variables_must_be_zero:
        - unmet_demand_atlanta
        - unmet_demand_dallas
      penalty_variables_may_be_nonzero:
        - unmet_demand_nashville

  - name: "peak_demand"
    input: "fixtures/demand_2024_11_29.json"
    expected:
      objective: 1_890_000
      objective_tolerance_pct: 3.0

  - name: "dallas_offline"
    input: "fixtures/demand_typical_dallas_offline.json"
    expected:
      objective: 1_380_000
      objective_tolerance_pct: 5.0
      penalty_variables_must_be_nonzero:
        - unmet_demand_dallas</code></pre>`,
    },
    {
      type: "prediction",
      question: "You add a new carrier constraint. Regression tests show the objective increased by 0.5% and unmet_demand_atlanta (previously zero) is now 12. What happened?",
      options: [
        "The new constraint is too tight — it's forcing demand to go unmet in Atlanta",
        "The 0.5% objective increase is within tolerance, so the change is fine",
        "The model has a bug — the objective should have decreased with more constraints",
      ],
      correct_index: 0,
      explanation: "A new penalty variable becoming non-zero is a red flag even if the objective is within tolerance. The model is now compromising where it didn't before. The 0.5% increase in objective (cost) is consistent — the new constraint is restricting a route that served Atlanta. Investigate whether the constraint is correct or too tight.",
    },
    {
      type: "checkpoint",
      message: "You know how to set up regression tests for optimization models: golden inputs, expected outputs, tolerance bands, and penalty variable monitoring.",
    },
  ],
};
