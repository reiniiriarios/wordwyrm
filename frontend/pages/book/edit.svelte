<script lang="ts">
  import { onMount } from "svelte";
  import Dropzone from "svelte-file-dropzone";
  import { push } from "svelte-spa-router";
  import Hash from "phosphor-svelte/lib/Hash";
  import Calendar from "phosphor-svelte/lib/Calendar";
  import { settings } from "@stores/settings";
  import { books } from "@stores/books";
  import Hoverinfo from "@components/hoverinfo.svelte";
  import Rating from "@components/rating.svelte";
  import ImageSearch from "./imagesearch.svelte";
  import Moreinfo from "./moreinfo.svelte";
  import Crop from "./crop.svelte";
  import Delete from "./delete.svelte";

  export let params: { author: string; book: string } = { author: "", book: "" };

  let book: Book;
  let oAuthorDir: string = "";
  let oFilename: string = "";
  let authors: string = "";
  let tags: string = "";
  let imagePath: string = "";
  let commonTags: string[] = [];
  let saving: boolean = false;
  let datePublishedIsDate: boolean = true;

  onMount(() => {
    window.electronAPI.readBook(params.author, params.book);

    if ($settings.commonTags?.length) {
      commonTags = $settings.commonTags.split(",").map((t) => t.trim());
    } else {
      commonTags = ["Fiction", "Fantasy", "Science Fiction", "Romance", "Non-Fiction", "Historical"];
    }

    const removeReceiveListener = window.electronAPI.receiveBook((b: Book) => {
      book = b;
      oAuthorDir = b.cache.authorDir ?? "";
      oFilename = b.cache.filename ?? "";
      authors = book.authors.map((a) => a.name).join(", ");
      tags = book.tags?.join(", ") ?? "";
      if (book.images.hasImage && $settings.booksDir) {
        let booksDir = $settings.booksDir.replace(/\\/g, "/").replace(/ /g, "%20");
        if (booksDir.charAt(0) !== "/") booksDir = "/" + booksDir;
        imagePath = `${booksDir}/${book.cache.urlpath}.jpg?t=${book.images.imageUpdated}`;
      }
      datePublishedIsDate = !!book.datePublished?.match(/^\d+\-\d+\-\d+$/);
    });

    const removeSavedListener = window.electronAPI.bookSaved((savedBook: Book) => {
      saving = false;
      books.updateBook(savedBook);
      // hacky fix to maybe beat race condition on saving image
      // would rather go ahead and change the page than beat it
      setTimeout(() => push(`#/book/${savedBook.cache.filepath}`), 250);
    });

    return () => {
      removeReceiveListener();
      removeSavedListener();
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
    // Without timeout, disabled won't set.
    setTimeout(() => (saving = true), 50);
    window.electronAPI.editBook(book, oAuthorDir, oFilename);
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

  function switchDatePublished() {
    datePublishedIsDate = !datePublishedIsDate;
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
      <div class="imageActions">
        {#if book}
          {#if $settings.googleApiKey && $settings.googleSearchEngineId}
            <ImageSearch {book} />
          {/if}
          <Crop bind:book />
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
          <div class="datePublished">
            {#if datePublishedIsDate}
              <input type="date" bind:value={book.datePublished} />
              <div role="button" tabindex="0" on:click={switchDatePublished} on:keypress={switchDatePublished}>
                <Hash size="1.25rem" />
              </div>
            {:else}
              <input
                type="text"
                on:keypress={validateDatePublished}
                on:change={validateDatePublished}
                bind:value={book.datePublished}
              />
              <div role="button" tabindex="0" on:click={switchDatePublished} on:keypress={switchDatePublished}>
                <Calendar size="1.25rem" />
              </div>
            {/if}
          </div>
        </label>
        <label class="field">
          Date Read
          <input type="date" bind:value={book.dateRead} />
        </label>

        <label class="field">
          Series
          <input type="text" bind:value={book.series} />
        </label>
        <label class="field">
          Series Number
          <input type="text" bind:value={book.seriesNumber} />
        </label>

        <div class="field field--fullwidth">
          Rating
          <Rating bind:rating={book.rating} editable />
        </div>

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

        <label class="field field--fullwidth">
          Notes
          <textarea rows="4" bind:value={book.notes} />
        </label>

        <label class="field field">
          ISBN
          <input type="text" bind:value={book.ids.isbn} />
        </label>
        <label class="field field">
          Google Books ID <Hoverinfo position="left" details="Format is alphanumeric plus _ and -." />
          <input type="text" bind:value={book.ids.googleBooksId} />
        </label>
        <label class="field field">
          OpenLibrary ID <Hoverinfo details="Format should be /works/id or /books/id, where id is alphanumeric." />
          <input type="text" bind:value={book.ids.openLibraryId} />
        </label>
        <label class="field field">
          Goodreads ID <Hoverinfo position="left" details="Format is numeric." />
          <input type="text" bind:value={book.ids.goodreadsId} />
        </label>
      </fieldset>
      <div class="bookPage__actions">
        <div class="left">
          <Delete {book} />
        </div>
        <a class="btn" href={`#/book/${params.author}/${params.book}`}>Cancel</a>
        <button class="btn" disabled={saving} on:click={saveBook}>Save</button>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .bookPage {
    display: flex;
    height: calc(100vh - var(--page-nav-height));

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
      overflow-y: auto;
      scrollbar-width: thin;
      scrollbar-color: var(--bg-color-lightest) transparent;
    }

    &__actions {
      padding: 1.5rem 0.5rem;
      display: flex;
      justify-content: right;
      align-items: center;
      gap: 0.5rem;

      .left {
        margin-right: auto;
      }
    }
  }

  .imageActions {
    padding: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }

  .datePublished {
    display: flex;
    align-items: center;
    justify-content: space-between;

    > div {
      margin: 0.2rem 0 0 0.5rem;
      cursor: pointer;
    }
  }

  .commonTags {
    &__title {
      font-size: 0.9rem;
      color: var(--fg-color-muted);
    }

    &__tags {
      margin-top: 0.25rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
</style>
