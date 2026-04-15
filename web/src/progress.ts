import { writable } from "svelte/store";

const STORAGE_KEY = "solvable_progress";

export interface Progress {
  completed_lessons: string[];
  current_chapter: string;
  current_lesson: string;
}

function load_from_storage(): Progress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore parse errors
  }
  return {
    completed_lessons: [],
    current_chapter: "ch1-what-is-optimization",
    current_lesson: "maximize-profit",
  };
}

function save_to_storage(progress: Progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore storage errors (e.g., private browsing)
  }
}

const initial = load_from_storage();
export const progress = writable<Progress>(initial);

progress.subscribe(save_to_storage);

export function complete_lesson(chapter_id: string, lesson_id: string) {
  progress.update((current) => {
    const key = `${chapter_id}/${lesson_id}`;
    if (!current.completed_lessons.includes(key)) {
      return {
        ...current,
        completed_lessons: [...current.completed_lessons, key],
      };
    }
    return current;
  });
}

export function navigate_to(chapter_id: string, lesson_id: string) {
  progress.update((current) => ({
    ...current,
    current_chapter: chapter_id,
    current_lesson: lesson_id,
  }));
}

export function is_lesson_completed(progress_state: Progress, chapter_id: string, lesson_id: string): boolean {
  return progress_state.completed_lessons.includes(`${chapter_id}/${lesson_id}`);
}

export function reset_progress() {
  progress.set({
    completed_lessons: [],
    current_chapter: "ch1-what-is-optimization",
    current_lesson: "maximize-profit",
  });
}
