<script lang="ts">
  import { onMount } from "svelte";
  import AddBook from "./add.svelte";
  import SearchBook from "./search.svelte";
  import { catFilters, sortFilters, recentFilters, searchBooks, filterByTag } from "./sortBooks";
  import SortAscending from "phosphor-svelte/lib/SortAscending";
  import SortDescending from "phosphor-svelte/lib/SortDescending";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
  import FrameCorners from "phosphor-svelte/lib/FrameCorners";
  import X from "phosphor-svelte/lib/X";
  import Bookimage from "@components/bookimage.svelte";
  import { settings } from "@stores/settings";
  import { appState } from "@stores/appState";

  let allBooks: Book[] = [];
  let filteredBooks: Book[] = [];
  let searchedBooks: Book[] = [];
  let sortedBooks: Book[] = [];
  let filterTags: string[] = [];
  $: filterTags = $settings.filterTags?.split(",").map((t) => t.trim());

  // -- Init --

  onMount(() => {
    console.log("mounted");
    if (!allBooks.length) {
      console.log("sending for books");
      window.electronAPI.readAllBooks();
    }

    const removeReceiveListener = window.electronAPI.receiveAllBooks((books: Book[]) => {
      console.log("received");
      allBooks = books;
      filteredBooks = books;
      searchedBooks = books;
      filter();
    });

    return () => {
      removeReceiveListener();
    };
  });

  // -- Filter functions --

  function sort() {
    console.log("sorting");
    // sort what is already filtered, then searched through
    sortedBooks = sortFilters[$appState.books.sort].sort(structuredClone(searchedBooks), $appState.books.reverse);
  }

  function search() {
    console.log("searching");
    // search through what is already filtered, then sort
    searchedBooks = searchBooks(structuredClone(filteredBooks), $appState.books.search);
    sort();
  }

  function filter() {
    console.log("filtering");
    // filter by recent first
    let books: Book[] = recentFilters[$appState.books.recent].filter(structuredClone(allBooks));
    // then by either predefined filter or user tag filter
    if ($appState.books.filter) {
      books = catFilters[$appState.books.filter].filter(books);
    } else if ($appState.books.tag) {
      books = filterByTag(books, $appState.books.tag);
    }
    filteredBooks = books;
    // then search and sort
    search();
    sort();
  }

  // -- User action functions --

  function sortFilter(s: string) {
    $appState.books.sort = s;
    sort();
  }

  function sortReverse() {
    $appState.books.reverse = !$appState.books.reverse;
    sortedBooks = sortedBooks.reverse();
  }

  function searchFilter(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key)) {
      // currentSearch is bound
      search();
    }
  }

  function clearSearch() {
    $appState.books.search = "";
    searchedBooks = structuredClone(filteredBooks);
    sort();
  }

  function catFilter(f: string) {
    $appState.books.filter = f;
    $appState.books.tag = "";
    filter();
  }

  function tagFilter(tag: string) {
    $appState.books.filter = "";
    $appState.books.tag = tag;
    filter();
  }

  function recentFilter(f: string) {
    $appState.books.recent = f;
    filter();
  }

  function zoom(z: string) {
    $appState.books.zoom = z;
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Books</h2>
  <div class="pageNav__search">
    <span class="glass">
      <MagnifyingGlass />
    </span>
    <input type="text" bind:value={$appState.books.search} on:keydown={searchFilter} on:change={search} />
    {#if $appState.books.search.length}
      <div class="x" role="button" tabindex="0" on:click={clearSearch} on:keypress={clearSearch}>
        <X />
      </div>
    {/if}
  </div>
  <div class="pageNav__actions">
    <div class="zoom">
      <div class="resizeIcon">
        <FrameCorners size={22} />
      </div>
      <button on:click={() => zoom("s")} class:selected={$appState.books.zoom === "s"}>S</button>
      <button on:click={() => zoom("m")} class:selected={$appState.books.zoom === "m"}>M</button>
      <button on:click={() => zoom("l")} class:selected={$appState.books.zoom === "l"}>L</button>
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
        <button on:click={() => sortFilter(i)} class:selected={$appState.books.sort === i}>{s.name}</button>
      {/if}
    {/each}
    <button class="sortDirection" on:click={sortReverse}>
      {#if $appState.books.reverse}
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
        {#if filterTags && $appState.books.tag}
          {$appState.books.tag}
        {:else}
          {catFilters[$appState.books.filter].name}
        {/if}
      </button>
      <div class="customFilter__dropdown">
        {#each Object.entries(catFilters) as [i, f]}
          <button on:click={() => catFilter(i)} class="customFilter__opt" class:selected={$appState.books.filter === i}
            >{f.name}</button
          >
        {/each}
        {#if filterTags}
          {#each filterTags as tag}
            <button
              on:click={() => tagFilter(tag)}
              class="customFilter__opt"
              class:selected={$appState.books.tag === tag}>{tag}</button
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
        {recentFilters[$appState.books.recent].name}
      </button>
      <div class="recentFilter__dropdown">
        {#each Object.entries(recentFilters) as [i, f]}
          <button
            on:click={() => recentFilter(i)}
            class="recentFilter__opt"
            class:selected={i === $appState.books.recent}>{f.name}</button
          >
        {/each}
      </div>
    </div>
  </div>

  <div class="filter filter--right">
    <div class="bookCount">
      {#if allBooks.length > 0}
        {#if sortedBooks.length < allBooks.length}
          {sortedBooks.length} <span class="bookCount__sep">/</span>
        {/if}
        <span class:mute={sortedBooks.length < allBooks.length}>{allBooks.length}</span> Books
      {/if}
    </div>
  </div>
</div>

<div class="bookList">
  {#each sortedBooks as book}
    <div class="book" class:zoomSmall={$appState.books.zoom === "s"} class:zoomLarge={$appState.books.zoom === "l"}>
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
  @import "../../style/variables";

  .zoom {
    display: flex;
    align-items: center;
    justify-content: left;
    gap: 0.25rem;
    margin-right: 2rem;

    .resizeIcon {
      color: $fgColorMuted;
      opacity: 0.8;
    }

    button {
      background-color: $bgColorLight;
      color: $fgColor;
      padding: 0.25rem 0.5rem;
      border: 0;
      border-radius: 0.25rem;
      cursor: pointer;
      font-size: 0.75rem;

      &.selected {
        background-color: $bgColorLighter;
      }
    }
  }

  .bookCount {
    font-size: 1rem;

    &__sep {
      color: $fgColorMuted;
      opacity: 0.8;
    }

    .mute {
      color: $fgColorMuted;
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
    height: calc(100vh - $pageNavHeight - var(--filter-height));
    scrollbar-width: thin;
    scrollbar-color: $bgColorLightest transparent;
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
      color: $fgColor;

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
        background-color: $bgColorLightest;
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
