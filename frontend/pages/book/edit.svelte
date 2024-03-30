<script lang="ts">
  import { Author, Book } from "@data/book";
  import { onMount } from "svelte";
  import Dropzone from "svelte-file-dropzone";
  import { push } from "svelte-spa-router";
  import ImageSearch from "./imagesearch.svelte";

  export let params: { author: string; book: string } = { author: "", book: "" };

  let settings: Record<string, any> = {};

  let book: Book;
  let oAuthorDir: string = "";
  let oFilename: string = "";
  let authors: string = "";
  let tags: string = "";
  let imagePath: string = "";

  onMount(() => {
    window.electronAPI.readBook(params.author, params.book);
    window.electronAPI.loadSettings();
  });

  window.electronAPI.receiveBook((b: Book) => {
    book = b;
    oAuthorDir = b.authorDir ?? "";
    oFilename = b.filename;
    authors = book.authors.map((a) => a.name).join(", ");
    tags = book.tags?.join(", ") ?? "";
    if (book.hasImage && settings.booksDir) {
      imagePath = settings.booksDir + "/" + book.authorDir + "/" + book.filename + ".jpg";
    }
  });

  window.electronAPI.settingsLoaded((loadedSettings: Record<string, any>) => {
    settings = loadedSettings;
    if (book.hasImage && settings.booksDir) {
      imagePath = settings.booksDir + "/" + book.authorDir + "/" + book.filename + ".jpg";
    }
  });

  function setAuthors() {
    book.authors = authors
      .replace(/ and /, ",")
      .split(",")
      .map((name) => ({ name: name.trim() }) as Author);
  }

  function setTags() {
    book.tags = tags.split(",").map((t) => t.trim());
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
      imagePath = acceptedFiles[0].path;
      book.image = imagePath;
    }
  }

  function saveBook() {
    window.electronAPI.editBook(book, oAuthorDir, oFilename);
    push(`#/book/${book.authorDir}/${book.filename}`);
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Edit Book</h2>
</div>
{#if book}
  <div class="bookPage">
    <div class="bookPage__image">
      <div class="field">
        Cover Image
        <Dropzone accept="image/*" on:drop={handleBookImage}>
          {#if imagePath}
            <img src={`localfile://${imagePath}`} alt="" />
          {:else}
            Select Book Image
          {/if}
        </Dropzone>
      </div>
      <div class="searchButton">
        <ImageSearch {book} />
      </div>
    </div>
    <div class="bookPage__info">
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
      </fieldset>
      <div class="bookPage__actions">
        <a class="btn" href={`#/book/${params.author}/${params.book}`}>Cancel</a>
        <button class="btn" on:click={saveBook}>Save</button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  @import "../../style/variables";

  .bookPage {
    display: flex;
    height: calc(100vh - $pageNavHeight);

    &__image {
      height: 100%;
      width: 50vw;
      padding: 1rem;

      .dropzone {
        img {
          max-height: 50vh;
        }
      }
    }

    &__info {
      padding: 1rem;
    }

    &__actions {
      padding: 1.5rem 0.5rem;
      display: flex;
      justify-content: right;
      gap: 0.5rem;
    }
  }

  .searchButton {
    padding: 1rem;
    text-align: center;
  }
</style>
