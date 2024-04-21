<script lang="ts">
  import { onMount, tick } from "svelte";

  let box: HTMLDivElement;
  let shadowTopOpacity: number = 0;
  let shadowBottomOpacity: number = 0;

  onMount(() => {
    tick().then(updateScroll);
    window.addEventListener("resize", updateScroll);
    return () => {
      window.removeEventListener("resize", updateScroll);
    };
  });

  export function updateScroll(): void {
    if (box.offsetHeight >= box.scrollHeight) {
      shadowTopOpacity = 0;
      shadowBottomOpacity = 0;
    } else {
      const currentScroll = box.scrollTop / (box.scrollHeight - box.offsetHeight);
      shadowTopOpacity = currentScroll;
      shadowBottomOpacity = 1 - currentScroll;
    }
  }
</script>

<div class="scrollBox" bind:this={box} on:scroll={updateScroll}>
  <div class="scrollBox__shadow scrollBox__shadow--top" style:opacity={shadowTopOpacity}></div>
  <div class="scrollBox__shadow scrollBox__shadow--bottom" style:opacity={shadowBottomOpacity}></div>
  <div class="scrollBox__content">
    <slot />
  </div>
</div>

<style lang="scss">
  .scrollBox {
    --shadow-height: 1.25rem;

    position: relative;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--c-subtle) transparent;

    &__shadow {
      position: sticky;
      left: 0;
      z-index: 100;
      width: 100%;
      height: var(--shadow-height);
      transition: opacity 0.05s linear;

      &--top {
        top: 0;
        background: radial-gradient(55% 1rem at top center, rgba(0 0 0 / 67%) 0%, transparent 100%);
      }

      &--bottom {
        top: calc(100% - var(--shadow-height));
        background: radial-gradient(55% 1rem at bottom center, rgba(0 0 0 / 67%) 0%, transparent 100%);
      }
    }

    &__content {
      position: relative;
      top: calc(var(--shadow-height) * -2);
      margin-bottom: calc(var(--shadow-height) * -2);
    }
  }
</style>
