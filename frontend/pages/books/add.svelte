<script lang="ts">
  import { Book, Author } from "@data/book";
  import Dropzone from "svelte-file-dropzone";
  import Modal from "@components/modal.svelte";
  import Plus from "phosphor-svelte/lib/Plus";

  let addBookOpen: boolean = false;
  let book: Book = {} as Book;
  let authors: string = "";
  let tags: string = "";
  let addImagePath: string = "";
  let canConfirm: boolean = false;

  $: canConfirm = (book.title?.length ?? 0) > 0 && (book.authors?.length ?? 0) > 0;

  function openDialog() {
    addBookOpen = true;
    book = {} as Book;
    authors = "";
    tags = "";
    addImagePath = "";
  }

  function setAuthors() {
    book.authors = authors
      .replace(/ and /, ",")
      .split(",")
      .map((name) => ({ name: name.trim() }) as Author);
  }

  function setTags() {
    book.tags = tags.split(",").map((t) => t.trim());
  }

  function addBook() {
    window.electronAPI.saveBook(book);
    addBookOpen = false;
    // stupid hack to avoid race condition
    setTimeout(window.electronAPI.readAllBooks, 1000);
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
      book.image = addImagePath;
    }
  }
</script>

<button type="button" class="btn" on:click={openDialog}>Add Book <Plus /></button>
<Modal bind:open={addBookOpen} heading="Add Book" confirmWord="Add" on:confirm={addBook} bind:canConfirm>
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
    <label class="field field--fullwidth">
      Series
      <input type="text" bind:value={book.series} />
    </label>
    <label class="field field--fullwidth">
      Tag(s)
      <input type="text" bind:value={tags} on:change={setTags} />
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
