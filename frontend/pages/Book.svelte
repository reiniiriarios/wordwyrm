<script lang="ts">
  import log from "electron-log/renderer";
  import { onMount } from "svelte";
  import PencilSimple from "phosphor-svelte/lib/PencilSimple";

  import BookImage from "@components/BookImage.svelte";
  import Rating from "@components/Rating.svelte";
  import MoreInfo from "@components/MoreInfo.svelte";
  import { books } from "@stores/books";
  import { sortFilters } from "@scripts/sortBooks";
  import { formatDate } from "@scripts/formatDate";

  export let params: { author: string; book: string } = { author: "", book: "" };
  let book: Book;
  let seriesBooks: Book[] = [];

  onMount(() => {
    readBook(params.author, params.book);

    const removeReceiveListener = window.electronAPI.receiveBook((b: Book) => {
      log.debug("book/", params);
      book = b;
      filterSeries();
    });

    const removeSaveListener = window.electronAPI.bookSaved((b: Book) => {
      book = b;
      filterSeries();
    });

    return () => {
      removeReceiveListener();
      removeSaveListener();
    };
  });

  function readBook(a: string, b: string) {
    window.electronAPI.readBook(a, b);
  }

  function filterSeries() {
    seriesBooks = [];
    $books.allBooks.forEach((b) => {
      if (
        b.authors.map((a) => a.name).join(",") === book.authors.map((a) => a.name).join(",") &&
        b.series === book.series
      ) {
        seriesBooks.push(b);
      }
    });
    seriesBooks = sortFilters.published.sort(seriesBooks, false);
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Book</h2>
  <div class="pageNav__actions">
    <a class="btn" href={`#/book/${params.author}/${params.book}/edit`}
      >Edit <span class="icon"><PencilSimple /></span></a
    >
  </div>
</div>
{#if book}
  <div class="pageWrapper bookPage">
    {#if book.images.hasImage}
      <div class="bookPage__image">
        <BookImage {book} overlay pageHeight />
      </div>
    {/if}
    <div class="bookPage__info">
      <h2>{book.title}</h2>
      <h3><span>by</span> {book.authors.map((a) => a.name).join(", ")}</h3>
      <h4>{book.datePublished ? formatDate(book.datePublished) : "No publish date"}</h4>
      {#if book.rating}
        <div class="rating">
          <Rating rating={book.rating} />
        </div>
      {/if}
      {#if book.series}
        <div class="series">
          <div class="dataTitle">Series</div>
          {book.series}
          {book.seriesNumber ? "#" + book.seriesNumber : ""}
        </div>
        {#if seriesBooks.length}
          <div class="seriesList">
            {#each seriesBooks as sb}
              <div class="seriesList__book">
                {#if sb.images.hasImage}
                  <a
                    href={`#/book/${sb.cache.filepath}`}
                    on:click={() => readBook(sb.cache.authorDir ?? "", sb.cache.filename ?? "")}
                    class="seriesList__inner seriesList__inner--image"
                  >
                    <BookImage book={sb} overlay />
                  </a>
                {:else}
                  <a
                    href={`#/book/${sb.cache.filepath}`}
                    on:click={() => readBook(sb.cache.authorDir ?? "", sb.cache.filename ?? "")}
                    class="seriesList__inner seriesList__inner--noimage"
                  >
                    <span>{sb.title}</span>
                    <span>by</span>
                    <span>{sb.authors.map((a) => a.name).join(", ")}</span>
                  </a>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      {/if}
      {#if book.tags}
        <div class="tags">
          {#each book.tags as tag}
            <span class="tag">{tag}</span>
          {/each}
        </div>
      {/if}
      <div class="read">
        {#if book.dateRead}
          <div class="dataTitle">Read</div>
          {formatDate(book.dateRead)}
        {:else}
          <span class="unread">Unread</span>
        {/if}
      </div>
      {#if book.description}
        <div class="description">
          <div class="dataTitle">Description</div>
          {book.description}
        </div>
      {/if}
      {#if book.notes}
        <div class="notes">
          <div class="dataTitle">Notes</div>
          {book.notes}
        </div>
      {/if}
      <div class="moreInfo">
        <MoreInfo {book} />
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .bookPage {
    display: flex;
    padding: 0 1rem;

    &__image {
      height: 95%;
      min-width: 35vw;
      max-width: 40vw;
      padding: 1rem;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    &__info {
      padding: 1rem;
      overflow-y: auto;
      width: 100%;
      max-width: 60rem;
      scrollbar-width: thin;
      scrollbar-color: var(--c-subtle) transparent;

      .dataTitle {
        font-size: 0.9rem;
        color: var(--c-text-dark);
        margin: 0 0 0.2rem;
      }

      h2 {
        padding: 0;
        margin: 0 0 0.5rem;
        font-size: 2rem;
      }

      h3 {
        font-size: 1.5rem;
        padding: 0;
        margin: 0 0 0.5rem;

        span {
          font-weight: normal;
        }
      }

      h4 {
        font-size: 1rem;
        padding: 0;
        margin: 0 0 1rem;
        font-weight: normal;
      }

      .rating {
        margin: 0 0 1rem;
      }

      .series {
        margin: 0 0 1rem;
        font-size: 1rem;
      }

      .seriesList {
        --book-width: 8rem;
        --book-height: 12rem;

        display: flex;
        flex-wrap: wrap;
        align-items: center;
        justify-content: left;
        margin-bottom: 1rem;

        &__book {
          width: calc(var(--book-width) + 0.5rem);
          height: calc(var(--book-height) + 0.5rem);
          display: flex;
          justify-content: center;
          align-items: center;
        }

        &__inner {
          position: relative;
          cursor: pointer;
          text-decoration: none;
          color: var(--c-text);

          &--image {
            display: flex;
            justify-content: center;
            align-items: center;
            width: var(--book-width);
            height: var(--book-height);
            transition: 0.2s transform;

            &:hover {
              transform: scale(1.02);
            }
          }

          &--noimage {
            width: calc(var(--book-width) - 0.5rem);
            height: calc(var(--book-height) - 0.5rem);
            background-color: var(--c-subtle);
            text-align: center;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            transition: 0.2s transform;

            &:hover {
              transform: scale(1.02);
            }
          }
        }
      }

      .tags {
        margin: 0 0 1rem;
        display: flex;
        gap: 0.25rem;
        justify-content: left;
      }

      .notes,
      .description {
        font-size: 1rem;
        padding: 0.5rem 0;
        white-space: pre-line;
      }

      .read {
        font-size: 1rem;
        padding: 0.5rem 0;

        .unread {
          margin: 0.25rem 0;
        }
      }

      .moreInfo {
        margin: 1rem 0;
      }
    }
  }
</style>
