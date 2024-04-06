<script lang="ts">
  import { onMount } from "svelte";
  import SortAscending from "phosphor-svelte/lib/SortAscending";
  import SortDescending from "phosphor-svelte/lib/SortDescending";
  import FrameCorners from "phosphor-svelte/lib/FrameCorners";
  import { catFilters, sortFilters, recentFilters } from "@scripts/sortBooks";
  import { settings } from "@stores/settings";
  import { books } from "@stores/books";
  import Bookimage from "@components/bookimage.svelte";
  import Searchbar from "@components/searchbar.svelte";
  import AddBook from "./add.svelte";
  import SearchBook from "./search.svelte";

  let filterTags: string[] = [];
  $: filterTags = $settings.filterTags?.split(",").map((t) => t.trim());

  onMount(() => {
    console.log("mounted");
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
    <Searchbar />
  </div>
  <div class="pageNav__actions">
    <div class="zoom">
      <div class="resizeIcon">
        <FrameCorners size={22} />
      </div>
      <button on:click={() => zoom("s")} class:selected={$books.view.zoom === "s"}>S</button>
      <button on:click={() => zoom("m")} class:selected={$books.view.zoom === "m"}>M</button>
      <button on:click={() => zoom("l")} class:selected={$books.view.zoom === "l"}>L</button>
    </div>

    <AddBook />
    <SearchBook />
  </div>
</div>

<div class="listFilter">
  <div class="filter">
    <span>Sort:</span>
    {#each Object.entries(sortFilters) as [i, s]}
      {#if !s.hidden}
        <button on:click={() => books.sort(i)} class:selected={$books.filters.sort === i}>{s.name}</button>
      {/if}
    {/each}
    <button class="sortDirection" on:click={books.sortReverse}>
      {#if $books.filters.reverse}
        <SortDescending size={22} />
      {:else}
        <SortAscending size={22} />
      {/if}
    </button>
  </div>

  <div class="filter">
    <span>Filter:</span>
    <div class="customFilter">
      <button class="customFilter__selected">
        {#if filterTags && $books.filters.tag}
          {$books.filters.tag}
        {:else}
          {catFilters[$books.filters.filter].name}
        {/if}
      </button>
      <div class="customFilter__dropdown">
        {#each Object.entries(catFilters) as [i, f]}
          <button
            on:click={() => books.catFilter(i)}
            class="customFilter__opt"
            class:selected={$books.filters.filter === i}>{f.name}</button
          >
        {/each}
        {#if filterTags}
          {#each filterTags as tag}
            <button
              on:click={() => books.tagFilter(tag)}
              class="customFilter__opt"
              class:selected={$books.filters.tag === tag}>{tag}</button
            >
          {/each}
        {/if}
      </div>
    </div>
  </div>

  <div class="filter">
    <span>Read:</span>
    <div class="recentFilter">
      <button class="recentFilter__selected">
        {recentFilters[$books.filters.recent].name}
      </button>
      <div class="recentFilter__dropdown">
        {#each Object.entries(recentFilters) as [i, f]}
          <button
            on:click={() => books.recentFilter(i)}
            class="recentFilter__opt"
            class:selected={i === $books.filters.recent}>{f.name}</button
          >
        {/each}
      </div>
    </div>
  </div>

  <div class="filter filter--right">
    <div class="bookCount">
      {#if $books.allBooks.length > 0}
        {#if $books.sortedBooks.length < $books.allBooks.length}
          {$books.sortedBooks.length} <span class="bookCount__sep">/</span>
        {/if}
        <span class:mute={$books.sortedBooks.length < $books.allBooks.length}>{$books.allBooks.length}</span> Books
      {/if}
    </div>
  </div>
</div>

<div class="bookList">
  {#each $books.sortedBooks as book}
    <div class="book" class:zoomSmall={$books.view.zoom === "s"} class:zoomLarge={$books.view.zoom === "l"}>
      {#if book.images.hasImage}
        <a href={`#/book/${book.cache.filepath}`} class="book__inner book__inner--image">
          <Bookimage {book} overlay />
          {#if !book.dateRead}
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

  .bookCount {
    font-size: 1rem;

    &__sep {
      color: var(--fg-color-muted);
      opacity: 0.8;
    }

    .mute {
      color: var(--fg-color-muted);
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
  }
</style>
