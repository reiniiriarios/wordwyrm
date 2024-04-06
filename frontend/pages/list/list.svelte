<script lang="ts">
  import { onMount } from "svelte";
  import { catFilters, filterByTag, recentFilters, searchBooks, sortFilters } from "@pages/books/sortBooks";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
  import X from "phosphor-svelte/lib/X";
  import CaretUp from "phosphor-svelte/lib/CaretUp";
  import CaretDown from "phosphor-svelte/lib/CaretDown";
  import { push } from "svelte-spa-router";
  import { appState } from "@stores/appState";
  import { settings } from "@stores/settings";

  let allBooks: Book[] = [];
  let filteredBooks: Book[] = [];
  let searchedBooks: Book[] = [];
  let sortedBooks: Book[] = [];
  let filterTags: string[] = [];
  $: filterTags = $settings.filterTags?.split(",").map((t) => t.trim());

  // -- Init --

  onMount(() => {
    if (!allBooks.length) {
      window.electronAPI.readAllBooks();
    }

    const removeReceiveListener = window.electronAPI.receiveAllBooks((books: Book[]) => {
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
    sortedBooks = sortFilters[$appState.books.sort].sort(structuredClone(searchedBooks), $appState.books.reverse);
  }

  function search() {
    // search through what is already filtered, then sort
    searchedBooks = searchBooks(structuredClone(filteredBooks), $appState.books.search);
    sort();
  }

  function filter() {
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
    if (s === $appState.books.sort) {
      $appState.books.reverse = !$appState.books.reverse;
    } else {
      $appState.books.reverse = false;
    }
    $appState.books.sort = s;
    sort();
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
</script>

<div class="pageNav">
  <h2 class="pageNav__header">List</h2>
  <div class="pageNav__search">
    <span class="glass">
      <MagnifyingGlass />
    </span>
    <input type="text" bind:value={$appState.books.search} on:keydown={searchFilter} />

    {#if $appState.books.search.length}
      <div class="x" role="button" tabindex="0" on:click={clearSearch} on:keypress={clearSearch}>
        <X />
      </div>
    {/if}
  </div>
  <div class="pageNav__actions">
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
            <button
              on:click={() => catFilter(i)}
              class="customFilter__opt"
              class:selected={$appState.books.filter === i}>{f.name}</button
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
  </div>
</div>

<div class="list">
  <table>
    <thead>
      {#each ["title", "author", "series", "tags", "published", "read"] as h}
        <th on:click={() => sortFilter(h)} class:selected={$appState.books.sort === h}
          >{h.charAt(0).toUpperCase()}{h.slice(1)}
          {#if $appState.books.sort === h}
            {#if $appState.books.reverse}
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
