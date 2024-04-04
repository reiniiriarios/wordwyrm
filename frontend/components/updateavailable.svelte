<script lang="ts">
  import { onMount } from "svelte";

  export let latestVersion: string = "";

  let show: boolean = true;

  onMount(() => {
    setTimeout(() => (show = false), 30000);
  });
</script>

{#if show}
  <div class="update">
    Update Available: <a href="https://github.com/reiniiriarios/book-tracker/releases/latest" target="_blank">
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
  @import "../style/variables";

  .update {
    position: absolute;
    bottom: 0;
    right: 0;
    font-size: 0.9rem;
    padding: 0.25rem 0.5rem;
    background-color: $bgColorLight;
    border-top-left-radius: 0.25rem;
    box-shadow: 0 0 0.5rem 0.25rem rgba(0, 0, 0, 0.4);
  }
</style>
