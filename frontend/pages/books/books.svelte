<script lang="ts">
  import { onMount } from "svelte";
  import AddBook from "./add.svelte";
  import SearchBook from "./search.svelte";
  import { Book } from "@data/book";
  import { catFilters, sortFilters } from "./sortBooks";
  import SortAscending from "phosphor-svelte/lib/SortAscending";
  import SortDescending from "phosphor-svelte/lib/SortDescending";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";

  let allBooks: Book[] = [];
  let sortedBooks: Book[] = [];
  let currentSort: string = "";
  let currentSortReverse: boolean = false;
  let currentFilter: string = "";
  let currentSearch: string = "";

  function readBooks() {
    window.electronAPI.readAllBooks();
  }

  onMount(() => {
    if (!allBooks.length) {
      readBooks();
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
    let books = currentSearch ? searchBooks(allBooks) : allBooks;
    sortedBooks = catFilters[currentFilter].filter(sortFilters[s].sort(structuredClone(books), currentSortReverse));
  }

  function catFilter(f: string) {
    currentFilter = f;
    let books = currentSearch ? searchBooks(allBooks) : allBooks;
    sortedBooks = sortFilters[currentSort].sort(catFilters[f].filter(structuredClone(books)), currentSortReverse);
  }

  function searchBooks(books: Book[]): Book[] {
    if (!currentSearch) return books;
    return structuredClone(books).filter((b) => {
      return (
        b.title.toLowerCase().includes(currentSearch.toLowerCase()) ||
        b.authors
          .map((a) => a.name)
          .join(",")
          .toLowerCase()
          .includes(currentSearch.toLowerCase())
      );
    });
  }

  function searchFilter(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key)) {
      sortedBooks = sortFilters[currentSort].sort(
        catFilters[currentFilter].filter(searchBooks(allBooks)),
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
      <button on:click={() => sortFilter(i)} class:selected={currentSort === i}>{s.name}</button>
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
</div>
<div class="bookList">
  {#each sortedBooks as book}
    <div class="book">
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

  $filterHeight: 3rem;

  .listFilter {
    height: $filterHeight;
    padding: 0.5rem 1rem 1.25rem;
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: left;

    .filter {
      display: flex;
      align-items: center;
      justify-content: left;
      gap: 0.25rem;

      button {
        background-color: $bgColorLight;
        color: $fgColor;
        padding: 0.25rem 0.5rem;
        border: 0;
        border-radius: 0.25rem;
        cursor: pointer;

        &.selected {
          background-color: $bgColorLighter;
        }

        &.sortDirection {
          padding: 0;
          background: none;
        }
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
    height: calc(100vh - $pageNavHeight - $filterHeight);
    scrollbar-width: thin;
    scrollbar-color: $bgColorLightest transparent;
  }

  .book {
    width: 20rem;
    height: 30rem;
    display: flex;
    justify-content: center;
    align-items: center;

    &__inner {
      max-height: 30rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-decoration: none;
      color: $fgColor;

      &--image {
        max-width: 19rem;

        .bookComposite {
          max-height: 29rem;
          transition: 0.2s transform;
        }

        img {
          max-width: 19rem;
          max-height: 29rem;
        }

        &:hover .bookComposite {
          transform: scale(1.02);
        }
      }

      &--noimage {
        width: 18rem;
        height: 28rem;
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
