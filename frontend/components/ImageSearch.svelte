<script lang="ts">
  import log from "electron-log/renderer";
  import { createEventDispatcher, onMount } from "svelte";
  import ImageSquare from "phosphor-svelte/lib/ImageSquare";
  import { books } from "@stores/books";
  import Modal from "@components/Modal.svelte";
  import ScrollBox from "./ScrollBox.svelte";

  export let book: Book = {} as Book;
  export let selectedImageUrl: string = "";

  type SearchResult = {
    image: string;
    width: number;
    height: number;
    thumbnail: string;
  };

  let isOpen: boolean = false;
  let canAdd: boolean = false;
  let results: SearchResult[] = [];
  let searching: boolean = true;
  let saving: boolean = false;
  let err: string = "";
  let page: number = 0;

  const dispatch = createEventDispatcher();

  function openDialog() {
    isOpen = true;
    canAdd = false;
    selectedImageUrl = "";
    results = [];
    err = "";
    page = 0;
    saving = false;
    search();
  }

  function search() {
    searching = true;
    log.debug("searching page", page);
    window.electronAPI.imageSearch(book.title, book.authors.map((a) => a.name).join(", "), page);
  }

  onMount(() => {
    const removeImageSearchListener = window.electronAPI.imageSearchResults((res: SearchResult[] | string) => {
      if (typeof res === "string") {
        err = res ?? "Unknown error";
      } else if (res && res.length > 0) {
        results = res;
      } else {
        err = "No results";
      }
      searching = false;
    });

    const removeBookImageListener = window.electronAPI.bookImageAdded(() => {
      isOpen = false;
      canAdd = true;
      saving = false;
      book.images.imageUpdated = new Date().getTime();
      book.images.hasImage = true;
      if (!book.cache.filepath) {
        book.cache.filepath = `${book.cache.authorDir}/${book.cache.filename}`;
      }
      if (!book.cache.urlpath) {
        book.cache.urlpath = book.cache.filepath.replace(/ /g, "%20");
      }
      books.updateBook(book);
      dispatch("add");
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
    saving = true;
    canAdd = false;
    window.electronAPI.addBookImage(book, selectedImageUrl);
  }

  function nextPage() {
    page++;
    search();
  }

  function prevPage() {
    page--;
    search();
  }
</script>

<button type="button" class="btn" on:click={openDialog}>
  Search for Image <span class="icon"><ImageSquare /></span>
</button>
<Modal
  bind:open={isOpen}
  heading="Search for Cover Image"
  confirmWord="Save"
  on:confirm={addImage}
  bind:canConfirm={canAdd}
  loading={saving}
  maxHeight="38rem"
>
  <div class="imageSearchResults">
    {#if err}
      <div class="err">{err}</div>
    {/if}
    {#if searching}
      <div class="searching">Searching...</div>
    {:else}
      <div class="resultsContainer">
        <ScrollBox>
          <div class="results">
            {#each results as res}
              <button
                class="result"
                class:selected={res.image === selectedImageUrl}
                on:click={() => selectImage(res.image)}
              >
                <div class="image">
                  <img src={res.thumbnail} alt="" />
                </div>
                <div class="details">
                  {res.width} x {res.height}
                </div>
              </button>
            {/each}
          </div>
        </ScrollBox>
      </div>
    {/if}
    {#if !searching}
      <div class="nextPage">
        <button class="btn btn--light" disabled={page === 0} on:click={prevPage}>Previous Page</button>
        <button class="btn btn--light" disabled={page === 9 || results?.length < 10} on:click={nextPage}
          >Next Page</button
        >
      </div>
    {/if}
  </div>
</Modal>

<style lang="scss">
  .imageSearchResults {
    --results-nav-height: 4rem;

    height: 100%;

    .resultsContainer {
      height: calc(100% - var(--results-nav-height));
      max-height: 27rem;
    }

    .results {
      padding: 0.5rem;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
      gap: 0.5rem;
    }

    .result {
      height: 12rem;
      cursor: pointer;
      background-color: transparent;
      color: var(--c-text);
      border: 0;
      padding: 0;
      margin: 0;

      .image {
        display: flex;
        justify-content: center;
        align-items: center;
        max-height: 10rem;

        img {
          max-width: 100%;
          max-height: 10rem;
          box-shadow: 0.25rem 0.25rem 0.5rem 0 var(--shadow-1);
        }
      }

      .details {
        padding: 0.5rem;
        text-align: center;
      }

      &.selected {
        .image {
          img {
            outline: 0.25rem solid var(--c-image-select);
          }
        }
      }
    }

    .nextPage {
      height: var(--results-nav-height);
      padding: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }
  }
</style>
