<script lang="ts">
  import Modal from "@components/Modal.svelte";
  import { push } from "svelte-spa-router";
  import TrashSimple from "phosphor-svelte/lib/TrashSimple";
  import { onMount } from "svelte";
  import { books } from "@stores/books";

  export let book: Book;

  let isOpen: boolean = false;

  function openDialog() {
    isOpen = true;
  }

  onMount(() => {
    const removeDelListener = window.electronAPI.bookDeleted(() => {
      books.deleteBook(book);
      push("#/");
    });

    return () => {
      removeDelListener();
    };
  });

  function deleteBook() {
    window.electronAPI.deleteBook(book);
  }
</script>

<button type="button" class="link link--delete" on:click={openDialog}>Delete Book <TrashSimple /></button>
<Modal bind:open={isOpen} heading="Delete Book" confirmWord="Delete" on:confirm={deleteBook} height="14rem" warning>
  <div class="text">
    {#if book}
      Are you sure you want to delete <strong>{book.title}</strong> by
      <strong>{book.authors.map((a) => a.name).join(", ")}</strong>?
    {/if}
  </div>
</Modal>

<style lang="scss">
  .text {
    padding: 2rem;
  }
</style>
