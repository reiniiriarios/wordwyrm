<script lang="ts">
  import { onMount } from "svelte";
  import AddBook from "./add.svelte";
  import SearchBook from "./search.svelte";
  import { Book } from "@data/book";

  let allBooks: Book[] = [];
  let sortedBooks: Book[] = [];

  function readBooks() {
    window.electronAPI.readAllBooks();
  }

  onMount(() => {
    readBooks();
  });

  window.electronAPI.receiveAllBooks((books: Book[]) => {
    allBooks = books;
    currentSort = "author";
    sortedBooks = sortFilters.author.sort(structuredClone(allBooks));
  });

  let currentSort: string = "";

  function sortFilter(i: string, sort: (books: Book[]) => Book[]) {
    currentSort = i;
    sortedBooks = sort(structuredClone(allBooks));
  }

  const sortFilters = {
    author: {
      name: "Author",
      sort: (books: Book[]): Book[] => {
        books.sort((x, y) => {
          let xA = x.authors[0].name.split(" ").pop();
          let yA = y.authors[0].name.split(" ").pop();
          return (xA ?? "").localeCompare(yA ?? "");
        });
        return books;
      },
    },
    title: {
      name: "Title",
      sort: (books: Book[]): Book[] => {
        books.sort((x, y) => {
          let xT = x.title.replace(/^(?:A|An|The) /i, "");
          let yT = y.title.replace(/^(?:A|An|The) /i, "");
          return xT.localeCompare(yT);
        });
        return books;
      },
    },
    datePublished: {
      name: "Publish Date",
      sort: (books: Book[]): Book[] => {
        books.sort((x, y) => {
          let xD = new Date(x.datePublished ?? "").getTime();
          let yD = new Date(y.datePublished ?? "").getTime();
          if (xD < yD) return -1;
          if (xD > yD) return 1;
          return 0;
        });
        return books;
      },
    },
    dateRead: {
      name: "Date Read",
      sort: (books: Book[]): Book[] => {
        books.sort((x, y) => {
          let xD = !x.dateRead ? 0 : new Date(x.dateRead).getTime();
          let yD = !y.dateRead ? 0 : new Date(y.dateRead).getTime();
          if (xD < yD) return -1;
          if (xD > yD) return 1;
          return 0;
        });
        return books;
      },
    },
  };
</script>

<div class="pageNav">
  <h2 class="pageNav__header">Books</h2>
  <div class="pageNav__actions">
    <AddBook />
    <SearchBook />
  </div>
</div>
<div class="listFilter">
  <div class="filter">
    <span>Sort:</span>
    {#each Object.entries(sortFilters) as [i, s]}
      <button on:click={() => sortFilter(i, s.sort)} class:selected={currentSort === i}>{s.name}</button>
    {/each}
  </div>
  <div class="filter">
    <span>Filter:</span>
    <button data-filter="fiction">Fiction</button>
    <button data-filter="nonfiction">Non-Fiction</button>
    <button data-filter="scifi">Science Fiction</button>
    <button data-filter="fantasy">Fantasy</button>
    <button data-filter="nonfiction">Non-Fiction</button>
  </div>
</div>
<div class="bookList">
  {#each sortedBooks as book}
    <div class="book">
      {#if book.hasImage}
        <a href={`#/book/${book.authorDir}/${book.filename}`} class="book__inner book__inner--image">
          <div class="bookComposite">
            <img
              src={`bookimage://${book.authorDir?.replace(/ /g, "%20")}/${book.filename.replace(/ /g, "%20")}.jpg`}
              alt=""
            />
            {#if !book.dateRead}
              <span class="unread">Unread</span>
            {/if}
          </div>
        </a>
      {:else}
        <a href={`#/book/${book.authorDir}/${book.filename}`} class="book__inner book__inner--noimage">
          <span>{book.title}</span>
          <span>by</span>
          <span>{book.authors.map((a) => a.name).join(", ")}</span>
        </a>
      {/if}
    </div>
  {/each}
</div>

<style lang="scss">
  @import "../../style/variables";

  $filterHeight: 3rem;

  .listFilter {
    height: $filterHeight;
    padding: 0.5rem 1rem 1.25rem;
    display: flex;
    gap: 2rem;
    align-items: center;
    justify-content: left;

    .filter {
      display: flex;
      align-items: center;
      justify-content: left;
      gap: 0.25rem;

      button {
        background-color: $bgColorLight;
        color: $fgColor;
        padding: 0.25rem 0.5rem;
        border: 0;
        border-radius: 0.25rem;
        cursor: pointer;

        &.selected {
          background-color: $bgColorLighter;
        }
      }
    }
  }

  .bookList {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 2vw;
    padding: 0.5rem 1rem 1.25rem;
    overflow-y: auto;
    width: 100%;
    height: calc(100vh - $pageNavHeight - $filterHeight);
    scrollbar-width: thin;
    scrollbar-color: $bgColorLightest transparent;
  }

  .book {
    height: 30vw;
    display: flex;
    justify-content: center;
    align-items: center;

    &__inner {
      height: 30vw;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      text-decoration: none;
      color: $fgColor;

      &--image {
        max-width: 20vw;

        .bookComposite {
          height: 30vw;
          transition: 0.2s transform;
        }

        img {
          max-height: 100%;
          max-width: 20vw;
        }

        &:hover .bookComposite {
          transform: scale(1.02);
        }
      }

      &--noimage {
        width: 20vw;
        background-color: $bgColorLightest;
        text-align: center;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        transition: 0.2s transform;

        &:hover {
          transform: scale(1.02);
        }
      }
    }
  }
</style>
