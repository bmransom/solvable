import type { Chapter } from "../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";

export const chapter6: Chapter = {
  id: "ch6-integer-programming",
  title: "Integer Programming: Why It's Hard",
  description: "LP relaxation, branch and bound, and the exponential wall",
  lessons: [lesson1, lesson2],
};
