<script lang="ts">
  export let book: Book;
  export let size: "xs" | "s" | "m" | "l" = "m";
  export let pageHeight: boolean = false;
</script>

<svg class="bookPlaceholder" class:pageHeight viewBox="0 0 20 30" xmlns="http://www.w3.org/2000/svg">
  <filter id="noise" x="0" y="0">
    <feTurbulence type="fractalNoise" baseFrequency="20.75" stitchTiles="stitch" />
  </filter>
  <rect x="0" width="20" height="30" />
  <path d="M2 2 18 2 18 28 2 28 2 2M3 3 3 27 17 27 17 3 3 3Z" />
  <rect width="20" height="30" filter="url(#noise)" opacity="0.08" />
</svg>
<div class="bookPlaceholder__text" class:pageHeight>
  <span class="bookPlaceholder__title" class:xs={size === "xs"} class:s={size === "s"} class:l={size === "l"}
    >{book.title}</span
  >
  <span class="bookPlaceholder__by" class:xs={size === "xs"} class:s={size === "s"} class:l={size === "l"}>by</span>
  <span class="bookPlaceholder__author" class:xs={size === "xs"} class:s={size === "s"} class:l={size === "l"}
    >{book.authors.map((a) => a.name).join(", ")}</span
  >
</div>

<style lang="scss">
  .bookPlaceholder {
    width: var(--book-width, 100%);
    display: block;
    box-shadow: rgb(0, 0, 0, 0.3) 0.14rem 0.14rem 0.6rem 0.2rem;
    border-radius: 2px;

    rect {
      fill: var(--c-book, #8d2f2e);
    }

    path {
      fill: var(--c-book-border, #402222);
    }

    &__text {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 20% 20% 25% 20%;
      justify-content: center;
      align-items: center;
      color: var(--c-book-text);

      span {
        text-align: center;
      }
    }

    &__title {
      font-size: 1.25rem;
      opacity: 0.8;

      &.l {
        font-size: 1.4rem;
      }

      &.s {
        font-size: 1rem;
      }

      &.xs {
        font-size: 0.8rem;
        line-height: 98%;
      }
    }

    &__by {
      font-size: 1rem;
      margin: 0.5rem;
      opacity: 0.6;

      &.l {
        font-size: 1.2rem;
      }

      &.s {
        font-size: 0.8rem;
        margin: 0.3rem;
      }

      &.xs {
        font-size: 0.6rem;
        margin: 0.2rem;
      }
    }

    &__author {
      font-size: 1.25rem;
      opacity: 0.8;

      &.l {
        font-size: 1.4rem;
      }

      &.s {
        font-size: 1rem;
      }

      &.xs {
        font-size: 0.8rem;
        line-height: 98%;
      }
    }
  }

  .pageHeight {
    &.bookPlaceholder {
      width: 30vw;
      max-height: 85vh;

      @media (min-aspect-ratio: 7/4) {
        width: 50vh;
        height: 75vh;
      }
    }

    .bookPlaceholder__title {
      font-size: 2vw;
    }

    .bookPlaceholder__by {
      font-size: 1.5vw;
    }

    .bookPlaceholder__author {
      font-size: 2vw;
    }

    @media (min-aspect-ratio: 7/4) {
      .bookPlaceholder__title {
        font-size: 3.5vh;
      }

      .bookPlaceholder__by {
        font-size: 2.5vh;
      }

      .bookPlaceholder__author {
        font-size: 3.5vh;
      }
    }
  }
</style>
