import type { Chapter } from "../types";
// Existing production lessons
import { lesson1 } from "../ch8-production/lesson1";  // Time Limits and Fallbacks
import { lesson2 } from "../ch8-production/lesson2";  // Re-solving and Warm Starting
import { lesson4 } from "../ch8-production/lesson4";  // Reading Solver Logs
import { lesson5 } from "../ch8-production/lesson5";  // Choosing a Solver
// Absorbed from old Ch9
import { lesson1 as ch9_lesson1 } from "../ch9-decision-systems/lesson1";  // Validating Inputs and Outputs
import { lesson2 as ch9_lesson2 } from "../ch9-decision-systems/lesson2";  // Monitoring and Observability
import { lesson3 as ch9_lesson3 } from "../ch9-decision-systems/lesson3";  // Explaining and Auditing Decisions
// New lessons
import { lesson_regression } from "./lesson_regression";
import { lesson_debugging } from "./lesson_debugging";

export const chapter8: Chapter = {
  id: "ch8-running-in-production",
  title: "Running in Production",
  description: "Time limits, status handling, regression testing, monitoring, and debugging optimization systems",
  lessons: [
    lesson1,           // Time Limits and Fallbacks
    lesson2,           // Re-solving and Warm Starting
    lesson_regression, // Model Regression Testing (new)
    lesson4,           // Reading Solver Logs
    ch9_lesson1,       // Validating Inputs and Outputs (from Ch9)
    ch9_lesson2,       // Monitoring and Observability (from Ch9)
    lesson_debugging,  // The Debugging Question (new)
    ch9_lesson3,       // Explaining and Auditing Decisions (from Ch9)
    lesson5,           // Choosing a Solver
  ],
};
