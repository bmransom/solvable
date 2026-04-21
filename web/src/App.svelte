<script lang="ts">
  import { onMount } from "svelte";
  import ChapterSidebar from "./ChapterSidebar.svelte";
  import LandingPage from "./LandingPage.svelte";
  import LessonView from "./LessonView.svelte";
  import SandboxView from "./SandboxView.svelte";
  import { CHAPTERS, findChapter, findLesson } from "./chapters/index";
  import { progress, navigate_to, complete_lesson, type Progress } from "./progress";
  import { initializeParser } from "./parser";
  import { get_current_route, push_route, type Route } from "./router";
  import type { Chapter, Lesson } from "./chapters/types";

  let progress_state: Progress = $state({
    completed_lessons: [],
    current_chapter: "ch1-what-is-optimization",
    current_lesson: "maximize-profit",
    prediction_responses: {},
  });

  let current_chapter: Chapter | undefined = $state(undefined);
  let current_lesson: Lesson | undefined = $state(undefined);
  let current_view: "landing" | "lesson" | "sandbox" = $state("landing");

  function apply_route(route: Route) {
    if (route.view === "landing") {
      current_view = "landing";
      current_chapter = undefined;
      current_lesson = undefined;
      return;
    }

    if (route.view === "sandbox") {
      current_view = "sandbox";
      const sandbox_chapter = CHAPTERS.find((ch) => ch.is_sandbox);
      current_chapter = sandbox_chapter;
      current_lesson = undefined;
      if (sandbox_chapter) {
        navigate_to(sandbox_chapter.id, "");
      }
      return;
    }

    if (route.view === "lesson" && route.chapter_id && route.lesson_id) {
      const found = findLesson(route.chapter_id, route.lesson_id);
      if (found) {
        current_view = "lesson";
        current_chapter = found.chapter;
        current_lesson = found.lesson;
        navigate_to(found.chapter.id, found.lesson.id);
        return;
      }

      // Try finding the chapter and defaulting to its first lesson
      const chapter = findChapter(route.chapter_id);
      if (chapter && chapter.lessons.length > 0) {
        current_view = "lesson";
        current_chapter = chapter;
        current_lesson = chapter.lessons[0];
        push_route({ view: "lesson", chapter_id: chapter.id, lesson_id: chapter.lessons[0].id });
        navigate_to(chapter.id, chapter.lessons[0].id);
        return;
      }

      // Invalid route — redirect to landing
      push_route({ view: "landing" });
      current_view = "landing";
      return;
    }

    // Fallback
    current_view = "landing";
  }

  progress.subscribe((value) => {
    progress_state = value;
  });

  onMount(async () => {
    try {
      await initializeParser();
    } catch (error) {
      console.error("Failed to initialize parser:", error);
    }

    // Apply initial route from URL
    const initial_route = get_current_route();
    if (initial_route.view === "landing" && progress_state.completed_lessons.length > 0) {
      // If URL is root but user has progress, resume from last position
      const route: Route = {
        view: "lesson",
        chapter_id: progress_state.current_chapter,
        lesson_id: progress_state.current_lesson,
      };
      push_route(route);
      apply_route(route);
    } else {
      apply_route(initial_route);
    }

    // Listen for hash changes (browser back/forward)
    window.addEventListener("hashchange", () => {
      apply_route(get_current_route());
    });
  });

  function handle_navigate(chapter_id: string, lesson_id: string) {
    const chapter = findChapter(chapter_id);
    if (!chapter) return;

    if (chapter.is_sandbox) {
      push_route({ view: "sandbox" });
    } else {
      const target_lesson_id = lesson_id || (chapter.lessons.length > 0 ? chapter.lessons[0].id : "");
      push_route({ view: "lesson", chapter_id, lesson_id: target_lesson_id });
    }
  }

  function handle_select_chapter(chapter_id: string) {
    const chapter = findChapter(chapter_id);
    if (!chapter) return;
    if (chapter.is_sandbox) {
      handle_navigate(chapter_id, "");
    } else if (chapter.lessons.length > 0) {
      handle_navigate(chapter_id, chapter.lessons[0].id);
    }
  }

  const is_sandbox = $derived(current_view === "sandbox");
  let sidebar_open = $state(false);

  function handle_select_lesson(chapter_id: string, lesson_id: string) {
    handle_navigate(chapter_id, lesson_id);
  }

  function handle_next_lesson() {
    if (!current_chapter || !current_lesson) return;

    complete_lesson(current_chapter.id, current_lesson.id);

    const current_index = current_chapter.lessons.findIndex(
      (lesson) => lesson.id === current_lesson!.id
    );

    if (current_index < current_chapter.lessons.length - 1) {
      const next_lesson = current_chapter.lessons[current_index + 1];
      handle_navigate(current_chapter.id, next_lesson.id);
    } else {
      const chapter_index = CHAPTERS.findIndex((ch) => ch.id === current_chapter!.id);
      for (let i = chapter_index + 1; i < CHAPTERS.length; i++) {
        if (CHAPTERS[i].lessons.length > 0) {
          handle_navigate(CHAPTERS[i].id, CHAPTERS[i].lessons[0].id);
          return;
        }
      }
    }
  }

  const has_next_lesson = $derived.by(() => {
    if (!current_chapter || !current_lesson) return false;
    const current_index = current_chapter.lessons.findIndex(
      (lesson) => lesson.id === current_lesson!.id
    );
    if (current_index < current_chapter.lessons.length - 1) return true;
    const chapter_index = CHAPTERS.findIndex((ch) => ch.id === current_chapter!.id);
    for (let i = chapter_index + 1; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].lessons.length > 0) return true;
    }
    return false;
  });

  function handle_start_tutorial() {
    const route: Route = { view: "lesson", chapter_id: "ch1-what-is-optimization", lesson_id: "maximize-profit" };
    push_route(route);
  }

  const is_last_lesson_in_chapter = $derived.by(() => {
    if (!current_chapter || !current_lesson) return false;
    const current_index = current_chapter.lessons.findIndex(
      (lesson) => lesson.id === current_lesson!.id
    );
    return current_index === current_chapter.lessons.length - 1;
  });
