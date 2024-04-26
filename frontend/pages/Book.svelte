<script lang="ts">
  import { onMount } from "svelte";
  import PencilSimple from "phosphor-svelte/lib/PencilSimple";

  import ScrollBox from "@components/ScrollBox.svelte";
  import BookImage from "@components/BookImage.svelte";
  import Rating from "@components/Rating.svelte";
  import MoreInfo from "@components/MoreInfo.svelte";
  import { books } from "@stores/books";
  import { sortFilters } from "@scripts/sortBooks";
  import { formatDate } from "@scripts/formatDate";
  import { parseMd } from "@scripts/md";

  export let params: { author: string; book: string } = { author: "", book: "" };
  let book: Book;
  let description: string;
  let notes: string;
  let seriesBooks: Book[] = [];

  onMount(() => {
    readBook(params.author, params.book);

    const removeReceiveListener = window.electronAPI.receiveBook((b: Book) => {
      book = b;
      description = parseMd(b.description);
      notes = parseMd(b.notes);
      filterSeries();
    });

    const removeSaveListener = window.electronAPI.bookSaved((b: Book) => {
      book = b;
      description = parseMd(b.description);
      notes = parseMd(b.notes);
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
    <div class="bookPage__image">
      <BookImage {book} overlay pageHeight />
    </div>
    <div class="bookPage__info">
      <ScrollBox>
        <h2 class="bookInfo--title">{book.title}</h2>
        <h3 class="bookInfo--authorBlock">
          <span class="bookInfo--by">by</span>
          <span class="bookInfo--authors">{book.authors.map((a) => a.name).join(", ")}</span>
        </h3>
        <h4 class="bookInfo--published">{book.datePublished ? formatDate(book.datePublished) : "No publish date"}</h4>
        {#if book.rating}
          <div class="bookInfo--rating">
            <Rating rating={book.rating} />
          </div>
        {/if}
        {#if book.series}
          <div class="bookInfo--series">
            <div class="dataTitle">Series</div>
            <span class="bookInfo--seriesName">{book.series}</span>
            {#if book.seriesNumber}
              <span class="bookInfo--seriesNumber">#{book.seriesNumber}</span>
            {/if}
          </div>
          {#if seriesBooks.length}
            <div class="seriesList">
              {#each seriesBooks as sb}
                <div class="seriesList__book">
                  <a
                    href={`#/book/${sb.cache.filepath}`}
                    on:click={() => readBook(sb.cache.authorDir ?? "", sb.cache.filename ?? "")}
                    class="seriesList__inner"
                  >
                    <BookImage book={sb} overlay size="xs" />
                  </a>
                </div>
              {/each}
            </div>
          {/if}
        {/if}
        {#if book.tags}
          <div class="bookInfo--tags">
            {#each book.tags as tag}
              <span class="tag">{tag}</span>
            {/each}
          </div>
        {/if}
        <div class="bookInfo--read">
          {#if book.dateRead}
            <div class="dataTitle">Read</div>
            <span class="bookInfo--readDate">{formatDate(book.dateRead)}</span>
          {:else}
            <span class="unread">Unread</span>
          {/if}
        </div>
        {#if book.description}
          <div class="bookInfo--description">
            <div class="dataTitle">Description</div>
            <div class="bookInfo--descriptionText md">{@html description}</div>
          </div>
        {/if}
        {#if book.notes}
          <div class="bookInfo--notes">
            <div class="dataTitle">Notes</div>
            <div class="bookInfo--notesText">{@html notes}</div>
          </div>
        {/if}
        <div class="bookInfo--moreInfo">
          <MoreInfo {book} />
        </div>
      </ScrollBox>
    </div>
  </div>
{/if}

<style lang="scss">
  .bookPage {
    display: flex;
    padding: 0 1rem 1.25rem;

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
      width: 100%;
      max-width: 60rem;

      .dataTitle {
        font-size: 0.9rem;
        color: var(--c-text-dark);
        margin: 0 0 0.2rem;
      }
    }
  }

  .bookInfo {
    &--title {
      padding: 0;
      margin: 0 0 0.5rem;
      font-size: 2rem;
    }

    &--authorBlock {
      font-size: 1.5rem;
      padding: 0;
      margin: 0 0 0.5rem;
    }

    &--by {
      font-weight: normal;
    }

    &--published {
      font-size: 1rem;
      padding: 0;
      margin: 0 0 1rem;
      font-weight: normal;
    }

    &--rating {
      margin: 0 0 1rem;
    }

    &--series {
      margin: 0 0 1rem;
      font-size: 1rem;
    }

    &--tags {
      margin: 0 0 1rem;
      display: flex;
      gap: 0.25rem;
      justify-content: left;
    }

    &--notes,
    &--description {
      font-size: 1rem;
      padding: 0.5rem 0;
      white-space: pre-line;
    }

    &--read {
      font-size: 1rem;
      padding: 0.5rem 0;

      .unread {
        margin: 0.25rem 0;
      }
    }

    &--moreInfo {
      margin: 1rem 0;
    }
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
  }
</style>
