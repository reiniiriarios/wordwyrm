<script lang="ts">
  import Modal from "@components/modal.svelte";
  import { push } from "svelte-spa-router";
  import ImageSquare from "phosphor-svelte/lib/ImageSquare";
  import { SearchResult } from "@api/googleimagesearch";
  import { onMount } from "svelte";

  export let book: Book = {} as Book;
  export let selectedImageUrl: string = "";

  let isOpen: boolean = false;
  let canAdd: boolean = false;
  let results: SearchResult[] = [];
  let searching: boolean = true;
  let err: string = "";

  function openDialog() {
    isOpen = true;
    canAdd = false;
    selectedImageUrl = "";
    searching = true;
    results = [];
    err = "";
    window.electronAPI.imageSearch(book.title, book.authors.map((a) => a.name).join(", "));
  }

  onMount(() => {
    const removeImageSearchListener = window.electronAPI.imageSearchResults((res: SearchResult[] | string) => {
      if (typeof res === "string") err = res ?? "Unknown error";
      else if (res && res.length > 0) results = res;
      else err = "No results";
      searching = false;
    });

    const removeBookImageListener = window.electronAPI.bookImageAdded(() => {
      isOpen = false;
      book.images.imageUpdated = new Date().getTime();
      book.images.hasImage = true;
      push(`#/book/${book.cache.filepath}`);
    });

    return () => {
      removeImageSearchListener();
      removeBookImageListener();
    };
  });

  function selectImage(img: string) {
    selectedImageUrl = img;
    canAdd = true;
  }

  function addImage() {
    window.electronAPI.addBookImage(book, selectedImageUrl);
  }
</script>

<button type="button" class="btn" on:click={openDialog}>Search for Image <ImageSquare /></button>
<Modal bind:open={isOpen} heading="Search for Book" confirmWord="Add" on:confirm={addImage} bind:canConfirm={canAdd}>
  <div class="results">
    {#if err}
      <div class="err">{err}</div>
    {/if}
    {#if searching}
      <div class="searching">Searching...</div>
    {:else}
      {#each results as res}
        <button class="result" class:selected={res.image === selectedImageUrl} on:click={() => selectImage(res.image)}>
          <div class="image">
            <img src={res.thumbnail} alt="" />
          </div>
          <div class="details">
            {res.width} x {res.height}
          </div>
        </button>
      {/each}
    {/if}
  </div>
</Modal>

<style lang="scss">
  @import "../../style/variables";

  .results {
    padding: 0.5rem;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
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
