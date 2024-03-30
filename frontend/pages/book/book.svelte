<script lang="ts">
  import { Book } from "@data/book";
  import { onMount } from "svelte";

  export let params: { author: string; book: string } = { author: "", book: "" };
  let book: Book;

  onMount(() => {
    window.electronAPI.readBook(params.author, params.book);
  });

  window.electronAPI.receiveBook((b: Book) => (book = b));
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Book</h2>
  <div class="pageNav__actions"><a class="btn" href={`#/book/${params.author}/${params.book}/edit`}>Edit</a></div>
</div>
{#if book}
  <div class="bookPage">
    <div class="bookPage__image">
      {#if book.hasImage}
        <img
          src={`bookimage://${book.authorDir?.replace(" ", "%20")}/${book.filename.replace(" ", "%20")}.jpg`}
          alt=""
        />
      {/if}
    </div>
    <div class="bookPage__info">
      <h2>{book.title}</h2>
      <h3><span>by</span> {book.authors.map((a) => a.name).join(", ")}</h3>
      <h4>
        {book.datePublished
          ? new Date(book.datePublished).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
          : "No publish date listed"}
      </h4>
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
          })}
        {:else}
          Unread
        {/if}
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
      display: flex;
      justify-content: center;
      align-items: flex-start;

      img {
        max-height: 100%;
        max-width: 100%;
      }
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

      .tags {
        margin: 0 0 1rem;
        display: flex;
        gap: 0.25rem;
        justify-content: left;
      }

      .read {
        font-size: 1rem;
      }
    }
  }
</style>
