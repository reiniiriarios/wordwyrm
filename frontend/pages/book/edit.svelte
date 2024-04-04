<script lang="ts">
  import { onMount } from "svelte";
  import Dropzone from "svelte-file-dropzone";
  import { push } from "svelte-spa-router";
  import ImageSearch from "./imagesearch.svelte";
  import Moreinfo from "./moreinfo.svelte";
  import Hoverinfo from "@components/hoverinfo.svelte";

  export let params: { author: string; book: string } = { author: "", book: "" };

  let book: Book;
  let oAuthorDir: string = "";
  let oFilename: string = "";
  let authors: string = "";
  let tags: string = "";
  let imagePath: string = "";
  let commonTags: string[] = [];

  onMount(() => {
    window.electronAPI.readBook(params.author, params.book);

    if (window.userSettings?.commonTags?.length) {
      commonTags = window.userSettings.commonTags.split(",").map((t) => t.trim());
    } else {
      commonTags = ["Fiction", "Fantasy", "Science Fiction", "Romance", "Non-Fiction", "Historical"];
    }

    const removeReceiveListener = window.electronAPI.receiveBook((b: Book) => {
      book = b;
      oAuthorDir = b.cache.authorDir ?? "";
      oFilename = b.cache.filename ?? "";
      authors = book.authors.map((a) => a.name).join(", ");
      tags = book.tags?.join(", ") ?? "";
      if (book.images.hasImage && window.userSettings.booksDir) {
        let booksDir = window.userSettings.booksDir.replace(/\\/g, "/").replace(/ /g, "%20");
        if (booksDir.charAt(0) !== "/") booksDir = "/" + booksDir;
        imagePath = `${booksDir}/${book.cache.urlpath}.jpg`;
      }
    });

    return () => {
      removeReceiveListener();
    };
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
      imagePath = acceptedFiles[0].path.replace(/\\/g, "/").replace(/ /g, "%20");
      if (imagePath.charAt(0) !== "/") imagePath = "/" + imagePath;
      book.cache.image = imagePath;
    }
  }

  function saveBook() {
    window.electronAPI.editBook(book, oAuthorDir, oFilename);
    push(`#/book/${book.cache.filepath}`);
  }

  function validateDatePublished() {
    book.datePublished = book.datePublished?.replace(/[^\-0-9]/, "") ?? "";
  }

  function addCommonTag(tag: string) {
    if (tag) {
      if (!book.tags) book.tags = [];
      book.tags.push(tag);
      if (tags.length) tags += ", ";
      tags += tag;
    }
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Edit Book</h2>
  <div class="pageNav__actions">
    {#if book}
      <Moreinfo {book} />
    {/if}
  </div>
</div>
{#if book}
  <div class="bookPage">
    <div class="bookPage__image">
      <div class="field">
        Cover Image
        <Dropzone accept="image/*" on:drop={handleBookImage}>
          {#if imagePath}
            <img src={`localfile://${imagePath}`} alt="" />
            <div class="dropzone__info">Drag or click here to replace image.</div>
          {:else}
            <div class="dropzone__info">Drag or click here to add image manually.</div>
          {/if}
        </Dropzone>
      </div>
      <div class="searchButton">
        {#if book && window.userSettings.googleApiKey && window.userSettings.googleSearchEngineId}
          <ImageSearch {book} />
        {/if}
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
          {#if book.datePublished?.match(/^\d+\-\d+\-\d+$/)}
            <input type="date" bind:value={book.datePublished} />
          {:else}
            <input
              type="text"
              on:keypress={validateDatePublished}
              on:change={validateDatePublished}
              bind:value={book.datePublished}
            />
          {/if}
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
          ISBN <Hoverinfo details="Enables quick-links to Google Books, LibraryThing, and Goodreads." />
          <input type="text" bind:value={book.ids.isbn} />
        </label>
        <label class="field field--fullwidth">
          Tag(s) <Hoverinfo details="Tags should be comma-separated." />
          <input type="text" bind:value={tags} on:change={setTags} />
        </label>
        <div class="field field--fullwidth commonTags">
          <div class="commonTags__title">
            Common Tags <Hoverinfo details="Click to add. Change tags displayed in Settings." />
          </div>
          <div class="commonTags__tags">
            {#each commonTags as tag}
              <button class="tag" on:click={() => addCommonTag(tag)}>{tag}</button>
            {/each}
          </div>
        </div>
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

  .commonTags {
    &__title {
      font-size: 0.9rem;
      color: $fgColorMuted;
    }

    &__tags {
      margin-top: 0.25rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
</style>
