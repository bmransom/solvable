import type { Chapter } from "../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";

export const chapter3: Chapter = {
  id: "ch3-how-solver-works",
  title: "How the Solver Finds the Answer",
  description: "Walk between vertices and discover why corners are special",
  lessons: [lesson1, lesson2],
};
