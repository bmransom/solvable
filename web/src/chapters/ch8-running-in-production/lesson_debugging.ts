import type { Lesson } from "../types";

export const lesson_debugging: Lesson = {
  id: "the-debugging-question",
  title: "The Debugging Question",
  blocks: [
    {
      type: "prose",
      content: `The planner looks at today's plan and says: "Why did Nashville volume spike?"

You have two solves: yesterday's plan and today's plan. You can see that
<code>ship_nashville</code> went from 300 to 500. But you can also see that 5 demand values
changed, 2 carrier rates updated, and a warehouse went into maintenance.
Which input caused the spike?`,
    },
    {
      type: "prose",
      content: `<h3>Don't try to attribute automatically</h3>

It's tempting to build an automated system that says "the Nashville spike was 60%
caused by demand and 40% caused by the carrier rate change." Don't.

In a linear program, everything is coupled. Changing one demand value can cascade
through the entire solution — a different warehouse picks up volume, which fills its
capacity, which pushes other demand to a third warehouse. A single input change can
move 30 variables because the basis changed.

Even if you ran counterfactuals (re-solve with each input change applied one at a time),
the results can be misleading. You freeze input A and Nashville drops. You freeze input B
and Nashville also drops. Both "explain" the same change. The individual counterfactuals
don't add up to 100%.`,
    },
    {
      type: "prose",
      content: `<h3>What to do instead</h3>

<strong>Step 1: Show the diff.</strong> Side by side: yesterday's inputs vs. today's inputs.
Yesterday's outputs vs. today's outputs. Don't try to connect them causally. Just show both.

<strong>Step 2: Let the planner ask.</strong> They'll say "I think it's the carrier rate — test it."
That's a specific question.

<strong>Step 3: Re-solve with one input frozen.</strong> Take today's inputs, but freeze the carrier
rate at yesterday's value. One solve. If Nashville volume drops back to 300, the carrier
rate was the driver. If it stays at 500, it wasn't.

This is not an automated attribution engine. It's a debugging tool that answers one
question at a time. The planner brings the hypothesis. The solver tests it.`,
    },
    {
      type: "prediction",
      question: "The planner asks why Memphis overflow doubled. You re-solve with yesterday's carrier rate and Memphis overflow stays doubled. What do you do?",
      options: [
        "The carrier rate isn't the cause. Ask the planner for another hypothesis to test.",
        "Run counterfactuals for all remaining input changes to find the cause automatically.",
        "Report that the carrier rate is partially responsible — the counterfactual doesn't fully explain it.",
      ],
      correct_index: 0,
      explanation: "The counterfactual ruled out the carrier rate — Memphis overflow didn't change when you froze it. Don't waste time running exhaustive counterfactuals. The planner knows their business. Ask: 'What else changed this week?' They'll suggest the next hypothesis. One re-solve at a time.",
    },
    {
      type: "prose",
      content: `<h3>Build the tool, not the answer</h3>

Your system should make it easy to:
<ul>
<li>See yesterday's inputs vs. today's inputs (what changed)</li>
<li>See yesterday's outputs vs. today's outputs (what moved)</li>
<li>Freeze one input at its previous value and re-solve (test a hypothesis)</li>
</ul>

That's three features. Not an attribution engine, not a causal model, not a dashboard
with 50 charts. Three features that let the planner debug the plan interactively.`,
    },
    {
      type: "checkpoint",
      message: "You know the debugging pattern: show the diff, let the planner ask, re-solve with one input frozen. One question at a time.",
    },
  ],
};
