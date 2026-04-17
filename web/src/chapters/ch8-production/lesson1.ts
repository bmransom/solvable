import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "time-limits-and-fallbacks",
  title: "Time Limits and Fallbacks",
  blocks: [
    {
      type: "prose",
      content: `
        <p>You've learned to formulate and solve optimization problems. Now the question
        is: how do you run a solver in production where reliability matters more than
        optimality?</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Time limits are not optional</h3>
        <p>Every production solver call needs a time limit. Solve times can be
        unpredictable for both LP and MIP:</p>
        <ul>
          <li><strong>MIP</strong>: a problem that usually solves in 2 seconds might take
          20 minutes on slightly different input. The combinatorial search is inherently
          variable.</li>
          <li><strong>Large-scale LP</strong>: models with millions of variables and complex
          structure (time-linking constraints, network coupling) can take significant time.
          These are often LP approximations of MIPs that would be intractable as integer
          programs, and they carry their own challenges: memory pressure, numerical
          conditioning, and sensitivity to presolve and algorithm choice (simplex vs.
          barrier).</li>
        </ul>
        <p>Without a time limit, one bad input can hang your system.</p>
        <p>When the time limit hits:</p>
        <ul>
          <li><strong>For MIP</strong>: the solver returns the <strong>incumbent</strong>
          (best integer solution found so far) along with the MIP gap. A 2% suboptimal
          solution delivered on time is better than the optimal solution delivered never.</li>
          <li><strong>For LP</strong>: the solver may return the last feasible basis
          found, or report no solution. Unlike MIP, there's no "incumbent" concept for LP -
          a partial LP solve doesn't give you a feasible solution to use.</li>
        </ul>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Handling solver status codes</h3>
        <p>Every solver returns a status with the solution. Your code must handle each one:</p>
        <ul>
          <li><strong>Optimal</strong>: the solver found and proved the best solution. Use it.</li>
          <li><strong>Time limit / Iteration limit</strong>: the solver ran out of time. For MIP,
          check if there's an incumbent. If so, use it with the gap noted. For LP, this usually
          indicates a problem (poorly scaled model, numerical issues).</li>
          <li><strong>Infeasible</strong>: no solution satisfies all constraints. Don't retry with
          the same input. Log the infeasibility, alert if unexpected, and fall back.</li>
          <li><strong>Unbounded</strong>: the objective can improve forever. This is a modeling bug -
          a missing constraint. Log it, alert, and fall back.</li>
          <li><strong>Error / Numerical issues</strong>: the solver failed internally. Log the full
          error, fall back, and investigate the specific input that caused it.</li>
        </ul>
        <p>The pattern: <code>switch on status, handle each case, never assume Optimal.</code></p>
      `,
    },
    {
      type: "prediction",
      question: "Your solver returns 'Time limit' with an incumbent solution and a 3% MIP gap. What do you do?",
      options: [
        "Discard the result and retry with a longer time limit",
        "Use the incumbent - it's a feasible solution within 3% of optimal - and log the gap for monitoring",
        "Report an error to the caller",
      ],
      correct_index: 1,
      explanation: `The incumbent is a valid, feasible solution. The 3% gap means no solution can be more than 3%
        better. For most applications, this is good enough. Log the gap so you can monitor whether
        time-limit hits are becoming frequent (which would indicate the problem is growing harder).
        Retrying with a longer time limit wastes time if you're already within tolerance.`,
    },
    {
      type: "prose",
      content: `
        <h3>Fallback strategies</h3>
        <p>What happens when the solver fails entirely (infeasible on valid input,
        error, or time limit with no incumbent)?</p>
        <ul>
          <li><strong>Cached solution</strong>: return the last known good solution for similar input.
          "Yesterday's optimal plan" is often better than "no plan."</li>
          <li><strong>Heuristic fallback</strong>: a fast greedy algorithm that produces a feasible
          (but not optimal) solution in milliseconds. Always have one ready.</li>
          <li><strong>Relaxed solve</strong>: for MIP failures, drop the integer requirements and
          return the LP relaxation. It won't be directly implementable (fractional assignments) but
          gives useful direction. For LP failures, this option doesn't apply.</li>
        </ul>
        <p>The key principle: <strong>never return nothing.</strong> A suboptimal answer is
        almost always better than an error.</p>
      `,
    },
    {
      type: "checkpoint",
      message: "You handle every solver status code, always set time limits, and always have a fallback when the solver can't help.",
    },
  ],
};
