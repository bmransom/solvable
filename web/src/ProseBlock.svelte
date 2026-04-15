<script lang="ts">
  interface Props {
    content: string;
  }

  let { content }: Props = $props();
</script>

<div class="prose-block">
  {@html content}
</div>

<style>
  .prose-block {
    line-height: 1.7;
    font-size: 1.05rem;
    color: #c8ccd4;
  }

  .prose-block :global(p) {
    margin-bottom: 0.8rem;
  }

  .prose-block :global(p:last-child) {
    margin-bottom: 0;
  }

  .prose-block :global(strong) {
    color: #f0f2f7;
    font-weight: 600;
  }

  .prose-block :global(em) {
    color: #e5c07b;
    font-style: italic;
  }

  .prose-block :global(code) {
    font-family: "JetBrains Mono", monospace;
    font-size: 0.9em;
    background: rgba(76, 110, 245, 0.1);
    padding: 0.15em 0.35em;
    border-radius: 3px;
    color: #61afef;
  }

  .prose-block :global(ol),
  .prose-block :global(ul) {
    margin: 0.5rem 0 0.8rem 1.5rem;
  }

  .prose-block :global(li) {
    margin-bottom: 0.3rem;
  }
</style>
