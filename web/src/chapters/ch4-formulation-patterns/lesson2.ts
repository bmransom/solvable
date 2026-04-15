import type { Lesson } from "../types";

export const lesson2: Lesson = {
  id: "assignment-and-covering",
  title: "Assignment and Covering",
  blocks: [
    {
      type: "prose",
      content: `
        <h3>Pattern 3: Assignment</h3>
        <p><strong>You have</strong>: N items and M slots. Each item must go to exactly one slot.</p>
        <p><strong>You decide</strong>: which item goes where (binary variables: 1 = assigned, 0 = not).</p>
        <p><strong>Constraints</strong>: each item assigned once, each slot gets at most one item.</p>
        <p><strong>Objective</strong>: minimize total cost (or maximize total value).</p>
        <p>This pattern covers: task assignment, job scheduling, warehouse-to-customer matching,
        vehicle-to-route assignment, organ donor matching.</p>
      `,
    },
    {
      type: "reveal",
      label: "Show assignment LP formulation (3 workers, 3 tasks)",
      content: `Minimize
  cost: 10 x11 + 15 x12 + 9 x13
      + 12 x21 + 8 x22 + 14 x23
      + 11 x31 + 13 x32 + 7 x33
Subject To
  worker1: x11 + x12 + x13 = 1
  worker2: x21 + x22 + x23 = 1
  worker3: x31 + x32 + x33 = 1
  task1: x11 + x21 + x31 = 1
  task2: x12 + x22 + x32 = 1
  task3: x13 + x23 + x33 = 1
Binary
  x11 x12 x13 x21 x22 x23 x31 x32 x33
End`,
    },
    {
      type: "prose",
      content: `
        <h3>Pattern 4: Covering and Packing</h3>
        <p><strong>Covering</strong>: select the cheapest set of resources that covers all requirements.</p>
        <p>Example: which fire stations should a city build so every neighborhood is within
        5 minutes of a station?</p>
        <p><strong>Packing</strong>: select the most valuable set of items that fits within a capacity.</p>
        <p>Example: which items should go in a truck to maximize total value without exceeding weight?</p>
      `,
    },
    {
      type: "reveal",
      label: "Show knapsack (packing) LP formulation",
      content: `Maximize
  value: 60 item1 + 100 item2 + 120 item3 + 80 item4 + 50 item5
Subject To
  weight: 10 item1 + 20 item2 + 30 item3 + 15 item4 + 25 item5 <= 50
Binary
  item1 item2 item3 item4 item5
End`,
    },
    {
      type: "prediction",
      question: "Assignment, covering, and packing all use binary (0/1) variables. Why not continuous variables?",
      options: [
        "Continuous variables would be slower to solve",
        "The decisions are inherently yes/no: assign or not, include or not, open or not",
        "LP format doesn't support continuous variables for these problems",
      ],
      correct_index: 1,
      explanation: `These problems involve discrete choices — you either assign a worker to a task or you don't.
        You can't assign 0.7 of a worker. Binary variables model this naturally. This is what makes
        them <strong>integer programs</strong> — and why they can be much harder to solve than pure LPs.
        We'll explore this in Chapter 6.`,
    },
    {
      type: "checkpoint",
      message: "You've learned four patterns: blending, transportation, assignment, and covering/packing. These cover the majority of real optimization problems.",
    },
  ],
};
