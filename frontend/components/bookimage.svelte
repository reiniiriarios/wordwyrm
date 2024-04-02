<script lang="ts">
  import { Book } from "@data/book";

  export let book: Book;
  export let overlay: boolean = false;
  let src: string;
  $: src = `bookimage://${book.authorDir?.replace(/ /g, "%20")}/${book.filename.replace(/ /g, "%20")}.jpg?t=${book.imageUpdated ?? 0}`;
</script>

{#if book && book.hasImage}
  {#key book.imageUpdated}
    {#if overlay}
      <div class="bookComposite">
        <img {src} alt="" />
      </div>
    {:else}
      <img {src} alt="" />
    {/if}
  {/key}
{/if}

<style lang="scss">
  img {
    max-height: 100%;
    max-width: 100%;
  }
</style>
