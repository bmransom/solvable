import type { Chapter } from "../types";
// Re-use existing lessons from the old ch6
import { lesson1 } from "../ch6-integer-programming/lesson1";
import { lesson2 } from "../ch6-integer-programming/lesson2";

export const chapter5_ip: Chapter = {
  id: "ch5-integer-programming",
  title: "Integer Programming",
  description: "LP relaxation, branch and bound, and the exponential wall",
  lessons: [lesson1, lesson2],
};
