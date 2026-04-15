import type { Chapter } from "../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";
import { lesson3 } from "./lesson3";

export const chapter7: Chapter = {
  id: "ch7-sensitivity",
  title: "Sensitivity and Robustness",
  description: "Shadow prices, allowable ranges, and how robust your solution really is",
  lessons: [lesson1, lesson2, lesson3],
};
