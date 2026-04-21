<script lang="ts">
  import type { Lesson, LessonBlock } from "./chapters/types";
  import ProseBlock from "./ProseBlock.svelte";
  import RevealBlock from "./RevealBlock.svelte";
  import GoDeeperBlock from "./GoDeeperBlock.svelte";
  import PredictionBlock from "./PredictionBlock.svelte";
  import CheckpointBlock from "./CheckpointBlock.svelte";
  import InteractivePlot from "./InteractivePlot.svelte";
  import VertexWalker from "./VertexWalker.svelte";
  import { reset_lesson } from "./progress";
  import { push_route } from "./router";

  interface Props {
    lesson: Lesson;
    chapter_id?: string;
  }

  let { lesson, chapter_id = "" }: Props = $props();
  let show_reset_confirm = $state(false);

  function handle_reset() {
    if (chapter_id) {
      reset_lesson(chapter_id, lesson.id);
      show_reset_confirm = false;
    }
  }
</script>

<article class="lesson-view">
  <h2 class="lesson-title">{lesson.title}</h2>

  <div class="lesson-blocks">
    {#each lesson.blocks as block}
      <div class="block-wrapper">
        {#if block.type === "prose"}
          <ProseBlock content={block.content} />
        {:else if block.type === "interactive"}
          {#if block.component === "InteractivePlot"}
            <InteractivePlot {...block.props as any} />
          {:else if block.component === "VertexWalker"}
            <VertexWalker {...block.props as any} />
          {/if}
        {:else if block.type === "reveal"}
          <RevealBlock label={block.label} content={block.content} />
        {:else if block.type === "go_deeper"}
          <GoDeeperBlock title={block.title} content={block.content} />
        {:else if block.type === "prediction"}
          <PredictionBlock
            question={block.question}
            options={block.options}
            correct_index={block.correct_index}
            explanation={block.explanation}
          />
        {:else if block.type === "checkpoint"}
          <CheckpointBlock message={block.message} />
        {:else if block.type === "sandbox_link"}
          <button class="sandbox-link-button" onclick={() => {
            // Store LP text for sandbox to pick up
            sessionStorage.setItem("solvable_sandbox_lp", block.lp_text);
            push_route({ view: "sandbox" });
          }}>
            {block.label} →
          </button>
        {/if}
      </div>
    {/each}
  </div>

  {#if chapter_id}
    <div class="lesson-reset">
      {#if show_reset_confirm}
        <span class="reset-confirm-text">Reset this lesson?</span>
        <button class="reset-confirm-button" onclick={handle_reset}>Yes, reset</button>
        <button class="reset-cancel-button" onclick={() => show_reset_confirm = false}>Cancel</button>
      {:else}
        <button class="reset-button" onclick={() => show_reset_confirm = true}>Reset this lesson</button>
      {/if}
    </div>
  {/if}
</article>

<style>
  .lesson-view {
    max-width: 720px;
    margin: 0 auto;
    padding: 2rem 1.5rem 4rem;
  }

  .lesson-title {
    font-size: 1.6rem;
    font-weight: 600;
    color: #f0f2f7;
    margin-bottom: 1.5rem;
    letter-spacing: -0.02em;
  }

  .lesson-blocks {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .block-wrapper {
    /* Interactive blocks can break out wider */
  }

  .sandbox-link-button {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.5rem 1rem;
    background: transparent;
    border: 1px solid #4c6ef5;
    color: #4c6ef5;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: background 0.15s;
  }

  .sandbox-link-button:hover {
    background: rgba(76, 110, 245, 0.1);
  }

  .lesson-reset {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding-top: 2rem;
    border-top: 1px solid #1e2030;
    margin-top: 1rem;
  }

  .reset-button {
    background: none;
    border: none;
    color: #495162;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    transition: color 0.15s;
  }

  .reset-button:hover {
    color: #6b7084;
  }

  .reset-confirm-text {
    color: #6b7084;
    font-size: 0.8rem;
  }

  .reset-confirm-button {
    background: #2a2d3a;
    border: 1px solid #fa5252;
    color: #fa5252;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.3rem 0.7rem;
    border-radius: 4px;
  }

  .reset-confirm-button:hover {
    background: #fa5252;
    color: white;
  }

  .reset-cancel-button {
    background: none;
    border: 1px solid #2a2d3a;
    color: #6b7084;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 0.3rem 0.7rem;
    border-radius: 4px;
  }

  @media (max-width: 768px) {
    .lesson-view {
      padding: 1.5rem 1rem 3rem;
    }

    .lesson-title {
      font-size: 1.3rem;
    }
  }
</style>
