<script lang="ts">
  import { onMount } from "svelte";
  import { catFilters, recentFilters, searchBooks, sortFilters } from "@pages/books/sortBooks";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
  import CaretUp from "phosphor-svelte/lib/CaretUp";
  import CaretDown from "phosphor-svelte/lib/CaretDown";
  import { push } from "svelte-spa-router";

  let allBooks: Book[] = [];
  let filteredBooks: Book[] = [];
  let searchedBooks: Book[] = [];
  let sortedBooks: Book[] = [];
  let currentSort: string = "author";
  let currentSortReverse: boolean = false;
  let currentFilter: string = "all";
  let currentRecent: string = "all";
  let currentSearch: string = "";

  // -- Init --

  onMount(() => {
    if (!allBooks.length) {
      window.electronAPI.readAllBooks();
    }

    const removeReceiveListener = window.electronAPI.receiveAllBooks((books: Book[]) => {
      currentSort = "author";
      currentFilter = "all";
      currentSortReverse = false;
      allBooks = books;
      filteredBooks = books;
      searchedBooks = books;
      sortedBooks = sortFilters.author.sort(books, false);
    });

    return () => {
      removeReceiveListener();
    };
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
    // filter both by category and recent, then search, then sort
    filteredBooks = catFilters[currentFilter].filter(recentFilters[currentRecent].filter(structuredClone(allBooks)));
    search();
    sort();
  }

  // -- User action functions --

  function sortFilter(s: string) {
    if (s === currentSort) {
      currentSortReverse = !currentSortReverse;
    } else {
      currentSortReverse = false;
    }
    currentSort = s;
    sort();
  }

  function searchFilter(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key)) {
      // currentSearch is bound
      search();
    }
  }

  function catFilter(f: string) {
    currentFilter = f;
    filter();
  }

  function recentFilter(f: string) {
    currentRecent = f;
    filter();
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">List</h2>
  <div class="pageNav__search">
    <MagnifyingGlass /><input type="text" bind:value={currentSearch} on:keydown={searchFilter} />
  </div>
  <div class="pageNav__actions">
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
  </div>
</div>

<div class="list">
  <table>
    <thead>
      {#each ["title", "author", "series", "tags", "published", "read"] as h}
        <th on:click={() => sortFilter(h)} class:selected={currentSort === h}
          >{h.charAt(0).toUpperCase()}{h.slice(1)}
          {#if currentSort === h}
            {#if currentSortReverse}
              <CaretDown size={12} />
            {:else}
              <CaretUp size={12} />
            {/if}
          {/if}
        </th>
      {/each}
    </thead>
    <tbody>
      {#each sortedBooks as book}
        <tr on:click={() => push(`#/book/${book.cache.filepath}`)}>
          <td>{book.title}</td>
          <td>{book.authors.map((a) => a.name).join(", ")}</td>
          <td>{book.series ?? ""}</td>
          <td>
            <div class="tags">
              {#each book.tags as tag}
                <span class="tag">{tag}</span>
              {/each}
            </div>
          </td>
          <td class="date">
            {#if book.datePublished?.match(/^\-\d+$/)}
              {Math.abs(+book.datePublished)} BCE
            {:else}
              {book.datePublished ?? ""}
            {/if}
          </td>
          <td class="date">{book.dateRead ?? ""}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style lang="scss">
  @import "../../style/variables";

  .list {
    margin: 1rem 0;
    padding: 0 1rem;
    width: 100%;
    height: calc(100vh - $pageNavHeight - 2rem);
    scrollbar-width: thin;
    scrollbar-color: $bgColorLightest transparent;
    overflow: auto;
  }

  table {
    width: 100%;
    border-spacing: 0;
  }

  th,
  td {
    font-size: 1rem;
    padding: 0.5rem 1rem;
  }

  th {
    text-align: left;
    background-color: $bgColor;
    position: sticky;
    top: 0;
    cursor: pointer;
    color: $fgColorMuted;
    vertical-align: bottom;

    &:hover {
      color: $fgColor;
    }

    &.selected {
      color: $fgColor;
    }
  }

  tr {
    cursor: pointer;

    &:nth-child(odd) {
      background-color: lighten($bgColor, 2%);
    }

    &:hover td {
      background-color: rgba($accentColor, 10%);

      .tag {
        background-color: rgba($accentColor, 10%);
      }
    }
  }

  .date {
    white-space: nowrap;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
    justify-content: left;
  }
</style>
