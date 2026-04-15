<script lang="ts">
  import type { Chapter } from "./chapters/types";
  import type { Progress } from "./progress";

  interface Props {
    chapters: Chapter[];
    current_chapter_id: string;
    progress_state: Progress;
    on_select_chapter: (chapter_id: string) => void;
    on_select_lesson: (chapter_id: string, lesson_id: string) => void;
  }

  let { chapters, current_chapter_id, progress_state, on_select_chapter, on_select_lesson }: Props = $props();

  let expanded_chapter: string | null = $state(null);

  function toggle_expand(chapter_id: string) {
    expanded_chapter = expanded_chapter === chapter_id ? null : chapter_id;
  }

  function chapter_status(chapter: Chapter): "complete" | "in-progress" | "not-started" {
    if (chapter.lessons.length === 0) return "not-started";
    const completed_count = chapter.lessons.filter(
      (lesson) => progress_state.completed_lessons.includes(`${chapter.id}/${lesson.id}`)
    ).length;
    if (completed_count === chapter.lessons.length) return "complete";
    if (completed_count > 0) return "in-progress";
    if (chapter.id === current_chapter_id) return "in-progress";
    return "not-started";
  }
</script>

<nav class="chapter-sidebar">
  <div class="sidebar-header">
    <h1 class="sidebar-title">solvable</h1>
    <span class="sidebar-subtitle">interactive OR tutorial</span>
  </div>

  <div class="chapter-list">
    {#each chapters as chapter, index}
      {@const status = chapter_status(chapter)}
      {@const is_current = chapter.id === current_chapter_id}
      {@const is_expanded = expanded_chapter === chapter.id || is_current}

      <div class="chapter-item" class:current={is_current}>
        <button
          class="chapter-button"
          class:sandbox-button={chapter.is_sandbox}
          onclick={() => {
            if (chapter.lessons.length > 0 || chapter.is_sandbox) {
              on_select_chapter(chapter.id);
              if (!chapter.is_sandbox) toggle_expand(chapter.id);
            }
          }}
          disabled={chapter.lessons.length === 0 && !chapter.is_sandbox}
        >
          <span class="chapter-status-icon" class:complete={status === "complete"} class:in-progress={status === "in-progress"}>
            {#if status === "complete"}
              ✔
            {:else if status === "in-progress"}
              ●
            {:else}
              ○
            {/if}
          </span>
          <span class="chapter-info">
            <span class="chapter-number">{index + 1}.</span>
            <span class="chapter-name">{chapter.title}</span>
          </span>
        </button>

        {#if is_expanded && chapter.lessons.length > 0}
          <div class="lesson-list">
            {#each chapter.lessons as lesson}
              {@const lesson_completed = progress_state.completed_lessons.includes(`${chapter.id}/${lesson.id}`)}
              {@const lesson_is_current = is_current && progress_state.current_lesson === lesson.id}
              <button
                class="lesson-button"
                class:lesson-current={lesson_is_current}
                class:lesson-completed={lesson_completed}
                onclick={() => on_select_lesson(chapter.id, lesson.id)}
              >
                <span class="lesson-status">
                  {lesson_completed ? "✔" : lesson_is_current ? "▶" : "○"}
                </span>
                {lesson.title}
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>
</nav>

<style>
  .chapter-sidebar {
    width: 280px;
    background: #12141e;
    border-right: 1px solid #2a2d3a;
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
    flex-shrink: 0;
  }

  .sidebar-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #2a2d3a;
  }

  .sidebar-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #f0f2f7;
    letter-spacing: -0.02em;
  }

  .sidebar-subtitle {
    font-size: 0.75rem;
    color: #6b7084;
  }

  .chapter-list {
    padding: 0.5rem 0;
    flex: 1;
  }

  .chapter-item {
    border-bottom: 1px solid rgba(42, 45, 58, 0.3);
  }

  .chapter-item.current {
    background: rgba(76, 110, 245, 0.05);
  }

  .chapter-button {
    display: flex;
    align-items: flex-start;
    gap: 0.6rem;
    width: 100%;
    padding: 0.7rem 1rem;
    background: none;
    border: none;
    color: #c8ccd4;
    font-size: 0.85rem;
    text-align: left;
    cursor: pointer;
    transition: background 0.1s;
    line-height: 1.3;
  }

  .chapter-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.03);
  }

  .chapter-button:disabled {
    color: #3a3f52;
    cursor: not-allowed;
  }

  .sandbox-button {
    border-top: 1px solid #2a2d3a;
    margin-top: 0.25rem;
    padding-top: 0.75rem;
  }

  .chapter-status-icon {
    flex-shrink: 0;
    width: 1.1rem;
    text-align: center;
    color: #3a3f52;
    font-size: 0.8rem;
    margin-top: 0.1rem;
  }

  .chapter-status-icon.complete {
    color: #51cf66;
  }

  .chapter-status-icon.in-progress {
    color: #4c6ef5;
  }

  .chapter-info {
    display: flex;
    gap: 0.3rem;
  }

  .chapter-number {
    color: #495162;
    flex-shrink: 0;
  }

  .chapter-name {
    color: inherit;
  }

  .lesson-list {
    padding: 0 0 0.4rem 2.2rem;
  }

  .lesson-button {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    width: 100%;
    padding: 0.35rem 0.75rem;
    background: none;
    border: none;
    color: #6b7084;
    font-size: 0.8rem;
    text-align: left;
    cursor: pointer;
    border-radius: 4px;
    transition: background 0.1s, color 0.1s;
  }

  .lesson-button:hover {
    background: rgba(255, 255, 255, 0.03);
    color: #abb2bf;
  }

  .lesson-button.lesson-current {
    color: #4c6ef5;
    font-weight: 500;
  }

  .lesson-button.lesson-completed {
    color: #51cf66;
  }

  .lesson-status {
    font-size: 0.65rem;
    flex-shrink: 0;
    width: 0.8rem;
    text-align: center;
  }
</style>
