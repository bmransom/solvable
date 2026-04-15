<script lang="ts">
  interface Props {
    component: string;
    props: Record<string, unknown>;
  }

  let { component, props }: Props = $props();

  const variable_names = $derived((props.model as any)?.variables ?? []);
  const constraint_count = $derived((props.model as any)?.constraints?.length ?? 0);
</script>

<div class="plot-placeholder">
  <div class="placeholder-icon">
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
      <rect x="8" y="8" width="32" height="32" rx="2" stroke="#4c6ef5" stroke-width="2" fill="none" />
      <line x1="8" y1="32" x2="24" y2="16" stroke="#51cf66" stroke-width="2" />
      <line x1="24" y1="16" x2="40" y2="24" stroke="#51cf66" stroke-width="2" />
      <circle cx="24" cy="16" r="3" fill="#51cf66" />
    </svg>
  </div>
  <div class="placeholder-title">Interactive Plot</div>
  <div class="placeholder-details">
    {variable_names[0] ?? "x"} vs {variable_names[1] ?? "y"} &middot; {constraint_count} constraints
  </div>
  <div class="placeholder-note">
    Plot visualization coming soon. The geometry engine and SVG renderer are the next build step.
  </div>
  <div class="placeholder-features">
    {#if props.allow_drag_point}
      <span class="feature-tag">drag point</span>
    {/if}
    {#if props.allow_drag_constraints}
      <span class="feature-tag">drag constraints</span>
    {/if}
    {#if props.allow_toggle_constraints}
      <span class="feature-tag">toggle constraints</span>
    {/if}
    {#if props.show_objective_contour}
      <span class="feature-tag">contour lines</span>
    {/if}
    {#if props.highlight_optimal}
      <span class="feature-tag">optimal point</span>
    {/if}
  </div>
</div>

<style>
  .plot-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 3rem 2rem;
    background: #1a1d2e;
    border: 2px dashed #2a2d3a;
    border-radius: 12px;
  }

  .placeholder-title {
    font-size: 1rem;
    font-weight: 600;
    color: #6b7084;
  }

  .placeholder-details {
    font-size: 0.85rem;
    color: #495162;
    font-family: "JetBrains Mono", monospace;
  }

  .placeholder-note {
    font-size: 0.8rem;
    color: #3a3f52;
    margin-top: 0.25rem;
  }

  .placeholder-features {
    display: flex;
    gap: 0.4rem;
    flex-wrap: wrap;
    justify-content: center;
    margin-top: 0.5rem;
  }

  .feature-tag {
    font-size: 0.7rem;
    padding: 0.2em 0.5em;
    background: rgba(76, 110, 245, 0.1);
    color: #4c6ef5;
    border-radius: 3px;
    font-family: "JetBrains Mono", monospace;
  }
</style>
