<script lang="ts">
  import { onMount } from "svelte";
  import FrameCorners from "phosphor-svelte/lib/FrameCorners";

  import FilterSort from "@components/FilterSort.svelte";
  import FilterCats from "@components/FilterCats.svelte";
  import FilterRead from "@components/FilterRead.svelte";
  import BookCount from "@components/BookCount.svelte";
  import Bookimage from "@components/BookImage.svelte";
  import SearchBar from "@components/SearchBar.svelte";
  import Rating from "@components/Rating.svelte";
  import GettingStarted from "@components/GettingStarted.svelte";
  import AddBook from "@components/AddBook.svelte";
  import SearchApi from "@components/SearchApi.svelte";
  import { settings } from "@stores/settings";
  import { books } from "@stores/books";
  import { catFilters, sortFilters, recentFilters } from "@scripts/sortBooks";

  onMount(() => {
    if (!$books.allBooks.length) {
      console.log("sending for books");
      books.fetch();
    }
  });

  function zoom(z: "s" | "m" | "l") {
    $books.view.zoom = z;
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Books</h2>
  <div class="pageNav__search">
    {#if $books.allBooks.length}
      <SearchBar />
    {/if}
  </div>
  <div class="pageNav__actions">
    {#if $books.allBooks.length}
      <div class="zoom">
        <div class="resizeIcon">
          <FrameCorners size={22} />
        </div>
        <button on:click={() => zoom("s")} class:selected={$books.view.zoom === "s"}>S</button>
        <button on:click={() => zoom("m")} class:selected={$books.view.zoom === "m"}>M</button>
        <button on:click={() => zoom("l")} class:selected={$books.view.zoom === "l"}>L</button>
      </div>
    {/if}

    {#if $settings.booksDir}
      <AddBook />
      <SearchApi />
    {/if}
  </div>
</div>

{#if $books.allBooks.length}
  <div class="listFilter">
    <FilterSort />
    <FilterCats />
    <FilterRead />
    <div class="filter filter--right">
      <BookCount />
    </div>
  </div>

  <div class="bookList">
    {#each $books.sortedBooks as book}
      <div class="book" class:zoomSmall={$books.view.zoom === "s"} class:zoomLarge={$books.view.zoom === "l"}>
        {#if book.images.hasImage}
          <a href={`#/book/${book.cache.filepath}`} class="book__inner book__inner--image">
            <Bookimage {book} overlay />
            {#if $books.filters.sort === "rating"}
              {#if book.rating}
                <span class="book__rating">
                  <Rating rating={book.rating} />
                </span>
              {/if}
            {:else if !book.dateRead}
              <span class="unread">Unread</span>
            {/if}
          </a>
        {:else}
          <a href={`#/book/${book.cache.filepath}`} class="book__inner book__inner--noimage">
            <span>{book.title}</span>
            <span>by</span>
            <span>{book.authors.map((a) => a.name).join(", ")}</span>
          </a>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <GettingStarted />
{/if}

<style lang="scss">
  .zoom {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 0.25rem;
    margin-right: 2rem;

    .resizeIcon {
      color: var(--fg-color-muted);
      opacity: 0.8;
    }

    button {
      background-color: var(--bg-color-light);
      color: var(--fg-color);
      padding: 0.25rem 0.5rem;
      border: 0;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.75rem;

      &.selected {
        background-color: var(--bg-color-lighter);
      }
    }
  }

  .bookList {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.5rem 1rem 1.25rem;
    overflow-y: auto;
    width: 100%;
    height: calc(100vh - var(--page-nav-height) - var(--filter-height));
    scrollbar-width: thin;
    scrollbar-color: var(--bg-color-lightest) transparent;
  }

  .book {
    --book-width: 19rem;
    --book-height: 29rem;

    &.zoomSmall {
      --book-width: 12rem;
      --book-height: 18rem;
    }

    &.zoomLarge {
      --book-width: 24rem;
      --book-height: 36rem;
    }

    width: calc(var(--book-width) + 1rem);
    height: calc(var(--book-height) + 1rem);
    display: flex;
    justify-content: center;
    align-items: center;

    &__inner {
      position: relative;
      cursor: pointer;
      text-decoration: none;
      color: var(--fg-color);

      &--image {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--book-width);
        height: var(--book-height);
        transition: 0.2s transform;

        &:hover {
          transform: scale(1.02);
        }
      }

      &--noimage {
        width: calc(var(--book-width) - 1rem);
        height: calc(var(--book-height) - 1rem);
        background-color: var(--bg-color-lightest);
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: 0.2s transform;

        &:hover {
          transform: scale(1.02);
        }
      }

      .unread {
        position: absolute;
        bottom: -0.45rem;
        right: -0.45rem;
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        background: linear-gradient(0deg, rgb(5, 140, 8) 0%, rgb(10, 160, 15) 100%);
        box-shadow: rgb(0, 0, 0, 0.3) 0.05rem 0.05rem 0.5rem 0.2rem;
        z-index: 20;
      }
    }

    &__rating {
      position: absolute;
      width: 10rem;
      overflow: hidden;
      bottom: -0.5rem;
      right: -0.75rem;
      z-index: 20;
      filter: drop-shadow(0.05rem 0.05rem 0.25rem rgba(0, 0, 0, 0.33));
    }
  }
</style>