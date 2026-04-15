<script lang="ts">
  interface Props {
    label: string;
    content: string;
  }

  let { label, content }: Props = $props();
  let is_open = $state(false);
</script>

<div class="reveal-block">
  <button class="reveal-toggle" onclick={() => (is_open = !is_open)}>
    <span class="reveal-icon">{is_open ? "▼" : "▶"}</span>
    {label}
  </button>
  {#if is_open}
    <div class="reveal-content">
      <pre class="lp-code">{content}</pre>
    </div>
  {/if}
</div>

<style>
  .reveal-block {
    border: 1px solid #2a2d3a;
    border-radius: 8px;
    overflow: hidden;
  }

  .reveal-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem 1rem;
    background: #1a1d2e;
    border: none;
    color: #61afef;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    text-align: left;
    transition: background 0.15s;
  }

  .reveal-toggle:hover {
    background: #21243a;
  }

  .reveal-icon {
    font-size: 0.7rem;
    transition: transform 0.15s;
  }

  .reveal-content {
    padding: 1rem;
    background: #161822;
    border-top: 1px solid #2a2d3a;
  }

  .lp-code {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.85rem;
    line-height: 1.6;
    color: #abb2bf;
    margin: 0;
    white-space: pre;
    overflow-x: auto;
  }
</style>
