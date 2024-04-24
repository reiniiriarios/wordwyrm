<script lang="ts">
  import Info from "phosphor-svelte/lib/Info";

  export let details: string = "";
  export let position: "top" | "right" | "bottom" | "left" = "right";

  let visible: boolean = false;
  let timer: NodeJS.Timeout;

  function show() {
    visible = true;
    if (timer) {
      clearTimeout(timer);
    }
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
      cursor: help;

      // fix alignment to text
      display: inline-block;
      vertical-align: top;
      margin-bottom: -0.1rem;
    }

    .details {
      display: none;
      background-color: var(--c-overlay);
      box-shadow: 0.125rem 0.125rem 0.4rem 0 var(--shadow-4);
      padding: 1rem 1.25rem 1rem 2.5rem;
      position: absolute;
      inset: -0.85rem auto auto 1.5rem;
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
        inset: auto auto 1.25rem -9.5rem;
      }
    }

    &--right {
      .details {
        inset: -0.85rem auto auto 1.5rem;
      }
    }

    &--bottom {
      .details {
        inset: 1.25rem auto auto -9.5rem;
      }
    }

    &--left {
      .details {
        inset: -0.85rem 1.5rem auto auto;
      }
    }
  }
</style>
