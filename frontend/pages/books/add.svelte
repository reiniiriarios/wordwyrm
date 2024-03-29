<script lang="ts">
  import { Book, Author } from "@data/book";
  import Dropzone from "svelte-file-dropzone";
  import Modal from "@components/modal.svelte";

  let addBookOpen: boolean = false;
  let book: Book = {} as Book;
  let authors: string = "";
  let addImagePath: string = "";

  function openDialog() {
    addBookOpen = true;
    book = {} as Book;
    authors = "";
    addImagePath = "";
  }

  function setAuthors() {
    book.authors = authors.split(",").map((name) => ({ name: name.trim() }) as Author);
  }

  function addBook(): boolean {
    return true;
  }

  function handleBookImage(e: CustomEvent<any>) {
    const { acceptedFiles, fileRejections } = e.detail as {
      acceptedFiles: (File & { path: string })[];
      fileRejections: (File & { path: string })[];
    };
    if (fileRejections.length) {
      console.error("rejected files", fileRejections);
    }
    if (acceptedFiles.length) {
      console.log(acceptedFiles);
      addImagePath = acceptedFiles[0].path;
    }
  }
</script>

<button type="button" class="btn" on:click={openDialog}> Add Book + </button>
<Modal bind:open={addBookOpen} heading="Add Book" confirmWord="Add" confirm={addBook}>
  <fieldset>
    <label class="field field--fullwidth">
      Title
      <input type="text" bind:value={book.title} required />
    </label>
    <label class="field field--fullwidth">
      Author(s)
      <input type="text" bind:value={authors} on:change={setAuthors} required />
    </label>
    <label class="field">
      Date Published
      <input type="date" bind:value={book.datePublished} />
    </label>
    <label class="field">
      Date Read
      <input type="date" bind:value={book.dateRead} />
    </label>
    <div class="field field--fullwidth">
      <Dropzone accept="image/*" on:drop={handleBookImage}>
        {#if addImagePath}
          <img src={`localfile://${addImagePath}`} alt="" />
        {:else}
          Select Book Image
        {/if}
      </Dropzone>
    </div>
  </fieldset>
</Modal>
