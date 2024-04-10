<script lang="ts">
  import { books } from "@stores/books";
</script>

<div class="bookCount">
  {#if $books.allBooks.length > 0}
    {#if $books.sortedBooks.length < $books.allBooks.length}
      {$books.sortedBooks.length} <span class="bookCount__sep">/</span>
    {/if}
    <span class:bookCount__mute={$books.sortedBooks.length < $books.allBooks.length}>{$books.allBooks.length}</span> Books
  {/if}
</div>

<style lang="scss">
  .bookCount {
    font-size: 1rem;

    &__sep {
      color: var(--c-text-muted);
      opacity: 0.8;
    }

    &__mute {
      color: var(--c-text-muted);
    }
  }
</style>