</script>

{#if current_view === "landing"}
  <LandingPage on_start={handle_start_tutorial} />
{:else}
<div class="app">
  <button class="mobile-menu-button" onclick={() => sidebar_open = !sidebar_open} aria-label="Toggle menu">
    {sidebar_open ? "✕" : "☰"}
  </button>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  {#if sidebar_open}
    <div class="sidebar-overlay" onclick={() => sidebar_open = false}></div>
  {/if}

  <div class="sidebar-wrapper" class:sidebar-open={sidebar_open}>
    <ChapterSidebar
      chapters={CHAPTERS}
      current_chapter_id={progress_state.current_chapter}
      {progress_state}
      on_select_chapter={(id) => { handle_select_chapter(id); sidebar_open = false; }}
      on_select_lesson={(cid, lid) => { handle_select_lesson(cid, lid); sidebar_open = false; }}
    />
  </div>

  <main class="lesson-main" class:sandbox-main={is_sandbox}>
    {#if is_sandbox}
      <SandboxView />
    {:else if current_lesson}
      {#key `${progress_state.current_chapter}/${progress_state.current_lesson}`}
        <LessonView lesson={current_lesson} chapter_id={current_chapter?.id} />
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
{/if}

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

  .mobile-menu-button {
    display: none;
    position: fixed;
    top: 0.75rem;
    left: 0.75rem;
    z-index: 1001;
    width: 40px;
    height: 40px;
    background: #1a1d2e;
    border: 1px solid #2a2d3a;
    border-radius: 8px;
    color: #e1e4eb;
    font-size: 1.2rem;
    cursor: pointer;
    align-items: center;
    justify-content: center;
  }

  .sidebar-overlay {
    display: none;
  }

  @media (max-width: 768px) {
    .mobile-menu-button {
      display: flex;
    }

    .sidebar-wrapper {
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      height: 100vh;
      transform: translateX(-100%);
      transition: transform 0.25s ease;
    }

    .sidebar-wrapper.sidebar-open {
      transform: translateX(0);
    }

    .sidebar-overlay {
      display: block;
      position: fixed;
      inset: 0;
      z-index: 999;
      background: rgba(0, 0, 0, 0.5);
    }

    .lesson-main {
      padding-top: 3.5rem;
    }
  }
</style>
