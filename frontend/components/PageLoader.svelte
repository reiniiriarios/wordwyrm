<script lang="ts">
  import { onMount } from "svelte";
  import Spinner from "@components/Spinner.svelte";

  export let loading: boolean = true;
  export let spinnerDelay: number = 25;
  export let timeout: number = 5000;
  export let interval: number = 25;

  let time = 0;

  onMount(() => {
    const loadingInterval = setInterval(() => {
      if (loading) {
        time += interval;
      } else {
        time = 0;
        clearInterval(loadingInterval);
      }
    }, interval);
    return () => clearInterval(loadingInterval);
  });
</script>

{#if loading}
  <div class="spinner">
    <div class="spinner__icon" aria-hidden={time < spinnerDelay}>
      <Spinner size="10rem" />
    </div>
    <div class="spinner__msg" aria-hidden={time < timeout}>
      This is taking a while. There may be an issue with your settings or data.
    </div>
  </div>
{:else}
  <slot />
{/if}

<style lang="scss">
  .spinner {
    width: 100%;
    height: calc(100vh - var(--page-nav-height) - var(--filter-height));
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 2rem;

    &__icon {
      transition: opacity 0.3s linear;
      color: var(--c-text-muted);

      &[aria-hidden="true"] {
        opacity: 0;
        pointer-events: none;
      }

      &[aria-hidden="false"] {
        opacity: 1;
      }
    }

    &__msg {
      transition: opacity 0.2s linear;
      font-size: 1.1rem;

      &[aria-hidden="true"] {
        opacity: 0;
        pointer-events: none;
      }

      &[aria-hidden="false"] {
        opacity: 1;
      }
    }
  }
</style>
