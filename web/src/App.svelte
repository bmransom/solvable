<script lang="ts">
  import { onMount } from "svelte";
  import ChapterSidebar from "./ChapterSidebar.svelte";
  import LessonView from "./LessonView.svelte";
  import SandboxView from "./SandboxView.svelte";
  import { CHAPTERS, findChapter, findLesson } from "./chapters/index";
  import { progress, navigate_to, complete_lesson, type Progress } from "./progress";
  import { initializeParser } from "./parser";
  import type { Chapter, Lesson } from "./chapters/types";

  let progress_state: Progress = $state({
    completed_lessons: [],
    current_chapter: "ch1-what-is-optimization",
    current_lesson: "your-first-optimization",
  });

  let current_chapter: Chapter | undefined = $state(undefined);
  let current_lesson: Lesson | undefined = $state(undefined);

  progress.subscribe((value) => {
    progress_state = value;
    const chapter = findChapter(value.current_chapter);

    if (chapter?.is_sandbox) {
      current_chapter = chapter;
      current_lesson = undefined;
      return;
    }

    const found = findLesson(value.current_chapter, value.current_lesson);
    if (found) {
      current_chapter = found.chapter;
      current_lesson = found.lesson;
    } else if (chapter && chapter.lessons.length > 0) {
      current_chapter = chapter;
      current_lesson = chapter.lessons[0];
      navigate_to(chapter.id, chapter.lessons[0].id);
    }
  });

  onMount(async () => {
    try {
      await initializeParser();
    } catch (error) {
      console.error("Failed to initialize parser:", error);
    }
  });

  function handle_select_chapter(chapter_id: string) {
    const chapter = findChapter(chapter_id);
    if (!chapter) return;
    if (chapter.is_sandbox) {
      current_chapter = chapter;
      current_lesson = undefined;
      navigate_to(chapter.id, "");
    } else if (chapter.lessons.length > 0) {
      navigate_to(chapter.id, chapter.lessons[0].id);
    }
  }

  const is_sandbox = $derived(current_chapter?.is_sandbox === true);

  function handle_select_lesson(chapter_id: string, lesson_id: string) {
    navigate_to(chapter_id, lesson_id);
  }

  function handle_next_lesson() {
    if (!current_chapter || !current_lesson) return;

    // Mark current lesson complete
    complete_lesson(current_chapter.id, current_lesson.id);

    // Find next lesson
    const current_index = current_chapter.lessons.findIndex(
      (lesson) => lesson.id === current_lesson!.id
    );

    if (current_index < current_chapter.lessons.length - 1) {
      // Next lesson in same chapter
      const next_lesson = current_chapter.lessons[current_index + 1];
      navigate_to(current_chapter.id, next_lesson.id);
    } else {
      // Find next chapter that has lessons
      const chapter_index = CHAPTERS.findIndex((ch) => ch.id === current_chapter!.id);
      for (let i = chapter_index + 1; i < CHAPTERS.length; i++) {
        if (CHAPTERS[i].lessons.length > 0) {
          navigate_to(CHAPTERS[i].id, CHAPTERS[i].lessons[0].id);
          return;
        }
      }
      // No more content — mark complete, show completion state
    }
  }

  const has_next_lesson = $derived.by(() => {
    if (!current_chapter || !current_lesson) return false;
    const current_index = current_chapter.lessons.findIndex(
      (lesson) => lesson.id === current_lesson!.id
    );
    // Next lesson in same chapter?
    if (current_index < current_chapter.lessons.length - 1) return true;
    // Next chapter with lessons?
    const chapter_index = CHAPTERS.findIndex((ch) => ch.id === current_chapter!.id);
    for (let i = chapter_index + 1; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].lessons.length > 0) return true;
    }
    return false;
  });

  const is_last_lesson_in_chapter = $derived.by(() => {
    if (!current_chapter || !current_lesson) return false;
    const current_index = current_chapter.lessons.findIndex(
      (lesson) => lesson.id === current_lesson!.id
    );
    return current_index === current_chapter.lessons.length - 1;
  });
</script>

<div class="app">
  <ChapterSidebar
    chapters={CHAPTERS}
    current_chapter_id={progress_state.current_chapter}
    {progress_state}
    on_select_chapter={handle_select_chapter}
    on_select_lesson={handle_select_lesson}
  />

  <main class="lesson-main" class:sandbox-main={is_sandbox}>
    {#if is_sandbox}
      <SandboxView />
    {:else if current_lesson}
      {#key `${progress_state.current_chapter}/${progress_state.current_lesson}`}
        <LessonView lesson={current_lesson} />
      {/key}

      <div class="lesson-footer">
        {#if has_next_lesson}
          <button class="next-button" onclick={handle_next_lesson}>
            {is_last_lesson_in_chapter ? "Next Chapter" : "Continue"}
            <span class="next-arrow">→</span>
          </button>
        {:else}
          <button class="next-button complete-button" onclick={handle_next_lesson}>
            Complete Chapter ✔
          </button>
        {/if}
      </div>
    {:else}
      <div class="empty-state">
        <p>Select a chapter to begin.</p>
      </div>
    {/if}
  </main>
</div>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: "Inter", system-ui, -apple-system, sans-serif;
    background: #0f1117;
    color: #e1e4eb;
    height: 100vh;
    overflow: hidden;
  }

  .app {
    display: flex;
    height: 100vh;
  }

  .lesson-main {
    flex: 1;
    overflow-y: auto;
    min-width: 0;
  }

  .sandbox-main {
    overflow: hidden;
  }

  .lesson-footer {
    display: flex;
    justify-content: center;
    padding: 1rem 1.5rem 3rem;
    max-width: 720px;
    margin: 0 auto;
  }

  .next-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.7rem 2rem;
    background: #4c6ef5;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s, transform 0.1s;
  }

  .next-button:hover {
    background: #5c7cfa;
    transform: translateX(2px);
  }

  .next-arrow {
    font-size: 1.1rem;
    transition: transform 0.15s;
  }

  .next-button:hover .next-arrow {
    transform: translateX(3px);
  }

  .complete-button {
    background: #2b8a3e;
  }

  .complete-button:hover {
    background: #37a34a;
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #6b7084;
    font-size: 1.1rem;
  }

  @media (max-width: 768px) {
    .app {
      flex-direction: column;
    }

    .app :global(.chapter-sidebar) {
      width: 100%;
      height: auto;
      max-height: 40vh;
      border-right: none;
      border-bottom: 1px solid #2a2d3a;
    }
  }
</style>
