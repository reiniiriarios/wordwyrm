<script lang="ts">
  import { onMount } from "svelte";
  import AddBook from "./add.svelte";
  import SearchBook from "./search.svelte";
  import { Book } from "@data/book";
  import { catFilters, sortFilters, recentFilters, searchBooks, filterByTag } from "./sortBooks";
  import SortAscending from "phosphor-svelte/lib/SortAscending";
  import SortDescending from "phosphor-svelte/lib/SortDescending";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
  import FrameCorners from "phosphor-svelte/lib/FrameCorners";
  import Bookimage from "@components/bookimage.svelte";
  import { UserSettings } from "types/global";

  let allBooks: Book[] = [];
  let filteredBooks: Book[] = [];
  let searchedBooks: Book[] = [];
  let sortedBooks: Book[] = [];
  let currentSort: string = "author";
  let currentSortReverse: boolean = false;
  let currentFilter: string = "all";
  let currentTagFilter: string = "";
  let currentRecent: string = "all";
  let currentSearch: string = "";
  let zoomLevel: string = "m";
  let filterTags: string[] = [];
  $: filterTags = window.userSettings?.filterTags?.split(",").map((t) => t.trim());

  // -- Init --

  onMount(() => {
    if (!allBooks.length) {
      window.electronAPI.readAllBooks();
    }
  });

  window.electronAPI.settingsLoaded((loadedSettings: UserSettings) => {
    filterTags = loadedSettings.filterTags?.split(",").map((t) => t.trim());
  });

  window.electronAPI.receiveAllBooks((books: Book[]) => {
    currentSort = "author";
    currentFilter = "all";
    currentTagFilter = "";
    currentSortReverse = false;
    allBooks = books;
    filteredBooks = books;
    searchedBooks = books;
    sortedBooks = sortFilters.author.sort(books, false);
  });

  // -- Filter functions --

  function sort() {
    // sort what is already filtered, then searched through
    sortedBooks = sortFilters[currentSort].sort(structuredClone(searchedBooks), currentSortReverse);
  }

  function search() {
    // search through what is already filtered, then sort
    searchedBooks = searchBooks(structuredClone(filteredBooks), currentSearch);
    sort();
  }

  function filter() {
    // filter by recent first
    let books: Book[] = recentFilters[currentRecent].filter(structuredClone(allBooks));
    // then by either predefined filter or user tag filter
    if (currentFilter) {
      books = catFilters[currentFilter].filter(books);
    } else if (currentTagFilter) {
      books = filterByTag(books, currentTagFilter);
    }
    filteredBooks = books;
    // then search and sort
    search();
    sort();
  }

  // -- User action functions --

  function sortFilter(s: string) {
    currentSort = s;
    sort();
  }

  function sortReverse() {
    currentSortReverse = !currentSortReverse;
    sortedBooks = sortedBooks.reverse();
  }

  function searchFilter(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key)) {
      // currentSearch is bound
      search();
    }
  }

  function catFilter(f: string) {
    currentFilter = f;
    currentTagFilter = "";
    filter();
  }

  function tagFilter(tag: string) {
    currentFilter = "";
    currentTagFilter = tag;
    filter();
  }

  function recentFilter(f: string) {
    currentRecent = f;
    filter();
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Books</h2>
  <div class="pageNav__search">
    <MagnifyingGlass /><input type="text" bind:value={currentSearch} on:keydown={searchFilter} />
  </div>
  <div class="pageNav__actions">
    <AddBook />
    {#if window.userSettings.googleApiKey}
      <SearchBook />
    {/if}
  </div>
</div>

<div class="listFilter">
  <div class="filter">
    <span>Sort:</span>
    {#each Object.entries(sortFilters) as [i, s]}
      {#if !s.hidden}
        <button on:click={() => sortFilter(i)} class:selected={currentSort === i}>{s.name}</button>
      {/if}
    {/each}
    <button class="sortDirection" on:click={sortReverse}>
      {#if currentSortReverse}
        <SortDescending size={22} />
      {:else}
        <SortAscending size={22} />
      {/if}
    </button>
  </div>

  <div class="filter">
    <span>Filter:</span>
    {#each Object.entries(catFilters) as [i, f]}
      <button on:click={() => catFilter(i)} class:selected={currentFilter === i}>{f.name}</button>
    {/each}
    {#if filterTags}
      {#each filterTags as tag}
        <button on:click={() => tagFilter(tag)} class:selected={currentTagFilter === tag}>{tag}</button>
      {/each}
    {/if}
  </div>

  <div class="filter">
    <span>Read:</span>
    <div class="recentFilter">
      <button class="recentFilter__selected">
        {recentFilters[currentRecent].name}
      </button>
      <div class="recentFilter__dropdown">
        {#each Object.entries(recentFilters) as [i, f]}
          <button on:click={() => recentFilter(i)} class="recentFilter__opt" class:selected={i === currentRecent}
            >{f.name}</button
          >
        {/each}
      </div>
    </div>
  </div>

  <div class="filter filter--right">
    <div class="resizeIcon">
      <FrameCorners size={22} />
    </div>
    <button on:click={() => (zoomLevel = "s")} class:selected={zoomLevel === "s"}>S</button>
    <button on:click={() => (zoomLevel = "m")} class:selected={zoomLevel === "m"}>M</button>
    <button on:click={() => (zoomLevel = "l")} class:selected={zoomLevel === "l"}>L</button>
  </div>
</div>

<div class="bookList">
  {#each sortedBooks as book}
    <div class="book" class:zoomSmall={zoomLevel === "s"} class:zoomLarge={zoomLevel === "l"}>
      {#if book.hasImage}
        <a href={`#/book/${book.authorDir}/${book.filename}`} class="book__inner book__inner--image">
          <Bookimage {book} overlay />
          {#if !book.dateRead}
            <span class="unread">Unread</span>
          {/if}
        </a>
      {:else}
        <a href={`#/book/${book.authorDir}/${book.filename}`} class="book__inner book__inner--noimage">
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

  .resizeIcon {
    color: $fgColorMuted;
    opacity: 0.8;
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
    height: calc(100vh - $pageNavHeight - $filterHeight);
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
