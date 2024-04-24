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

  function unHoverStar(_e: MouseEvent | FocusEvent) {
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

<div class="rating" role={editable ? undefined : "img"} aria-label={`Rating: ${rating} out of 5 stars`} class:editable>
  {#each Array(5) as _, i}
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div
      class="star"
      class:full={!hovering && rating > i}
      class:hover={editable && hovering && showRating > i}
      role={editable ? "radio" : undefined}
      aria-label={editable ? `Set rating to ${i} out of 5 stars` : undefined}
      tabindex={editable ? 0 : -1}
      data-i={i + 1}
      on:mouseenter={hoverStar}
      on:mouseleave={unHoverStar}
      on:focus={hoverStar}
      on:blur={unHoverStar}
      on:click={setStars}
      on:keypress={setStars}
    ></div>
  {/each}
  {#if editable}
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <div
      class="no"
      aria-label={editable ? "Clear rating" : undefined}
      aria-hidden={!editable}
      role={editable ? "radio" : undefined}
      tabindex={editable ? 0 : -1}
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
  .rating {
    display: flex;
    justify-content: left;
    align-items: center;
    width: 14rem;

    .star {
      height: 2rem;
      width: 2rem;
      background-color: var(--c-muted);
      mask-image: url("star.svg");
      mask-mode: alpha;
      mask-size: 2rem 2rem;

      &.full {
        background-color: var(--c-rating);
      }
    }

    &.editable {
      .star {
        cursor: pointer;

        &.hover,
        &:focus-visible {
          background-color: var(--c-focus);
        }
      }
    }

    .no {
      color: var(--c-muted);
      height: 2rem;
      width: 2rem;
      padding: 0.25rem;
      cursor: pointer;
      opacity: 0;

      &:hover,
      &:focus-visible {
        color: var(--c-focus);
        opacity: 1;
        outline: 0;
      }
    }

    &:hover,
    &:focus-within {
      .no {
        opacity: 1;
      }
    }
  }
</style>
