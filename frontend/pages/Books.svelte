<script lang="ts">
  import { onMount } from "svelte";
  import FrameCorners from "phosphor-svelte/lib/FrameCorners";

  import FilterSort from "@components/FilterSort.svelte";
  import FilterCats from "@components/FilterCats.svelte";
  import FilterRead from "@components/FilterRead.svelte";
  import BookCount from "@components/BookCount.svelte";
  import BookImage from "@components/BookImage.svelte";
  import SearchBar from "@components/SearchBar.svelte";
  import GettingStarted from "@components/GettingStarted.svelte";
  import AddBook from "@components/AddBook.svelte";
  import SearchApi from "@components/SearchApi.svelte";
  import ScrollBox from "@components/ScrollBox.svelte";
  import PageLoader from "@components/PageLoader.svelte";

  import { books } from "@stores/books";

  onMount(() => {
    if (!$books.allBooks.length) {
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
        <button class="zoom__btn zoom__btn--s" on:click={() => zoom("s")} class:selected={$books.view.zoom === "s"}>
          S
        </button>
        <button class="zoom__btn zoom__btn--m" on:click={() => zoom("m")} class:selected={$books.view.zoom === "m"}>
          M
        </button>
        <button class="zoom__btn zoom__btn--l" on:click={() => zoom("l")} class:selected={$books.view.zoom === "l"}>
          L
        </button>
      </div>
    {/if}

    <AddBook />
    <SearchApi />
  </div>
</div>

<PageLoader loading={!$books.fetched}>
  {#if $books.allBooks.length}
    <div class="listFilter">
      <FilterSort />
      <FilterCats />
      <FilterRead />
      <div class="filter filter--right">
        <BookCount />
      </div>
    </div>
    <div class="bookListContainer">
      <ScrollBox>
        <div class="bookList">
          {#each $books.sortedBooks as book}
            <div class="book" class:zoomSmall={$books.view.zoom === "s"} class:zoomLarge={$books.view.zoom === "l"}>
              <a href={`#/book/${book.cache.filepath}`} class="book__inner">
                <BookImage
                  {book}
                  overlay
                  size={$books.view.zoom}
                  showRating={$books.filters.sort === "rating"}
                  showUnread
                />
              </a>
            </div>
          {/each}
        </div>
      </ScrollBox>
    </div>
  {:else}
    <GettingStarted arrows />
  {/if}
</PageLoader>

<style lang="scss">
  .listFilter {
    position: relative;
    z-index: 51;
    box-shadow: 0 1rem 1rem -1rem var(--shadow-1);
  }

  .zoom {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 0.25rem;
    margin-right: 2rem;

    .resizeIcon {
      color: var(--c-text-muted);
      opacity: 0.8;
    }

    button {
      background-color: var(--c-button);
      border: 1px solid var(--c-button-border, var(--c-button));
      color: var(--c-text);
      padding: 0.24rem 0.49rem;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.75rem;

      &:hover {
        background-color: var(--c-button-hover);
        border: 1px solid var(--c-button-hover-border, var(--c-button-hover));
      }

      &.selected {
        background-color: var(--c-button-active, var(--c-button-hover));
        border: 1px solid
          var(--c-button-active-border, var(--c-button-active, var(--c-button-hover-border, var(--c-button-hover))));
      }
    }
  }

  .bookListContainer {
    background-color: var(--c-sub);
    height: calc(100vh - var(--page-nav-height) - var(--filter-height));
  }

  .bookList {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    padding: 0.75rem 1rem 1.25rem;
    width: 100%;
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
      color: var(--c-text);
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
  }
</style>
