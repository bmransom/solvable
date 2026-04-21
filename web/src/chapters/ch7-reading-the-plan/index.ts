import type { Chapter } from "../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";
import { lesson3 } from "./lesson3";

export const chapter7: Chapter = {
  id: "ch7-reading-the-plan",
  title: "Reading the Plan",
  description: "Find the compromises in solver output and translate them into business language",
  lessons: [lesson1, lesson2, lesson3],
};
