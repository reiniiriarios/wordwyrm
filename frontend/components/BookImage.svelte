<script lang="ts">
  import BookImagePlaceholder from "@components/BookImagePlaceholder.svelte";

  export let book: Book;
  export let overlay: boolean = false;
  export let pageHeight: boolean = false;
  export let size: "xs" | "s" | "m" | "l" = "m";

  let src: string;
  $: src = book ? `bookimage://${book.cache.urlpath}.jpg?t=${book.images.imageUpdated ?? 0}` : "";
</script>

{#if book}
  {#key book.images.imageUpdated}
    {#if overlay}
      <div class="bookComposite" class:pageHeight>
        {#if book.images.hasImage}
          <img {src} alt="" loading="lazy" decoding="async" />
        {:else}
          <BookImagePlaceholder {book} {pageHeight} {size} />
        {/if}
      </div>
    {:else if book.images.hasImage}
      <img {src} alt="" loading="lazy" decoding="async" />
    {:else}
      <BookImagePlaceholder {book} {pageHeight} {size} />
    {/if}
  {/key}
{/if}

<style lang="scss">
  .bookComposite {
    position: relative;
    display: inline-block;
    max-height: var(--book-height, 100%);

    img {
      max-height: var(--book-height, 100%);
      max-width: 100%;
      display: block;
      box-shadow: var(--shadow-2) 0.14rem 0.14rem 0.6rem 0.2rem;
      border-radius: 2px;
    }

    &.pageHeight {
      max-height: 85vh;

      img {
        max-height: 85vh;
      }
    }

    &::after {
      content: "";
      display: inline-block;
      width: 100%;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      border-radius: 2px;
      background: linear-gradient(
          90deg,
          rgba(255 255 255 / 0%) 0%,
          rgba(255 255 255 / 10%) 2%,
          rgba(0 0 0 / 10%) 4%,
          rgba(255 255 255 / 0%) 8%
        ),
        radial-gradient(circle at 55% 35%, rgba(0 0 0 / 0%) 0%, rgba(0 0 0 / 20%) 100%),
        radial-gradient(circle at 55% 25%, rgba(255 255 255 / 10%) 0%, rgba(255 255 255 / 0%) 50%);
      box-shadow:
        inset rgba(255 255 255 / 60%) -0.25rem 0.25rem 0.4rem -0.4rem,
        inset rgba(0 0 0 / 100%) 0.15rem -0.15rem 0.6rem -0.3rem;
    }
  }
</style>
