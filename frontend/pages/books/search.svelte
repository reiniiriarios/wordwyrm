<script lang="ts">
  import { Book } from "@data/book";
  import Modal from "@components/modal.svelte";

  let addBookOpen: boolean = false;
  let selectedBook: Book = {} as Book;
  let searchString: string = "";
  let searchResults: Book[] = [];
  let searching: boolean = false;
  let canAdd: boolean = false;

  function openDialog() {
    addBookOpen = true;
    searchString = "";
    searchResults = [];
    searching = false;
    canAdd = false;
  }

  function search() {
    searching = true;
    window.electronAPI.searchBook(searchString);
  }

  window.electronAPI.searchBookResults((books: Book[]) => {
    searchResults = books;
    searching = false;
  });

  window.addEventListener("keydown", function (e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key) && !canAdd) {
      search();
    }
  });

  function selectBook(book: Book) {
    selectedBook = book;
    canAdd = true;
  }

  function addBook(): boolean {
    window.electronAPI.saveBook(selectedBook);
    addBookOpen = false;
    return true;
  }
</script>

<button type="button" class="btn" on:click={openDialog}> Search for Book </button>
<Modal bind:open={addBookOpen} heading="Search for Book" confirmWord="Add" on:confirm={addBook} canConfirm={canAdd}>
  <div class="search">
    <input type="text" name="search" bind:value={searchString} required />
    <button class="btn btn--light" on:click={search} disabled={searching}>Search</button>
  </div>
  <div class="results">
    {#each searchResults as book}
      <div class="book" class:selected={selectedBook.googleBooksId === book.googleBooksId}>
        {#if book.hasImage}
          <button class="book__inner book__inner--image" on:click={() => selectBook(book)}>
            <img src={book.thumbnail} alt="" />
          </button>
        {:else}
          <button class="book__inner book__inner--noimage" on:click={() => selectBook(book)}>
            <span>{book.title} by {book.authors.map((a) => a.name).join(", ")}</span>
          </button>
        {/if}
      </div>
    {/each}
  </div>
</Modal>

<style lang="scss">
  @import "../../style/variables";

  .search {
    display: flex;
    width: 100%;

    input[type="text"] {
      margin-right: 0.5rem;
      width: 100%;
    }
  }

  .results {
    padding: 0.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0.5rem;
    overflow-y: auto;
    height: 95%;
    scrollbar-width: thin;
    scrollbar-color: $bgColorLightest transparent;
  }

  .book {
    height: 14rem;
    display: flex;
    justify-content: center;
    align-items: center;

    &__inner {
      height: 14rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background-color: transparent;
      border: none;
      padding: 0;
      margin: 0;

      &--image {
        max-width: 9rem;

        img {
          max-height: 100%;
          max-width: 9rem;
          border: 2px solid transparent;
        }

        &:hover img {
          border-color: $accentColor;
        }
      }

      &--noimage {
        width: 9rem;
        background-color: $bgColorLightest;
        border: 2px solid transparent;

        &:hover {
          border-color: $accentColor;
        }
      }
    }

    &.selected {
      .book__inner {
        &--image img,
        &--noimage {
          border-color: $accentColor;
        }
      }
    }
  }
</style>
