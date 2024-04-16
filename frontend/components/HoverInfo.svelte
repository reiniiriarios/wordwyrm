<script lang="ts">
  import Info from "phosphor-svelte/lib/Info";

  export let details: string = "";
  export let position: "top" | "right" | "bottom" | "left" = "right";

  let visible: boolean = false;
  let timer: NodeJS.Timeout;

  function show() {
    visible = true;
    if (timer) clearTimeout(timer);
  }

  function hide() {
    timer = setTimeout(() => (visible = false), 400);
  }
</script>

<span role="tooltip" class="info info--{position}" on:mouseenter={show} on:mouseleave={hide}>
  <span class="icon"><Info /></span>
  <div class="details" class:visible>
    <span class="bg"><Info size="3rem" /></span>
    <span class="text">{details}</span>
  </div>
</span>

<style lang="scss">
  .info {
    position: relative;

    .icon {
      position: relative;
      top: 0.1rem;
      cursor: help;
    }

    .details {
      display: none;
      background-color: var(--c-overlay);
      box-shadow: 0.125rem 0.125rem 0.4rem 0 rgba(0, 0, 0, 0.5);
      padding: 1rem 1.25rem 1rem 2.5rem;
      position: absolute;
      top: -0.85rem;
      left: 1.5rem;
      width: 20rem;
      overflow: hidden;
      contain: paint;
      z-index: 5;

      .bg {
        opacity: 0.2;
        z-index: 6;
        position: absolute;
        top: -0.6rem;
        left: -0.6rem;
      }

      .text {
        z-index: 7;
      }

      &.visible {
        display: block;
      }
    }

    &--top {
      .details {
        top: auto;
        right: auto;
        bottom: 1.25rem;
        left: -9.5rem;
      }
    }

    &--right {
      .details {
        top: -0.85rem;
        right: auto;
        bottom: auto;
        left: 1.5rem;
      }
    }

    &--bottom {
      .details {
        top: 1.25rem;
        right: auto;
        bottom: auto;
        left: -9.5rem;
      }
    }

    &--left {
      .details {
        top: -0.85rem;
        right: 1.5rem;
        bottom: auto;
        left: auto;
      }
    }
  }
</style>
