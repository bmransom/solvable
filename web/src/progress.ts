import { writable } from "svelte/store";

const STORAGE_KEY = "solvable_progress";

export interface Progress {
  completed_lessons: string[];
  current_chapter: string;
  current_lesson: string;
  prediction_responses: Record<string, number[]>;
}

function load_from_storage(): Progress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        completed_lessons: parsed.completed_lessons ?? [],
        current_chapter: parsed.current_chapter ?? "ch1-what-is-optimization",
        current_lesson: parsed.current_lesson ?? "maximize-profit",
        prediction_responses: parsed.prediction_responses ?? {},
      };
    }
  } catch {
    // Ignore parse errors
  }
  return {
    completed_lessons: [],
    current_chapter: "ch1-what-is-optimization",
    current_lesson: "maximize-profit",
    prediction_responses: {},
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

export function save_prediction(chapter_id: string, lesson_id: string, prediction_index: number) {
  progress.update((current) => {
    const key = `${chapter_id}/${lesson_id}`;
    const existing = current.prediction_responses[key] ?? [];
    return {
      ...current,
      prediction_responses: {
        ...current.prediction_responses,
        [key]: [...existing, prediction_index],
      },
    };
  });
}

export function reset_lesson(chapter_id: string, lesson_id: string) {
  progress.update((current) => {
    const key = `${chapter_id}/${lesson_id}`;
    const { [key]: _removed, ...remaining_predictions } = current.prediction_responses;
    return {
      ...current,
      completed_lessons: current.completed_lessons.filter((k) => k !== key),
      prediction_responses: remaining_predictions,
    };
  });
}

export function reset_progress() {
  progress.set({
    completed_lessons: [],
    current_chapter: "ch1-what-is-optimization",
    current_lesson: "maximize-profit",
    prediction_responses: {},
  });
}
