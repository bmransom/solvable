import type { Lesson } from "../types";

export const lesson2: Lesson = {
  id: "branch-and-bound",
  title: "Branch and Bound: Searching Smart",
  blocks: [
    {
      type: "prose",
      content: `
        <p>Since rounding doesn't work, the solver needs to <strong>search</strong> for
        the best integer solution. But with 30 binary variables, there are 2<sup>30</sup>
        = 1 billion possible combinations. Checking them all is hopeless.</p>
        <p><strong>Branch and bound</strong> searches intelligently by using the LP relaxation
        to prune large portions of the search space.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <p>The algorithm works like this:</p>
        <ol>
          <li><strong>Solve the LP relaxation</strong> at the root. If the solution is already integer, you're done.</li>
          <li><strong>Branch</strong>: pick a variable that's fractional (e.g., x = 2.7). Create two subproblems:
          one with x ≤ 2, one with x ≥ 3.</li>
          <li><strong>Bound</strong>: solve the LP relaxation of each subproblem. If a subproblem's bound
          is worse than the best integer solution found so far, <strong>prune it</strong> — no point exploring further.</li>
          <li><strong>Repeat</strong>: keep branching and bounding until all subproblems are pruned or solved.</li>
        </ol>
      `,
    },
    {
      type: "prose",
      content: `
        <p>The key insight: the LP relaxation bound at each node tells the solver
        "the best you could possibly do down this branch." If that best-case is worse
        than a solution you've already found, you can skip the entire branch.</p>
        <p>Good formulations (tight LP relaxations) prune more branches, so the solver
        explores fewer nodes. This is why formulation quality matters more than solver tuning.</p>
      `,
    },
    {
      type: "prediction",
      question: "A MIP solver has been running for 30 seconds. It found a solution with value 100, and the best remaining LP bound is 102. The MIP gap is 2%. Should you stop?",
      options: [
        "No — always keep running until you find the proven optimal solution",
        "It depends — 2% might be excellent or unacceptable depending on your application",
        "Yes — 2% is always good enough",
      ],
      correct_index: 1,
      explanation: `The right answer depends on context. A 2% gap means the solver has proven no solution
        can be more than 2% better than what you have. For a warehouse routing problem, that's
        excellent — the data uncertainty alone is larger than 2%. For a high-frequency trading model
        where 0.1% matters, it's not enough.
        <br><br>
        The key discipline: <strong>decide your gap tolerance before you solve, based on your
        application's sensitivity to optimality.</strong> Setting a MIP gap tolerance (e.g., stop
        at 1% or 5%) is standard practice. Also consider: closing the last 2% often takes 10x
        longer than getting to 2%. Is that compute time worth the improvement?`,
    },
    {
      type: "go_deeper",
      title: "The exponential wall",
      content: `
        <p>In the worst case, branch and bound explores 2<sup>N</sup> nodes for N binary
        variables. This is exponential, and it's not a limitation of the algorithm — the
        problem itself (integer programming) is NP-hard. No algorithm can solve all instances
        in polynomial time (unless P = NP).</p>
        <p>In practice, good formulations and modern heuristics make most problems tractable.
        But you should always:</p>
        <ul>
          <li>Set a time limit</li>
          <li>Set a MIP gap tolerance</li>
          <li>Monitor the incumbent (best solution found so far) — it's often very good long before the solver proves optimality</li>
          <li>Invest in formulation tightness before investing in solver time</li>
        </ul>
      `,
    },
    {
      type: "checkpoint",
      message: "You understand branch and bound, MIP gaps, and the practical discipline of time limits and good-enough solutions.",
    },
  ],
};
