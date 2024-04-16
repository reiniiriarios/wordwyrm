<script lang="ts">
  import { onMount } from "svelte";
  import ArrowUp from "phosphor-svelte/lib/ArrowFatLineUp";

  export let arrows: boolean = false;
  let show: boolean = false;

  onMount(() => {
    // Create an artificial delay to wait for settings and/or books to load.
    const timer = setTimeout(() => (show = true), 125);
    return () => clearTimeout(timer);
  });
</script>

{#if arrows}
  <div class="arrows" class:show>
    <ArrowUp size="9rem" />
    <ArrowUp size="9rem" />
  </div>
{/if}
<div class="gettingstarted" class:show>
  <h2>Get Started</h2>
  <p>Add books manually or by search.</p>
</div>

<style lang="scss">
  .arrows {
    z-index: 0;
    text-align: right;
    position: absolute;
    top: 3rem;
    right: 1rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.5s ease;

    &.show {
      opacity: 0.25;
    }
  }

  .gettingstarted {
    position: relative;
    z-index: 1;
    font-size: 1rem;
    padding: 2rem;
    max-width: 45rem;
    margin: 0 auto;
    opacity: 0;
    transition: opacity 0.5s ease;

    h2 {
      font-size: 1.5rem;
    }

    &.show {
      opacity: 1;
    }
  }
</style>
