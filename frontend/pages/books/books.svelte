<script lang="ts">
  import { onMount } from "svelte";
  import AddBook from "./add.svelte";
  import SearchBook from "./search.svelte";
  import { Book } from "@data/book";

  let allBooks: Book[] = [];

  function readBooks() {
    window.electronAPI.readAllBooks();
  }

  onMount(() => {
    readBooks();
  });

  window.electronAPI.receiveAllBooks((books: Book[]) => {
    allBooks = books;
  });
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Books</h2>
  <div class="pageNav__actions">
    <AddBook />
    <SearchBook />
  </div>
</div>
<div class="bookList">
  {#each allBooks as book}
    <div class="book">
      {#if book.hasImage}
        <a href={`#/book/${book.filename}`} class="book__inner book__inner--image">
          <img
            src={`bookimage://${book.authorDir?.replace(" ", "%20")}/${book.filename.replace(" ", "%20")}.jpg`}
            alt=""
          />
        </a>
      {:else}
        <a href={`#/book/${book.filename}`} class="book__inner book__inner--noimage">
          {book.title} by {book.authors.map((a) => a.name).join(", ")}
        </a>
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  @import "../../style/variables";

  .bookList {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0.75rem;
    padding: 0.5rem 1rem 1.25rem;
    overflow-y: auto;
    width: 100%;
    height: calc(100vh - $pageNavHeight);
    scrollbar-width: thin;
    scrollbar-color: $bgColorLightest transparent;
  }

  .book {
    height: 30vw;
    display: flex;
    justify-content: center;
    align-items: center;

    &__inner {
      height: 30vw;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-decoration: none;
      color: $fgColor;

      &--image {
        max-width: 20vw;

        img {
          max-height: 100%;
          max-width: 20vw;
          border: 2px solid transparent;
        }

        &:hover img {
          border-color: $accentColor;
        }
      }

      &--noimage {
        width: 9rem;
        background-color: $bgColorLightest;
        border: 2px solid transparent;

        &:hover {
          border-color: $accentColor;
        }
      }
    }
  }
</style>
