<script lang="ts">
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";
  export let book: Book = {} as Book;
  let searchTitle: string;
  let searchAuthor: string;
  let googleSearch: string;
  $: searchTitle = encodeURIComponent(book.title).replace(/%20/g, "+");
  $: searchAuthor = encodeURIComponent(book.authors.map((a) => a.name).join(", ")).replace(/%20/g, "+");
  $: if (!book.ids.googleBooksId) {
    googleSearch = `intitle:${book.title
      .trim()
      .split(" ")
      .map((t) => encodeURIComponent(t))
      .join("+intitle:")}+inauthor:${book.authors
      .map((a) =>
        a.name
          .trim()
          .split(" ")
          .map((n) => encodeURIComponent(n))
          .join("+inauthor:"),
      )
      .join("+inauthor:")}`;
  }
</script>

<div class="moreinfo">
  {#if book.ids.googleBooksId}
    <a class="btn" href={`https://www.google.com/books/edition/_/${book.ids.googleBooksId}`} target="_blank">
      Google Books
      <span class="icon"><ArrowSquareOut /></span>
    </a>
  {:else}
    <a class="btn" href={`https://www.google.com/search?tbo=p&tbm=bks&q=${googleSearch}`} target="_blank">
      Search Google Books
      <span class="icon"><MagnifyingGlass /></span>
    </a>
  {/if}

  {#if book.ids.goodreadsId}
    <a class="btn" href={`https://goodreads.com/book/show/${book.ids.goodreadsId}`} target="_blank">
      Goodreads
      <span class="icon"><ArrowSquareOut /></span>
    </a>
  {:else}
    <a class="btn" href={`https://goodreads.com/search?q=${searchTitle}+by+${searchAuthor}`} target="_blank">
      Search Goodreads
      <span class="icon"><MagnifyingGlass /></span>
    </a>
  {/if}

  {#if book.ids.openLibraryId}
    <a class="btn" href={`https://openlibrary.org/${book.ids.openLibraryId}`} target="_blank">
      OpenLibrary
      <span class="icon"><ArrowSquareOut /></span>
    </a>
  {:else}
    <a class="btn" href={`https://openlibrary.org/search?title=${searchTitle}&author=${searchAuthor}`} target="_blank">
      Search OpenLibrary
      <span class="icon"><MagnifyingGlass /></span>
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
