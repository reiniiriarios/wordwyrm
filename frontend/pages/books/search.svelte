<script lang="ts">
  import Modal from "@components/modal.svelte";
  import { onMount, tick } from "svelte";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";

  let addBookOpen: boolean = false;
  let selectedBook: Book = {} as Book;
  let searchString: string = "";
  let searchResults: Book[] = [];
  let searched: boolean = false;
  let searching: boolean = false;
  let canAdd: boolean = false;
  let searchInput: HTMLInputElement;

  function openDialog() {
    window.addEventListener("keydown", searchKey);
    addBookOpen = true;
    searchString = "";
    searchResults = [];
    searched = false;
    searching = false;
    canAdd = false;
    tick().then(() => searchInput.focus());
  }

  function search() {
    searching = true;
    window.electronAPI.searchBook(searchString);
  }

  function searchKey(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key) && !canAdd) {
      console.log("searching api");
      search();
    }
  }

  onMount(() => {
    const removeSearchListener = window.electronAPI.searchBookResults((books: Book[]) => {
      searchResults = books;
      searching = false;
      searched = true;
    });

    const removeReceiveListener = window.electronAPI.receiveBookData((book: Book) => {
      window.electronAPI.saveBook(book);
      addBookOpen = false;
      // stupid hack to avoid race condition
      setTimeout(window.electronAPI.readAllBooks, 1000);
    });

    return () => {
      window.removeEventListener("keydown", searchKey);
      removeSearchListener();
      removeReceiveListener();
    };
  });

  function selectBook(book: Book) {
    selectedBook = book;
    canAdd = true;
  }

  function addBook() {
    if (!selectedBook.googleBooksId) return;
    window.removeEventListener("keydown", searchKey);
    window.electronAPI.getBookData(selectedBook.googleBooksId);
  }

  function closeSearch() {
    window.removeEventListener("keydown", searchKey);
  }
</script>

<button type="button" class="btn" on:click={openDialog}>Search for Book <MagnifyingGlass /></button>
<Modal
  bind:open={addBookOpen}
  heading="Search for Book"
  confirmWord="Add"
  on:confirm={addBook}
  on:cancel={closeSearch}
  bind:canConfirm={canAdd}
>
  <div class="search">
    <input type="text" name="search" bind:this={searchInput} bind:value={searchString} required />
    <button class="btn btn--light" on:click={search} disabled={searching}>Search</button>
  </div>
  {#if searched && !searchResults.length}
    <div class="err">Error fetching results</div>
  {:else}
    <div class="results">
      {#each searchResults as book}
        <div class="book" class:selected={selectedBook.googleBooksId === book.googleBooksId}>
          {#if book.hasImage}
            <button class="book__inner book__inner--image" on:click={() => selectBook(book)}>
              <img src={book.thumbnail?.replace(/^http:/, "https:")} alt="" />
            </button>
          {:else}
            <button class="book__inner book__inner--noimage" on:click={() => selectBook(book)}>
              <span>{book.title} by {book.authors.map((a) => a.name).join(", ")}</span>
            </button>
          {/if}
          <div class="book__meta">
            {book.datePublished}
          </div>
        </div>
      {/each}
    </div>
  {/if}
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

  .err {
    padding: 2rem;
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
    flex-direction: column;

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

    &__meta {
      font-size: 0.9rem;
      color: $fgColorMuted;
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
