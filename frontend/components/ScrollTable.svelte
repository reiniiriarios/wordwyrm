<script lang="ts">
  import { onMount, tick } from "svelte";

  let box: HTMLDivElement;
  let shadowTopOpacity: number = 0;
  let shadowBottomOpacity: number = 0;
  let shadowScalingFactor: number = 1;

  onMount(() => {
    tick().then(updateScroll);
    const resizeObserver = new ResizeObserver(updateScroll);
    resizeObserver.observe(box);
    return () => {
      resizeObserver.unobserve(box);
    };
  });

  /**
   * Amplify shadows at low percentages.
   *
   * @param {number} n [0-1] Value to scale
   * @param {number} x [0-1] Scaling factor (less is more)
   */
  const logScale = (n: number, x: number = 0.5) => n * ((x - Math.log10(n)) / x);

  export const updateScroll = (): void => {
    if (!box || box.offsetHeight >= box.scrollHeight) {
      shadowTopOpacity = 0;
      shadowBottomOpacity = 0;
    } else {
      shadowScalingFactor = Math.min(1, Math.max(0.5, (35000 - box.scrollHeight) / 35000));
      const percentScroll = box.scrollTop / (box.scrollHeight - box.offsetHeight);
      shadowTopOpacity = box.scrollTop === 0 ? 0 : logScale(percentScroll, shadowScalingFactor);
      shadowBottomOpacity = percentScroll === 1 ? 0 : logScale(1 - percentScroll, shadowScalingFactor);
    }
  };
</script>

<div class="scrollTable" bind:this={box} on:scroll={updateScroll}>
  <div class="scrollTable__shadow scrollTable__shadow--top" style:opacity={shadowTopOpacity}></div>
  <div class="scrollTable__shadow scrollTable__shadow--bottom" style:opacity={shadowBottomOpacity}></div>
  <table class="scrollTable__table">
    <thead class="scrollTable__head">
      <slot name="thead" />
    </thead>
    <tbody class="scrollTable__body">
      <slot name="tbody" />
    </tbody>
  </table>
</div>

<style lang="scss">
  .scrollTable {
    --shadow-height: 1.25rem;
    --head-height: 3rem;

    position: relative;
    z-index: 1;
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
      pointer-events: none;

      &--top {
        top: var(--head-height);
        background: radial-gradient(55% 1rem at top center, var(--shadow-5) 0%, transparent 100%);
      }

      &--bottom {
        top: calc(100% - var(--shadow-height));
        background: radial-gradient(55% 1rem at bottom center, var(--shadow-5) 0%, transparent 100%);
      }
    }

    &__table {
      position: relative;
      z-index: 2;
      width: 100%;
      border-spacing: 0;
      border-collapse: collapse;
      top: calc(var(--shadow-height) * -2);
      margin-bottom: calc(var(--shadow-height) * -2);
    }

    &__head {
      position: relative;
      z-index: 5;
      height: var(--head-height);

      :global(th) {
        font-size: 1rem;
        padding: 0.5rem 1rem;
        text-align: left;
        background-color: var(--c-base);
        position: sticky;
        top: 0;
        cursor: pointer;
        color: var(--c-text-muted);
        vertical-align: bottom;
        white-space: nowrap;

        &:hover {
          color: var(--c-text);
        }

        &:first-child {
          padding-left: 2rem;
        }

        &:last-child {
          padding-right: 2rem;
        }

        :global(&.selected) {
          color: var(--c-text);
        }
      }
    }

    &__body {
      position: relative;
      z-index: 3;

      :global(tr) {
        cursor: pointer;
        background-color: var(--c-table2-row);

        :global(td) {
          font-size: 1rem;
          padding: 0.5rem 1rem;

          &:first-child {
            padding-left: 2rem;
          }

          &:last-child {
            padding-right: 2rem;
          }
        }

        &:nth-child(odd) {
          background-color: var(--c-table2-row-alt);
        }

        &:hover :global(td) {
          background-color: var(--c-table2-hover);

          :global(.tag) {
            background-color: var(--c-table2-hover2);
            border-color: var(--c-table2-hover2);
          }
        }
      }
    }
  }
</style>
