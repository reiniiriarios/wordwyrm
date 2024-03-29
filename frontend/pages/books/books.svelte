<script lang="ts">
  import { onMount } from "svelte";
  import AddBook from "./add.svelte";
  import SearchBook from "./search.svelte";
  import { Book } from "@data/book";

  let allBooks: Book[] = [];

  function readBooks() {
    window.electronAPI.readAllBooks();
  }

  onMount(() => {
    readBooks();
  });

  window.electronAPI.receiveAllBooks((books: Book[]) => {
    allBooks = books;
  });
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Books</h2>
  <div class="pageNav__actions">
    <AddBook />
    <SearchBook />
  </div>
</div>
<div class="bookList">
  {#each allBooks as book}
    <div>{book.title}</div>
  {/each}
</div>
