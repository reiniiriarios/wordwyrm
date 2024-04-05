<script lang="ts">
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";
  export let book: Book = {} as Book;
</script>

<div class="moreinfo">
  {#if book.ids.googleBooksId}
    <a class="btn" href={`https://www.google.com/books/edition/_/${book.ids.googleBooksId}`} target="_blank">
      Google Books
      <ArrowSquareOut />
    </a>
  {:else if book.ids.isbn}
    <a class="btn" href={`https://www.google.com/search?tbo=p&tbm=bks&q=isbn:${book.ids.isbn}`} target="_blank">
      Google Books
      <ArrowSquareOut />
    </a>
  {/if}

  {#if book.ids.goodreadsId}
    <a class="btn" href={`https://goodreads.com/book/show/${book.ids.goodreadsId}`} target="_blank">
      Goodreads
      <ArrowSquareOut />
    </a>
  {:else if book.ids.isbn}
    <a class="btn" href={`https://goodreads.com/search?q=${book.ids.isbn}`} target="_blank">
      Goodreads
      <ArrowSquareOut />
    </a>
  {/if}

  {#if book.ids.openLibraryId}
    <a class="btn" href={`https://openlibrary.org/${book.ids.openLibraryId}`} target="_blank">
      OpenLibrary
      <ArrowSquareOut />
    </a>
  {/if}
</div>

<style lang="scss">
  .moreinfo {
    display: inline-flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }
</style>
