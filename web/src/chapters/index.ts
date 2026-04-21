import type { Chapter } from "./types";
import { chapter1 } from "./ch1-what-is-optimization";
import { chapter2 } from "./ch2-constraints";
import { chapter3 } from "./ch3-how-solver-works";
import { chapter4 } from "./ch4-formulation-patterns";
import { chapter5_ip } from "./ch5-integer-programming";
import { chapter6_failure } from "./ch6-when-things-go-wrong";
import { chapter7 } from "./ch7-reading-the-plan";
import { chapter8 } from "./ch8-running-in-production";

export const CHAPTERS: Chapter[] = [
  chapter1,
  chapter2,
  chapter3,
  chapter4,
  chapter5_ip,
  chapter6_failure,
  chapter7,
  chapter8,
  {
    id: "sandbox",
    title: "Sandbox",
    description: "Free-form LP editor - build and solve anything",
    lessons: [],
    is_sandbox: true,
  },
];

export function findChapter(chapter_id: string): Chapter | undefined {
  return CHAPTERS.find((chapter) => chapter.id === chapter_id);
}

export function findLesson(chapter_id: string, lesson_id: string) {
  const chapter = findChapter(chapter_id);
  if (!chapter) return undefined;
  const lesson = chapter.lessons.find((lesson) => lesson.id === lesson_id);
  return lesson ? { chapter, lesson } : undefined;
}
