<script lang="ts">
  import { onMount } from "svelte";

  export let latestVersion: string = "";

  let show: boolean = true;

  onMount(() => {
    setTimeout(() => (show = false), 7000);
  });
</script>

{#if show}
  <div class="update">
    Update Available: <a href="https://github.com/reiniiriarios/wordwyrm/releases/latest" target="_blank">
      Download
      {#if latestVersion}
        v{latestVersion}
      {:else}
        Latest Version
      {/if}
    </a>
  </div>
{/if}

<style lang="scss">
  .update {
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 0.9rem;
    padding: 0.5rem 0.75rem;
    background-color: var(--c-overlay);
    border-top-left-radius: 0.25rem;
    box-shadow: 0 0 0.5rem 0.25rem rgba(0, 0, 0, 0.4);
  }
</style>
