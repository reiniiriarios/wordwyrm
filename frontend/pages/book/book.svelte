<script lang="ts">
  import { Book } from "@data/book";
  import { onMount } from "svelte";
  import ImageSearch from "./imagesearch.svelte";
  import PencilSimple from "phosphor-svelte/lib/PencilSimple";
  import Bookimage from "@components/bookimage.svelte";
  import Moreinfo from "./moreinfo.svelte";

  export let params: { author: string; book: string } = { author: "", book: "" };
  let book: Book;

  onMount(() => {
    window.electronAPI.readBook(params.author, params.book);

    const removeReceiveListener = window.electronAPI.receiveBook((b: Book) => (book = b));
    const removeSaveListener = window.electronAPI.bookSaved((b: Book) => (book = b));

    return () => {
      removeReceiveListener();
      removeSaveListener();
    };
  });
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
    {#if book.hasImage}
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
          Unread
        {/if}
      </div>
      <div class="moreInfo">
        <Moreinfo isbn={book.isbn} googleId={book.googleBooksId} />
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

      .tags {
        margin: 0 0 1rem;
        display: flex;
        gap: 0.25rem;
        justify-content: left;
      }

      .read {
        font-size: 1rem;
      }

      .moreInfo {
        margin: 1rem 0;
      }
    }
  }
</style>
