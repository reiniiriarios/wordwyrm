<script lang="ts">
  import Prohibit from "phosphor-svelte/lib/Prohibit";

  export let rating: number = 0;
  export let editable: boolean = false;

  let showRating: number = 0;
  let hovering: boolean = false;

  function hoverStar(e: MouseEvent | FocusEvent) {
    if (editable) {
      const el = e.target as SVGSVGElement;
      showRating = +(el.dataset.i ?? 0);
      hovering = true;
    }
  }

  function unHoverStar(e: MouseEvent | FocusEvent) {
    if (editable) {
      hovering = false;
    }
  }

  function setStars(e: MouseEvent | KeyboardEvent) {
    if (editable) {
      const el = e.target as SVGSVGElement;
      rating = +(el.dataset.i ?? 0);
    }
  }
</script>

<div class="rating" class:editable>
  {#each Array(5) as _, i}
    <div
      class="star"
      class:full={rating > i}
      class:hover={editable && hovering && showRating > i}
      data-i={i + 1}
      role="button"
      tabindex="0"
      on:mouseenter={hoverStar}
      on:mouseleave={unHoverStar}
      on:focus={hoverStar}
      on:blur={unHoverStar}
      on:click={setStars}
      on:keypress={setStars}
    ></div>
  {/each}
  {#if editable}
    <div
      class="no"
      role="button"
      tabindex="0"
      data-i="0"
      on:mouseenter={hoverStar}
      on:mouseleave={unHoverStar}
      on:focus={hoverStar}
      on:blur={unHoverStar}
      on:click={setStars}
      on:keypress={setStars}
    >
      <Prohibit size="1.5rem" />
    </div>
  {/if}
</div>

<style lang="scss">
  @import "../style/variables";

  $starColor: #ffc400;
  $starNoColor: $bgColorLighter;
  $starHoverColor: $accentColor;

  .rating {
    display: flex;
    justify-content: left;
    align-items: center;
    width: 14rem;

    .star {
      height: 2rem;
      width: 2rem;
      background-color: $starNoColor;
      mask-image: url(star.svg);
      mask-mode: alpha;
      mask-size: 2rem 2rem;

      &.full {
        background-color: $starColor;
      }
    }

    &.editable {
      .star {
        cursor: pointer;

        &.hover,
        &:focus-visible {
          background-color: $accentColor;
        }
      }
    }

    .no {
      color: gray;
      height: 2rem;
      width: 2rem;
      padding: 0.25rem;
      cursor: pointer;
      visibility: hidden;

      &:hover,
      &:focus-visible {
        color: $starHoverColor;
      }
    }

    &:hover {
      .no {
        visibility: visible;
      }
    }
  }
</style>
