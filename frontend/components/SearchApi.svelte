<script lang="ts">
  import Modal from "@components/Modal.svelte";
  import { onMount, tick } from "svelte";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
  import { books } from "@stores/books";

  let addBookOpen: boolean = false;
  let selectedBook: Book = {} as Book;
  let searchString: string = "";
  let searchResults: Book[] = [];
  let searched: boolean = false;
  let searching: boolean = false;
  let canAdd: boolean = false;
  let adding: boolean = false;
  let searchInput: HTMLInputElement;
  let elSearchResults: HTMLDivElement;
  let shadowTopOpacity: number = 0;
  let shadowBottomOpacity: number = 0;

  function openDialog() {
    window.addEventListener("keydown", searchKey);
    addBookOpen = true;
    searchString = "";
    searchResults = [];
    searched = false;
    searching = false;
    canAdd = false;
    adding = false;
    shadowTopOpacity = 0;
    shadowBottomOpacity = 0;
    tick().then(() => searchInput.focus());
  }

  function search() {
    searching = true;
    window.electronAPI.searchBook(searchString);
  }

  function searchKey(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key) && !canAdd) {
      console.log("searching api");
      search();
    }
  }

  function resultsScroll() {
    let currentScroll = elSearchResults.scrollTop / (elSearchResults.scrollHeight - elSearchResults.offsetHeight);
    shadowTopOpacity = currentScroll;
    shadowBottomOpacity = 1 - currentScroll;
  }

  onMount(() => {
    const removeSearchListener = window.electronAPI.searchBookResults((books: Book[]) => {
      searchResults = books;
      searching = false;
      searched = true;
      setTimeout(resultsScroll, 50);
    });

    const removeReceiveListener = window.electronAPI.receiveBookData((book: Book) => {
      window.electronAPI.saveBook(book);
    });

    const removeSavedListener = window.electronAPI.bookSaved((book: Book) => {
      addBookOpen = false;
      adding = false;
      books.addBook(book);
    });

    return () => {
      window.removeEventListener("keydown", searchKey);
      removeSearchListener();
      removeReceiveListener();
      removeSavedListener();
    };
  });

  function selectBook(book: Book) {
    selectedBook = book;
    canAdd = true;
  }

  function addBook() {
    if (!selectedBook.cache?.searchId) return;
    canAdd = false;
    adding = true;
    window.removeEventListener("keydown", searchKey);
    window.electronAPI.getBookData(selectedBook);
  }

  function closeSearch() {
    window.removeEventListener("keydown", searchKey);
  }
</script>

<button type="button" class="btn" on:click={openDialog}
  >Search for Book <span class="icon"><MagnifyingGlass /></span></button
>
<Modal
  bind:open={addBookOpen}
  heading="Search for Book"
  confirmWord="Add"
  loading={adding}
  on:confirm={addBook}
  on:cancel={closeSearch}
  bind:canConfirm={canAdd}
>
  <div class="searchArea">
    <div class="search">
      <input type="text" name="search" bind:this={searchInput} bind:value={searchString} required />
      <button class="btn btn--light" on:click={search} disabled={searching}>Search</button>
    </div>
    {#if searched && !searchResults.length}
      <div class="err">Error fetching results</div>
    {:else}
      <div class="searchResults" bind:this={elSearchResults} on:scroll={resultsScroll}>
        <div class="shadow shadow__top" style:opacity={shadowTopOpacity}></div>
        <div class="shadow shadow__bottom" style:opacity={shadowBottomOpacity}></div>
        <div class="searchResults__results">
          {#each searchResults as book}
            <div class="book" class:selected={selectedBook.cache?.searchId === book.cache.searchId}>
              {#if book.images.hasImage}
                <button class="book__inner book__inner--image" on:click={() => selectBook(book)}>
                  <img src={book.cache.thumbnail?.replace(/^http:/, "https:")} alt="" />
                </button>
              {:else}
                <button class="book__inner book__inner--noimage" on:click={() => selectBook(book)}>
                  <span>{book.title} by {book.authors.map((a) => a.name).join(", ")}</span>
                </button>
              {/if}
              <div class="book__meta">
                {book.datePublished}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</Modal>

<style lang="scss">
  .searchArea {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    height: 100%;
  }

  .search {
    display: flex;
    width: 100%;

    input[type="text"] {
      margin-right: 0.5rem;
      width: 100%;
    }
  }

  .err {
    padding: 2rem;
  }

  .searchResults {
    position: relative;
    margin: 0.5rem 0;
    width: 100%;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--c-subtle) transparent;

    .shadow {
      position: sticky;
      left: 0;
      z-index: 100;
      width: 100%;
      height: 1.25rem;

      &__top {
        top: 0;
        background: radial-gradient(55% 1rem at top center, rgba(0, 0, 0, 67%) 0%, transparent 100%);
      }

      &__bottom {
        top: calc(100% - 1.25rem);
        background: radial-gradient(55% 1rem at bottom center, rgba(0, 0, 0, 67%) 0%, transparent 100%);
      }
    }

    &__results {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr;
      gap: 0.5rem;
    }
  }

  .book {
    height: 14rem;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    &__inner {
      height: 14rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      background-color: transparent;
      border: none;
      padding: 0;
      margin: 0;

      &--image {
        max-width: 9rem;

        img {
          max-height: 100%;
          max-width: 9rem;
          border: 2px solid transparent;
        }

        &:hover img {
          border-color: var(--c-image-select);
        }
      }

      &--noimage {
        width: 9rem;
        background-color: var(--c-subtle);
        border: 2px solid transparent;

        &:hover {
          border-color: var(--c-image-select);
        }
      }
    }

    &__meta {
      font-size: 0.9rem;
      color: var(--c-text-muted);
    }

    &.selected {
      .book__inner {
        &--image img,
        &--noimage {
          border-color: var(--c-image-select);
        }
      }
    }
  }
</style>
