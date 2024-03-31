<script lang="ts">
  import { SearchResult } from "@api/imagesearch";
  import Modal from "@components/modal.svelte";
  import { Book } from "@data/book";
  import { onMount } from "svelte";
  import { push } from "svelte-spa-router";

  export let book: Book = {} as Book;
  export let selectedImageUrl: string = "";

  let isOpen: boolean = false;
  let canAdd: boolean = false;
  let results: SearchResult[] = [];

  function openDialog() {
    isOpen = true;
    canAdd = false;
    selectedImageUrl = "";
  }

  onMount(() => {
    window.electronAPI.imageSearch(book.title, book.authors.map((a) => a.name).join(", "));
  });

  window.electronAPI.imageSearchResults((res: SearchResult[]) => (results = res));

  function selectImage(img: string) {
    selectedImageUrl = img;
    canAdd = true;
  }

  function addImage() {
    window.electronAPI.addBookImage(book.authorDir ?? "", book.filename, selectedImageUrl);
  }

  window.electronAPI.bookImageAdded(() => {
    isOpen = false;
    push(`#/book/${book.authorDir}/${book.filename}`);
  });
</script>

<button type="button" class="btn" on:click={openDialog}>Search for Image</button>
<Modal bind:open={isOpen} heading="Search for Book" confirmWord="Add" on:confirm={addImage} bind:canConfirm={canAdd}>
  <div class="results">
    {#each results as res}
      <button class="result" class:selected={res.image === selectedImageUrl} on:click={() => selectImage(res.image)}>
        <div class="image">
          <img src={res.image} alt="" />
        </div>
        <div class="details">
          {res.width} x {res.height}
        </div>
      </button>
    {/each}
  </div>
</Modal>

<style lang="scss">
  @import "../../style/variables";

  .results {
    padding: 0.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0.5rem;
    overflow-y: auto;
    height: 95%;
    scrollbar-width: thin;
    scrollbar-color: $bgColorLightest transparent;
  }

  .result {
    height: 14rem;
    cursor: pointer;
    background-color: transparent;
    color: $fgColor;
    border: 0;
    padding: 0;
    margin: 0;

    .image {
      height: 80%;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        max-width: 100%;
        max-height: 100%;
        border: 2px solid transparent;
      }
    }

    .details {
      padding: 0.25rem;
      text-align: center;
    }

    &.selected {
      .image {
        img {
          border-color: $accentColor;
        }
      }
    }
  }
</style>
