import type { Chapter } from "../types";
import { lesson1 } from "./lesson1";
import { lesson2 } from "./lesson2";
import { lesson3 } from "./lesson3";
import { lesson4 } from "./lesson4";

export const chapter8: Chapter = {
  id: "ch8-production",
  title: "Optimization in Production",
  description: "Architecture patterns, re-solving, failure handling, and monitoring",
  lessons: [lesson1, lesson2, lesson3, lesson4],
};
