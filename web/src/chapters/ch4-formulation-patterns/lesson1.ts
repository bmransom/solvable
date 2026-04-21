import type { Lesson } from "../types";

export const lesson1: Lesson = {
  id: "the-modeling-skill",
  title: "The Hardest Part: Modeling",
  blocks: [
    {
      type: "prose",
      content: `
        <p>You now know how to read and solve an LP. But the hardest part of optimization
        isn't solving; it's <strong>modeling</strong>. Translating a messy real-world problem
        into decision variables, constraints, and an objective.</p>
        <p>Most real problems follow a small number of recurring patterns.</p>
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
  cost: 4 ship_w1_s1 + 8 ship_w1_s2 + 1 ship_w1_s3
     + 7 ship_w2_s1 + 3 ship_w2_s2 + 5 ship_w2_s3
Subject To
  supply_w1: ship_w1_s1 + ship_w1_s2 + ship_w1_s3 <= 300
  supply_w2: ship_w2_s1 + ship_w2_s2 + ship_w2_s3 <= 500
  demand_s1: ship_w1_s1 + ship_w2_s1 >= 200
  demand_s2: ship_w1_s2 + ship_w2_s2 >= 250
  demand_s3: ship_w1_s3 + ship_w2_s3 >= 150
Bounds
  0 <= ship_w1_s1
  0 <= ship_w1_s2
  0 <= ship_w1_s3
  0 <= ship_w2_s1
  0 <= ship_w2_s2
  0 <= ship_w2_s3
End`,
    },
    {
      type: "checkpoint",
      message: "You've seen two fundamental patterns: blending (mix ingredients to meet requirements) and transportation (ship goods to meet demand).",
    },
  ],
};
