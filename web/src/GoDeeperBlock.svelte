<script lang="ts">
  interface Props {
    title: string;
    content: string;
  }

  let { title, content }: Props = $props();
  let is_open = $state(false);
</script>

<div class="go-deeper-block">
  <button class="go-deeper-toggle" onclick={() => (is_open = !is_open)}>
    <span class="go-deeper-icon">{is_open ? "▼" : "▶"}</span>
    <span class="go-deeper-label">Go Deeper</span>
    <span class="go-deeper-title">{title}</span>
    <span class="optional-badge">optional</span>
  </button>
  {#if is_open}
    <div class="go-deeper-content">
      {@html content}
    </div>
  {/if}
</div>

<style>
  .go-deeper-block {
    border: 1px dashed #2a2d3a;
    border-radius: 8px;
    overflow: hidden;
  }

  .go-deeper-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.65rem 1rem;
    background: transparent;
    border: none;
    color: #6b7084;
    font-size: 0.85rem;
    cursor: pointer;
    text-align: left;
    transition: color 0.15s;
  }

  .go-deeper-toggle:hover {
    color: #abb2bf;
  }

  .go-deeper-icon {
    font-size: 0.65rem;
  }

  .go-deeper-label {
    font-weight: 600;
    color: #c678dd;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .go-deeper-title {
    color: #abb2bf;
  }

  .optional-badge {
    margin-left: auto;
    font-size: 0.7rem;
    padding: 0.15em 0.5em;
    background: rgba(198, 120, 221, 0.1);
    color: #c678dd;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .go-deeper-content {
    padding: 1rem;
    border-top: 1px dashed #2a2d3a;
    font-size: 0.95rem;
    line-height: 1.7;
    color: #9ba0af;
  }

  .go-deeper-content :global(p) {
    margin-bottom: 0.7rem;
  }

  .go-deeper-content :global(p:last-child) {
    margin-bottom: 0;
  }

  .go-deeper-content :global(strong) {
    color: #c8ccd4;
  }

  .go-deeper-content :global(em) {
    color: #e5c07b;
  }
</style>
