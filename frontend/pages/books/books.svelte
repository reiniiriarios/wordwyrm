<script lang="ts">
  import { onMount } from "svelte";
  import AddBook from "./add.svelte";
  import SearchBook from "./search.svelte";
  import { Book } from "@data/book";
  import { catFilters, sortFilters, recentFilters, searchBooks } from "./sortBooks";
  import SortAscending from "phosphor-svelte/lib/SortAscending";
  import SortDescending from "phosphor-svelte/lib/SortDescending";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
  import FrameCorners from "phosphor-svelte/lib/FrameCorners";

  let allBooks: Book[] = [];
  let sortedBooks: Book[] = [];
  let currentSort: string = "";
  let currentSortReverse: boolean = false;
  let currentFilter: string = "";
  let currentRecent: string = "all";
  let currentSearch: string = "";
  let zoomLevel: string = "m";

  onMount(() => {
    if (!allBooks.length) {
      window.electronAPI.readAllBooks();
    }
  });

  window.electronAPI.receiveAllBooks((books: Book[]) => {
    allBooks = books;
    currentSort = "author";
    currentFilter = "all";
    currentSortReverse = false;
    sortedBooks = sortFilters.author.sort(allBooks, false);
  });

  function sortReverse() {
    currentSortReverse = !currentSortReverse;
    sortedBooks = sortedBooks.reverse();
  }

  function sortFilter(s: string) {
    currentSort = s;
    filter();
  }

  function catFilter(f: string) {
    currentFilter = f;
    filter();
  }

  function recentFilter(f: string) {
    currentRecent = f;
    filter();
  }

  function filter() {
    let books = currentSearch ? searchBooks(allBooks, currentSearch) : allBooks;
    sortedBooks = sortFilters[currentSort].sort(
      catFilters[currentFilter].filter(recentFilters[currentRecent].filter(structuredClone(books))),
      currentSortReverse,
    );
  }

  function searchFilter(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key)) {
      sortedBooks = sortFilters[currentSort].sort(
        catFilters[currentFilter].filter(searchBooks(allBooks, currentSearch)),
        currentSortReverse,
      );
    }
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Books</h2>
  <div class="pageNav__search">
    <MagnifyingGlass /><input type="text" bind:value={currentSearch} on:keydown={searchFilter} />
  </div>
  <div class="pageNav__actions">
    <AddBook />
    <SearchBook />
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
          <div class="bookComposite">
            <img
              src={`bookimage://${book.authorDir?.replace(/ /g, "%20")}/${book.filename.replace(/ /g, "%20")}.jpg`}
              alt=""
            />
            {#if !book.dateRead}
              <span class="unread">Unread</span>
            {/if}
          </div>
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
    --book-width: 20rem;
    --book-height: 30rem;

    &.zoomSmall {
      --book-width: 13rem;
      --book-height: 20rem;
    }

    &.zoomLarge {
      --book-width: 25rem;
      --book-height: 37rem;
    }

    width: var(--book-width);
    height: var(--book-height);
    display: flex;
    justify-content: center;
    align-items: center;

    &__inner {
      max-height: var(--book-height);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-decoration: none;
      color: $fgColor;

      &--image {
        max-width: calc(var(--book-width) - 1rem);

        .bookComposite {
          max-height: calc(var(--book-height) - 1rem);
          transition: 0.2s transform;
        }

        img {
          max-width: calc(var(--book-width) - 1rem);
          max-height: calc(var(--book-height) - 1rem);
        }

        &:hover .bookComposite {
          transform: scale(1.02);
        }
      }

      &--noimage {
        width: calc(var(--book-width) - 2rem);
        height: calc(var(--book-height) - 2rem);
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
    }
  }
</style>
