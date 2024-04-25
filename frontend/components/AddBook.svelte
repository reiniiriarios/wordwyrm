<script lang="ts">
  import log from "electron-log/renderer";
  import Dropzone from "svelte-file-dropzone";
  import Plus from "phosphor-svelte/lib/Plus";
  import Modal from "@components/Modal.svelte";
  import HoverInfo from "@components/HoverInfo.svelte";
  import FlexibleDate from "@components/FlexibleDate.svelte";
  import { books } from "@stores/books";

  let addBookOpen: boolean = false;
  let book: Partial<Book> = {
    images: {
      hasImage: false,
    },
    ids: {},
    cache: {},
  };
  let authors: string = "";
  let tags: string = "";
  let addImagePath: string = "";
  let canConfirm: boolean = false;

  $: canConfirm = (book.title?.length ?? 0) > 0 && (book.authors?.length ?? 0) > 0;

  function openDialog() {
    addBookOpen = true;
    book = {
      images: {
        hasImage: false,
      },
      ids: {},
      cache: {},
    };
    authors = "";
    tags = "";
    addImagePath = "";

    const removeSavedListener = window.electronAPI.bookSaved((savedBook: Book) => {
      addBookOpen = false;
      console.log(savedBook);
      books.addBook(savedBook);
      removeSavedListener();
    });
  }

  function setAuthors() {
    book.authors = authors
      .replace(/ and /, ",")
      .split(",")
      .map((name) => ({ name: name.trim() }) as Author);
  }

  function typeTags() {
    tags = tags.replace(/[\r\n]/g, "");
  }

  function setTags() {
    book.tags = tags.split(",").map((t) => t.trim());
  }

  function addBook() {
    window.electronAPI.saveBook(book);
  }

  function handleBookImage(e: CustomEvent) {
    const { acceptedFiles, fileRejections } = e.detail as {
      acceptedFiles: (File & { path: string })[];
      fileRejections: (File & { path: string })[];
    };
    if (fileRejections.length) {
      log.error("rejected files", fileRejections);
    }
    if (acceptedFiles.length) {
      addImagePath = acceptedFiles[0].path.replace(/\\/g, "/").replace(/ /g, "%20");
      if (addImagePath.charAt(0) !== "/") {
        addImagePath = `/${addImagePath}`;
      }
      if (!book.cache) {
        book.cache = {};
      }
      book.cache.image = addImagePath;
    }
  }
</script>

<button type="button" class="btn" on:click={openDialog}>Add Book <span class="icon"><Plus /></span></button>
<Modal
  large
  height="33rem"
  bind:open={addBookOpen}
  heading="Add Book"
  confirmWord="Add"
  on:confirm={addBook}
  bind:canConfirm
>
  <fieldset class="addBook">
    <label class="field field--title">
      Title
      <input type="text" bind:value={book.title} required />
    </label>
    <label class="field field--author">
      Author(s) <HoverInfo details="Authors should be comma-separated." />
      <input type="text" bind:value={authors} on:change={setAuthors} required />
    </label>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label class="field field--datePublished">
      Date Published
      <FlexibleDate />
    </label>
    <label class="field field--dateRead">
      Date Read
      <input type="date" bind:value={book.dateRead} />
    </label>
    <label class="field field--series">
      Series
      <input type="text" bind:value={book.series} />
    </label>
    <label class="field field--seriesNumber">
      Series Number
      <input type="text" bind:value={book.seriesNumber} />
    </label>
    <div class="field field--image">
      <Dropzone accept="image/*" on:drop={handleBookImage}>
        {#if addImagePath}
          <img src={`localfile://${addImagePath}`} alt="" />
        {:else}
          <div class="dropzone__info">Drag or click here to add image.</div>
        {/if}
      </Dropzone>
    </div>
    <label class="field field--tags">
      Tag(s) <HoverInfo details="Tags should be comma-separated." />
      <input type="text" bind:value={tags} on:keyup={typeTags} on:change={setTags} />
    </label>
    <label class="field field--desc">
      Description
      <textarea rows="4" bind:value={book.description} />
    </label>
  </fieldset>
</Modal>

<style lang="scss">
  .addBook {
    padding: 0.5rem 1rem 1.5rem;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0.5rem 1.5rem;

    .field {
      // row-start, col-start, row-end, col-end
      &--title {
        grid-area: 1 / 1 / 2 / 3;
      }

      &--author {
        grid-area: 2 / 1 / 3 / 3;
      }

      &--datePublished {
        grid-area: 1 / 3 / 2 / 4;
      }

      &--dateRead {
        grid-area: 2 / 3 / 3 / 4;
      }

      &--series {
        grid-area: 3 / 1 / 4 / 3;
      }

      &--seriesNumber {
        grid-area: 3 / 3 / 4 / 4;
      }

      &--tags {
        grid-area: 4 / 1 / 5 / 4;
      }

      &--desc {
        grid-area: 5 / 1 / 6 / 4;
      }

      &--image {
        grid-area: 1 / 4 / 6 / 4;
      }
    }
  }
</style>
