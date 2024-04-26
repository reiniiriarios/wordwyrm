<script lang="ts">
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";

  import ScrollBox from "@components/ScrollBox.svelte";
  import HoverInfo from "@components/HoverInfo.svelte";
  import Rating from "@components/Rating.svelte";
  import ImageSearch from "@components/ImageSearch.svelte";
  import ImageSearchLink from "@components/ImageSearchLink.svelte";
  import MoreInfo from "@components/MoreInfo.svelte";
  import CropCover from "@components/CropCover.svelte";
  import DeleteBook from "@components/DeleteBook.svelte";
  import FlexibleDate from "@components/FlexibleDate.svelte";
  import CoverDropzone from "@components/CoverDropzone.svelte";

  import { settings } from "@stores/settings";
  import { books } from "@stores/books";

  export let params: { author: string; book: string } = { author: "", book: "" };

  let book: Book;
  let oAuthorDir: string = "";
  let oFilename: string = "";
  let authors: string = "";
  let tags: string = "";
  let imagePath: string = "";
  let commonTags: string[] = [];
  let saving: boolean = false;

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
      if (book.images.hasImage) {
        let booksDir = $settings.booksDir.replace(/\\/g, "/").replace(/ /g, "%20");
        if (booksDir.charAt(0) !== "/") {
          booksDir = `/${booksDir}`;
        }
        imagePath = `${booksDir}/${book.cache.urlpath}.jpg?t=${book.images.imageUpdated}`;
      }
    });

    const removeSavedListener = window.electronAPI.bookSaved((savedBook: Book) => {
      saving = false;
      books.updateBook(savedBook, book.cache.filepath ?? "");
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

  function handleBookImageDropped(e: CustomEvent) {
    book.cache.image = imagePath;
  }

  function handleImageSearchAdded(_: CustomEvent) {
    let booksDir = $settings.booksDir.replace(/\\/g, "/").replace(/ /g, "%20");
    if (booksDir.charAt(0) !== "/") {
      booksDir = `/${booksDir}`;
    }
    imagePath = `${booksDir}/${book.cache.urlpath}.jpg?t=${book.images.imageUpdated}`;
  }

  function saveBook() {
    // Without timeout, disabled won't set.
    setTimeout(() => (saving = true), 50);
    window.electronAPI.editBook(book, oAuthorDir, oFilename);
  }

  function addCommonTag(tag: string) {
    if (tag) {
      if (!book.tags) {
        book.tags = [];
      }
      book.tags.push(tag);
      if (tags.length) {
        tags += ", ";
      }
      tags += tag;
    }
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Edit Book</h2>
  <div class="pageNav__actions">
    {#if book}
      <MoreInfo {book} />
    {/if}
  </div>
</div>
{#if book}
  <div class="pageWrapper bookPage">
    <div class="bookPage__image">
      <div class="field">
        Cover Image
        <CoverDropzone on:change={handleBookImageDropped} containerClasses="tall above" bind:imagePath addlMsg />
      </div>
      <div class="imageActions">
        {#if book}
          {#if $settings.imageSearchEngine === "google" && $settings.googleApiKey && $settings.googleSearchEngineId}
            <ImageSearch bind:book on:add={handleImageSearchAdded} />
          {:else}
            <ImageSearchLink {book} />
          {/if}
          <CropCover bind:book />
        {/if}
      </div>
    </div>
    <ScrollBox>
      <div class="bookPage__info">
        <fieldset class="bookPage__form">
          <label class="field field--title">
            Title
            <input type="text" bind:value={book.title} required />
          </label>
          <label class="field field--author">
            Author(s) <HoverInfo details="Authors should be comma-separated." />
            <input type="text" bind:value={authors} on:change={setAuthors} required />
          </label>

          <!-- svelte-ignore a11y-label-has-associated-control -->
          <label class="field field--published">
            Date Published
            <FlexibleDate bind:value={book.datePublished} />
          </label>
          <label class="field field--read">
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

          <label class="field field--tags">
            Tag(s) <HoverInfo details="Tags should be comma-separated." />
            <input type="text" bind:value={tags} on:change={setTags} />
          </label>
          <div class="field field--commonTags">
            <div class="commonTags__title">
              Common Tags <HoverInfo details="Click to add. Change tags displayed in Settings." />
            </div>
            <div class="commonTags__tags">
              {#each commonTags as tag}
                <button class="tag" on:click={() => addCommonTag(tag)}>{tag}</button>
              {/each}
            </div>
          </div>

          <div class="field field--rating">
            Rating
            <Rating bind:rating={book.rating} editable />
          </div>

          <label class="field field--description">
            Description
            <textarea rows="5" bind:value={book.description} />
          </label>

          <label class="field field--notes">
            Notes
            <textarea rows="5" bind:value={book.notes} />
          </label>

          <label class="field field--isbn">
            ISBN
            <input type="text" bind:value={book.ids.isbn} />
          </label>
          <label class="field field--googlebooks">
            Google Books ID <HoverInfo position="left" details="Format is alphanumeric plus _ and -." />
            <input type="text" bind:value={book.ids.googleBooksId} />
          </label>
          <label class="field field--openlibrary">
            OpenLibrary ID <HoverInfo
              position="left"
              details="Format should be /works/id or /books/id, where id is alphanumeric."
            />
            <input type="text" bind:value={book.ids.openLibraryId} />
          </label>
          <label class="field field--goodreads">
            Goodreads ID <HoverInfo position="left" details="Format is numeric." />
            <input type="text" bind:value={book.ids.goodreadsId} />
          </label>
        </fieldset>
        <div class="bookPage__actions">
          <div class="left">
            <DeleteBook {book} />
          </div>
          <a class="btn btn--cancel" href={`#/book/${params.author}/${params.book}`}>Cancel</a>
          <button class="btn btn--save" disabled={saving} on:click={saveBook}>Save</button>
        </div>
      </div>
    </ScrollBox>
  </div>
{/if}

<style lang="scss">
  .bookPage {
    display: flex;
    padding: 1rem 1.5rem 1.5rem;
    gap: 2rem;

    &__image {
      height: 100%;
      width: 45vw;
    }

    &__info {
      padding: 0 0.5rem;
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

    &__form {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 0.6rem 1rem;

      .field {
        // row-start, col-start, row-end, col-end
        &--title {
          grid-area: 1 / 1 / 2 / 3;
        }

        &--author {
          grid-area: 2 / 1 / 3 / 3;
        }

        &--published {
          grid-area: 1 / 3 / 2 / 4;
        }

        &--read {
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

        &--commonTags {
          grid-area: 5 / 1 / 6 / 3;
        }

        &--rating {
          grid-area: 5 / 3 / 6 / 4;
        }

        &--description {
          grid-area: 6 / 1 / 8 / 3;
        }

        &--notes {
          grid-area: 8 / 1 / 10 / 3;
        }

        &--isbn {
          grid-area: 6 / 3 / 7 / 4;
        }

        &--googlebooks {
          grid-area: 7 / 3 / 8 / 4;
        }

        &--openlibrary {
          grid-area: 8 / 3 / 9 / 4;
        }

        &--goodreads {
          grid-area: 9 / 3 / 10 / 4;
        }
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

  .commonTags {
    &__title {
      font-size: 0.9rem;
      color: var(--c-text-muted);
    }

    &__tags {
      margin-top: 0.25rem;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
  }
</style>
