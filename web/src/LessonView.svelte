<script lang="ts">
  import type { Lesson, LessonBlock } from "./chapters/types";
  import ProseBlock from "./ProseBlock.svelte";
  import RevealBlock from "./RevealBlock.svelte";
  import GoDeeperBlock from "./GoDeeperBlock.svelte";
  import PredictionBlock from "./PredictionBlock.svelte";
  import CheckpointBlock from "./CheckpointBlock.svelte";
  import InteractivePlot from "./InteractivePlot.svelte";

  interface Props {
    lesson: Lesson;
  }

  let { lesson }: Props = $props();
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
        {/if}
      </div>
    {/each}
  </div>
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
</style>
