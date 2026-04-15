<script lang="ts">
  interface Props {
    question: string;
    options: string[];
    correct_index: number;
    explanation: string;
  }

  let { question, options, correct_index, explanation }: Props = $props();
  let selected_index: number | null = $state(null);
  let is_submitted = $state(false);

  function submit() {
    if (selected_index !== null) {
      is_submitted = true;
    }
  }

  const is_correct = $derived(selected_index === correct_index);
</script>

<div class="prediction-block">
  <div class="prediction-question">{question}</div>

  <div class="prediction-options">
    {#each options as option, index}
      <label
        class="prediction-option"
        class:selected={selected_index === index && !is_submitted}
        class:correct={is_submitted && index === correct_index}
        class:incorrect={is_submitted && selected_index === index && index !== correct_index}
      >
        <input
          type="radio"
          name="prediction"
          value={index}
          disabled={is_submitted}
          onchange={() => (selected_index = index)}
        />
        <span class="option-text">{option}</span>
      </label>
    {/each}
  </div>

  {#if !is_submitted}
    <button
      class="submit-button"
      onclick={submit}
      disabled={selected_index === null}
    >
      Lock in my answer
    </button>
  {:else}
    <div class="prediction-result" class:correct={is_correct} class:incorrect={!is_correct}>
      <span class="result-icon">{is_correct ? "✓" : "✗"}</span>
      <span class="result-label">{is_correct ? "Correct!" : "Not quite."}</span>
    </div>
    <div class="prediction-explanation">
      {@html explanation}
    </div>
  {/if}
</div>

<style>
  .prediction-block {
    padding: 1.25rem;
    background: #1a1d2e;
    border: 1px solid #2a2d3a;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .prediction-question {
    font-size: 1rem;
    font-weight: 500;
    color: #f0f2f7;
  }

  .prediction-options {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .prediction-option {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 0.8rem;
    border: 1px solid #2a2d3a;
    border-radius: 6px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
    font-size: 0.95rem;
    color: #c8ccd4;
  }

  .prediction-option:hover:not(.correct):not(.incorrect) {
    border-color: #4c6ef5;
  }

  .prediction-option.selected {
    border-color: #4c6ef5;
    background: rgba(76, 110, 245, 0.08);
  }

  .prediction-option.correct {
    border-color: #51cf66;
    background: rgba(81, 207, 102, 0.08);
    color: #51cf66;
  }

  .prediction-option.incorrect {
    border-color: #fa5252;
    background: rgba(250, 82, 82, 0.08);
    color: #fa5252;
  }

  .prediction-option input[type="radio"] {
    accent-color: #4c6ef5;
  }

  .submit-button {
    align-self: flex-start;
    padding: 0.5rem 1.25rem;
    background: #4c6ef5;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;
  }

  .submit-button:hover:not(:disabled) {
    background: #5c7cfa;
  }

  .submit-button:disabled {
    background: #3a3f52;
    color: #6b7084;
    cursor: not-allowed;
  }

  .prediction-result {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 600;
    font-size: 1rem;
  }

  .prediction-result.correct {
    color: #51cf66;
  }

  .prediction-result.incorrect {
    color: #fa5252;
  }

  .result-icon {
    font-size: 1.1rem;
  }

  .prediction-explanation {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #9ba0af;
  }

  .prediction-explanation :global(strong) {
    color: #c8ccd4;
  }

  .prediction-explanation :global(em) {
    color: #e5c07b;
  }
</style>
