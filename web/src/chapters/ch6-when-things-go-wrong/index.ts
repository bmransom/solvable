import type { Chapter } from "../types";
// Re-use existing lessons from the old ch5
import { lesson1 } from "../ch5-when-things-go-wrong/lesson1";
import { lesson2 } from "../ch5-when-things-go-wrong/lesson2";
import { lesson3 } from "../ch5-when-things-go-wrong/lesson3";
import { lesson4 } from "../ch5-when-things-go-wrong/lesson4";

export const chapter6_failure: Chapter = {
  id: "ch6-when-things-go-wrong",
  title: "When Things Go Wrong",
  description: "Break a model to understand infeasibility, unboundedness, and degeneracy",
  lessons: [lesson1, lesson2, lesson3, lesson4],
};
