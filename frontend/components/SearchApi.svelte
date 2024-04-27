<script lang="ts">
  import log from "electron-log/renderer";
  import Modal from "@components/Modal.svelte";
  import { tick } from "svelte";
  import MagnifyingGlass from "phosphor-svelte/lib/MagnifyingGlass";
  import { books } from "@stores/books";
  import ScrollBox from "./ScrollBox.svelte";
  import Spinner from "./Spinner.svelte";

  let addBookOpen: boolean = false;
  let selectedBook: Book = {} as Book;
  let searchString: string = "";
  let searchResults: Book[] = [];
  let searched: boolean = false;
  let searching: boolean = false;
  let canAdd: boolean = false;
  let adding: boolean = false;
  let searchInput: HTMLInputElement;
  let updateScroll: () => void;
  let removeSearchListener: () => void;
  let removeReceiveListener: () => void;
  let removeSavedListener: () => void;

  function openDialog() {
    addBookOpen = true;
    searchString = "";
    searchResults = [];
    searched = false;
    searching = false;
    canAdd = false;
    adding = false;
    tick().then(() => searchInput.focus());

    window.addEventListener("keydown", searchKey);

    removeSearchListener = window.electronAPI.searchBookResults((books: Book[]) => {
      searchResults = books;
      searching = false;
      searched = true;
      setTimeout(updateScroll, 10);
    });

    removeReceiveListener = window.electronAPI.receiveBookData((book: Book) => {
      window.electronAPI.saveBook(book);
    });

    removeSavedListener = window.electronAPI.bookSaved((book: Book) => {
      addBookOpen = false;
      adding = false;
      books.addBook(book);
      removeListeners();
    });
  }

  function removeListeners() {
    removeSavedListener();
    removeReceiveListener();
    removeSearchListener();
    window.removeEventListener("keydown", searchKey);
  }

  function search() {
    if (searchString) {
      searching = true;
      window.electronAPI.searchBook(searchString);
    }
  }

  function searchKey(e: KeyboardEvent) {
    if (["\n", "Enter"].includes(e.key) && !canAdd) {
      log.debug("searching api");
      search();
    }
  }

  function selectBook(book: Book) {
    selectedBook = book;
    canAdd = true;
  }

  function addBook() {
    if (!selectedBook.cache?.searchId) {
      return;
    }
    canAdd = false;
    adding = true;
    window.removeEventListener("keydown", searchKey);
    window.electronAPI.getBookData(selectedBook);
  }
</script>

<button type="button" class="btn btn--searchForBook" on:click={openDialog}>
  Add Book by Search<span class="icon"><MagnifyingGlass /></span>
</button>
<Modal
  flush
  windowClass="search-for-book"
  bind:open={addBookOpen}
  heading="Search for Book"
  confirmWord="Add"
  loading={adding}
  on:confirm={addBook}
  on:cancel={removeListeners}
  bind:canConfirm={canAdd}
>
  <div class="searchArea">
    <div class="search">
      <input type="text" name="search" bind:this={searchInput} bind:value={searchString} required />
      <button class="btn btn--light" on:click={search} disabled={searching}>Search</button>
    </div>
    <div class="searchHeader" aria-hidden={searching || !searched}>
      <div class="searchHeader__cover">&nbsp;</div>
      <div class="searchHeader__title">Title</div>
      <div class="searchHeader__authors">Author(s)</div>
      <div class="searchHeader__datePublished">Publish Date</div>
    </div>
    <div class="searchResults">
      <ScrollBox bind:updateScroll>
        {#if searching}
          <div class="searchLoading">
            <Spinner size="6rem" />
          </div>
        {:else if searched}
          {#if !searchResults.length}
            <div class="err">Error fetching results</div>
          {:else}
            <div class="searchResults__results">
              {#each searchResults as book}
                <button
                  class="book"
                  tabindex="0"
                  role="radio"
                  on:click={() => selectBook(book)}
                  aria-checked={selectedBook?.cache?.searchId === book.cache?.searchId}
                >
                  <div class="book__cover">
                    {#if book.images.hasImage}
                      <img src={book.cache.thumbnail?.replace(/^http:/, "https:")} alt="" />
                    {/if}
                  </div>
                  <div class="book__title">{book.title}</div>
                  <div class="book__authors">{book.authors.map((a) => a.name).join(", ")}</div>
                  <div class="book__datePublished">{book.datePublished}</div>
                </button>
              {/each}
            </div>
          {/if}
        {/if}
      </ScrollBox>
    </div>
  </div>
</Modal>

<style lang="scss">
  .book,
  .searchHeader {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
    user-select: none;
    text-align: left;
    padding: 0;

    &__cover {
      padding-left: 0.5rem;
      width: 6rem;
    }

    &__title {
      width: 24vw;
      max-width: 22rem;
    }

    &__authors {
      width: 22vw;
      max-width: 20rem;
    }

    &__datePublished {
      white-space: nowrap;
      padding-right: 1rem;
      min-width: 7rem;
    }
  }

  .searchHeader {
    height: var(--search-header-height);
    border-bottom: 1px solid var(--c-overlay-border);

    &[aria-hidden="true"] {
      opacity: 0;
      pointer-events: none;
    }
  }

  .searchArea {
    --search-bar-height: 3.25rem;
    --search-header-height: 3rem;

    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: center;
    height: 100%;

    .search {
      display: flex;
      width: 100%;
      height: var(--search-bar-height);
      padding: 0.5rem 0.75rem;

      input[type="text"] {
        margin-right: 0.75rem;
        width: 100%;
        height: 2.25rem;
      }
    }

    .err {
      padding: 2rem;
    }

    .searchLoading {
      padding: 4rem;
      text-align: center;
      color: var(--c-text-muted);
    }

    .searchResults {
      height: calc(100% - var(--search-bar-height) - var(--search-header-height));
      width: 100%;

      &__results {
        .book {
          height: 5rem;
          cursor: pointer;
          background: none;
          border: 0;
          color: var(--c-text);
          background-color: var(--c-table-row);

          &:nth-child(odd) {
            background-color: var(--c-table-row-alt);
          }

          &__cover {
            text-align: center;

            img {
              height: 4rem;
              max-width: 3rem;
              box-shadow: 0.05rem 0.05rem 0.25rem -0.1rem var(--shadow-1);
            }
          }

          &:hover {
            background-color: var(--c-table-hover);
          }

          &[aria-checked="true"] {
            background-color: var(--c-table-row-selected);
          }
        }
      }
    }
  }
</style>
