import type { Chapter } from "../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";
import { lesson3 } from "./lesson3";

export const chapter5: Chapter = {
  id: "ch5-when-things-go-wrong",
  title: "When Things Go Wrong",
  description: "Break a model to understand infeasibility, unboundedness, and degeneracy",
  lessons: [lesson1, lesson2, lesson3],
};
