<script lang="ts">
  import Book from "@data/book";
  import Modal from "@components/modal.svelte";

  let addBookOpen: boolean = false;
  let book: Book = {
    title: "",
    author: {
      name: "",
    },
    datePublished: new Date(),
    dateRead: new Date(),
  } as Book;

  function addBook(): boolean {
    return true;
  }
</script>

<button type="button" class="btn" on:click={() => (addBookOpen = true)}> Add Book + </button>
<Modal open={addBookOpen} heading="Add Book" confirmWord="Add" confirm={addBook}>
  <fieldset>
    <label class="field field--fullwidth">
      Title
      <input type="text" name="title" bind:value={book.title} required />
    </label>
    <label class="field field--fullwidth">
      Author
      <input type="text" name="author" bind:value={book.author.name} required />
    </label>
    <label class="field">
      Date Published
      <input type="date" name="datePublished" bind:value={book.datePublished} />
    </label>
    <label class="field">
      Date Read
      <input type="date" name="dateRead" bind:value={book.dateRead} />
    </label>
  </fieldset>
</Modal>
