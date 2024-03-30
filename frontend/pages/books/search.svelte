<script lang="ts">
  import { Book } from "@data/book";
  import Modal from "@components/modal.svelte";

  let addBookOpen: boolean = false;
  let book: Book = {} as Book;
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

  function addBook(): boolean {
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
      <div class="book">{book.title}</div>
    {/each}
  </div>
</Modal>

<style lang="scss">
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

    .book {
    }
  }
</style>
