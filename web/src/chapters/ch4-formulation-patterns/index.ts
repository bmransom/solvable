import type { Chapter } from "../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";
import { lesson3 } from "./lesson3";

export const chapter4: Chapter = {
  id: "ch4-formulation-patterns",
  title: "Formulation Patterns",
  description: "The patterns that cover 90% of real optimization problems",
  lessons: [lesson1, lesson2, lesson3],
};
