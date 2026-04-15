<script lang="ts">
  interface Props {
    message: string;
  }

  let { message }: Props = $props();
</script>

<div class="checkpoint-block">
  <span class="checkpoint-icon">✔</span>
  <span class="checkpoint-message">{message}</span>
</div>

<style>
  .checkpoint-block {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    padding: 1rem 1.25rem;
    background: rgba(81, 207, 102, 0.06);
    border: 1px solid rgba(81, 207, 102, 0.2);
    border-radius: 8px;
  }

  .checkpoint-icon {
    font-size: 1.1rem;
    color: #51cf66;
    flex-shrink: 0;
    margin-top: 0.1rem;
  }

  .checkpoint-message {
    font-size: 0.95rem;
    line-height: 1.5;
    color: #a0c4a8;
    font-weight: 500;
  }
</style>
