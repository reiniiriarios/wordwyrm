<script lang="ts">
  import ArrowSquareOut from "phosphor-svelte/lib/ArrowSquareOut";
  export let isbn: string = "";
  export let googleId: string = "";
</script>

{#if googleId}
  <a class="btn" href={`https://www.google.com/books/edition/_/${googleId}`} target="_blank">
    View on Google Books
    <ArrowSquareOut />
  </a>
{:else if isbn}
  <a class="btn" href={`https://www.google.com/search?tbo=p&tbm=bks&q=isbn:${isbn}`} target="_blank">
    View on Google Books
    <ArrowSquareOut />
  </a>
{/if}
{#if isbn}
  <a class="btn" href={`https://www.librarything.com/isbn/${isbn}`} target="_blank">
    View on LibraryThing
    <ArrowSquareOut />
  </a>
  <a class="btn" href={`https://goodreads.com/search?q=${isbn}`} target="_blank">
    View on Goodreads
    <ArrowSquareOut />
  </a>
{/if}
