import type { Chapter } from "../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";
import { lesson3 } from "./lesson3";

export const chapter2: Chapter = {
  id: "ch2-constraints",
  title: "Constraints Shape the Possible",
  description: "Add, remove, and drag constraints to see how they shape the feasible region",
  lessons: [lesson1, lesson2, lesson3],
};
