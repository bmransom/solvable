import type { Chapter } from "../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";
import { lesson3 } from "./lesson3";

export const chapter1: Chapter = {
  id: "ch1-what-is-optimization",
  title: "What is Optimization?",
  description: "Discover optimization by dragging, not reading equations",
  lessons: [lesson1, lesson2, lesson3],
};
