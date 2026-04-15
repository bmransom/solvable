import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "the-modeling-skill",
  title: "The Hardest Part: Modeling",
  blocks: [
    {
      type: "prose",
      content: `
        <p>You now know how to read and solve an LP. But the hardest part of optimization
        isn't solving — it's <strong>modeling</strong>. Translating a messy real-world problem
        into decision variables, constraints, and an objective.</p>
        <p>The good news: most real problems follow a small number of recurring patterns.
        Learn these patterns and you can model almost anything.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>The Three Questions</h3>
        <p>For any optimization problem, ask:</p>
        <ol>
          <li><strong>What am I deciding?</strong> → These are your <em>decision variables</em></li>
          <li><strong>What limits my choices?</strong> → These are your <em>constraints</em></li>
          <li><strong>What am I optimizing?</strong> → This is your <em>objective</em></li>
        </ol>
        <p>Let's see how these questions apply to common patterns.</p>
      `,
    },
    {
      type: "prose",
      content: `
        <h3>Pattern 1: Blending / Diet</h3>
        <p><strong>You have</strong>: a set of ingredients, each with a cost and nutritional profile.</p>
        <p><strong>You decide</strong>: how much of each ingredient to use (continuous variables).</p>
        <p><strong>Constraints</strong>: minimum/maximum requirements for each nutrient.</p>
        <p><strong>Objective</strong>: minimize total cost.</p>
        <p>This pattern covers: food blending, metal alloy composition, fuel mixing,
        paint color mixing, animal feed formulation.</p>
      `,
    },
    {
      type: "reveal",
      label: "Show diet problem LP formulation",
      content: `Minimize
  cost: 2 bread + 3.5 milk + 8 cheese + 1.5 potato
Subject To
  protein: 0.1 bread + 0.15 milk + 0.25 cheese + 0.05 potato >= 55
  fat: 0.05 bread + 0.1 milk + 0.2 cheese + 0.02 potato >= 33
Bounds
  0 <= bread <= 10
  0 <= milk <= 10
  0 <= cheese <= 10
  0 <= potato <= 10
End`,
    },
    {
      type: "prose",
      content: `
        <h3>Pattern 2: Transportation / Network Flow</h3>
        <p><strong>You have</strong>: sources (warehouses) with supply, sinks (stores) with demand,
        and routes between them with shipping costs.</p>
        <p><strong>You decide</strong>: how much to ship on each route (continuous variables).</p>
        <p><strong>Constraints</strong>: don't exceed supply, meet demand.</p>
        <p><strong>Objective</strong>: minimize total shipping cost.</p>
        <p>This pattern covers: logistics routing, supply chain design, crew scheduling,
        telecommunications network design.</p>
      `,
    },
    {
      type: "reveal",
      label: "Show transportation LP formulation",
      content: `Minimize
  cost: 4 x11 + 8 x12 + 1 x13 + 7 x21 + 3 x22 + 5 x23
Subject To
  supply1: x11 + x12 + x13 <= 300
  supply2: x21 + x22 + x23 <= 500
  demand1: x11 + x21 >= 200
  demand2: x12 + x22 >= 250
  demand3: x13 + x23 >= 150
Bounds
  0 <= x11
  0 <= x12
  0 <= x13
  0 <= x21
  0 <= x22
  0 <= x23
End`,
    },
    {
      type: "checkpoint",
      message: "You've seen two fundamental patterns: blending (mix ingredients to meet requirements) and transportation (ship goods to meet demand).",
    },
  ],
};
