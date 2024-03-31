<script lang="ts">
  import { onMount } from "svelte";
  import AddBook from "./add.svelte";
  import SearchBook from "./search.svelte";
  import { Book } from "@data/book";
  import { catFilters, sortFilters } from "./sortBooks";

  let allBooks: Book[] = [];
  let sortedBooks: Book[] = [];
  let currentSort: string = "";
  let currentFilter: string = "";

  function readBooks() {
    window.electronAPI.readAllBooks();
  }

  onMount(() => {
    readBooks();
  });

  window.electronAPI.receiveAllBooks((books: Book[]) => {
    allBooks = books;
    currentSort = "author";
    currentFilter = "all";
    sortedBooks = sortFilters.author.sort(allBooks);
  });

  function sortFilter(s: string) {
    currentSort = s;
    sortedBooks = catFilters[currentFilter].filter(sortFilters[s].sort(structuredClone(allBooks)));
  }

  function catFilter(f: string) {
    currentFilter = f;
    sortedBooks = sortFilters[currentSort].sort(catFilters[f].filter(structuredClone(allBooks)));
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Books</h2>
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
      }
    }
  }

  .bookList {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 2vw;
    padding: 0.5rem 1rem 1.25rem;
    overflow-y: auto;
    width: 100%;
    height: calc(100vh - $pageNavHeight - $filterHeight);
    scrollbar-width: thin;
    scrollbar-color: $bgColorLightest transparent;
  }

  .book {
    height: 30vw;
    display: flex;
    justify-content: center;
    align-items: center;

    &__inner {
      max-height: 30vw;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-decoration: none;
      color: $fgColor;

      &--image {
        max-width: 20vw;

        .bookComposite {
          max-height: 30vw;
          transition: 0.2s transform;
        }

        img {
          max-height: 30vw;
          max-width: 20vw;
        }

        &:hover .bookComposite {
          transform: scale(1.02);
        }
      }

      &--noimage {
        width: 20vw;
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
