<script lang="ts">
  import { onMount } from "svelte";
  import PencilSimple from "phosphor-svelte/lib/PencilSimple";
  import Bookimage from "@components/bookimage.svelte";
  import ImageSearch from "./imagesearch.svelte";
  import Moreinfo from "./moreinfo.svelte";
  import { sortFilters } from "@pages/books/sortBooks";

  export let params: { author: string; book: string } = { author: "", book: "" };
  let book: Book;
  let allBooks: Book[] = [];
  let seriesBooks: Book[] = [];

  onMount(() => {
    console.log("book/", params);
    readBook(params.author, params.book);

    const removeReceiveListener = window.electronAPI.receiveBook((b: Book) => {
      book = b;
      getSeries();
    });

    const removeSaveListener = window.electronAPI.bookSaved((b: Book) => {
      book = b;
      getSeries();
    });

    const removeAllListener = window.electronAPI.receiveAllBooks((books: Book[]) => {
      allBooks = books;
      filterSeries();
    });

    return () => {
      removeReceiveListener();
      removeSaveListener();
      removeAllListener();
    };
  });

  function readBook(a: string, b: string) {
    window.electronAPI.readBook(a, b);
  }

  function getSeries() {
    if (book.series.length) {
      if (!allBooks.length) {
        window.electronAPI.readAllBooks();
      } else {
        filterSeries();
      }
    }
  }

  function filterSeries() {
    seriesBooks = [];
    allBooks.forEach((b) => {
      if (b.series === book.series) {
        seriesBooks.push(b);
      }
    });
    seriesBooks = sortFilters.published.sort(seriesBooks, false);
  }
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Book</h2>
  <div class="pageNav__actions">
    {#if book && window.userSettings.googleApiKey && window.userSettings.googleSearchEngineId}
      <ImageSearch bind:book />
    {/if}
    <a class="btn" href={`#/book/${params.author}/${params.book}/edit`}>Edit <PencilSimple /></a>
  </div>
</div>
{#if book}
  <div class="bookPage">
    {#if book.images.hasImage}
      <div class="bookPage__image">
        <Bookimage {book} overlay pageHeight />
      </div>
    {/if}
    <div class="bookPage__info">
      <h2>{book.title}</h2>
      <h3><span>by</span> {book.authors.map((a) => a.name).join(", ")}</h3>
      <h4>
        {#if !book.datePublished}
          No publish date
        {:else if book.datePublished.match(/^\d+\-\d+\-\d+$/)}
          {new Date(book.datePublished).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}
        {:else if book.datePublished.match(/^\-\d+$/)}
          {Math.abs(+book.datePublished)} BCE
        {:else}
          {book.datePublished}
        {/if}
      </h4>
      {#if book.series}
        <div class="series">Series: {book.series}</div>
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
                    <Bookimage book={sb} overlay />
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
          Read: {new Date(book.dateRead).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "UTC",
          })}
        {:else}
          <span class="unread">Unread</span>
        {/if}
      </div>
      <div class="moreInfo">
        <Moreinfo {book} />
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
      height: 95%;
      width: 50vw;
      padding: 1rem;
      display: flex;
      justify-content: center;
      align-items: flex-start;
    }

    &__info {
      padding: 1rem;

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
          color: $fgColor;

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
            background-color: $bgColorLightest;
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

      .read {
        font-size: 1rem;
        padding: 0.5rem 0;

        .unread {
          font-size: 0.9rem;
          margin: 0.25rem 0;
          padding: 0.25rem 0.5rem;
          border-radius: 1rem;
          background: linear-gradient(0deg, rgb(5, 140, 8) 0%, rgb(10, 160, 15) 100%);
          box-shadow: rgb(0, 0, 0, 0.3) 0.05rem 0.05rem 0.5rem 0.2rem;
        }
      }

      .moreInfo {
        margin: 1rem 0;
      }
    }
  }
</style>
