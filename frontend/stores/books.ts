import { writable } from "svelte/store";
import { catFilters, filterByTag, recentFilters, searchBooks, sortFilters } from "@scripts/sortBooks";

function createBooks() {
  const { set, subscribe, update } = writable({
    allBooks: [],
    filteredBooks: [],
    searchedBooks: [],
    sortedBooks: [],
    filters: {
      sort: "read",
      reverse: false,
      filter: "all",
      tag: "",
      recent: "all",
      search: "",
    },
    view: {
      zoom: "m",
    },
  } as {
    allBooks: Book[];
    filteredBooks: Book[];
    searchedBooks: Book[];
    sortedBooks: Book[];
    filters: {
      sort: string;
      reverse: boolean;
      filter: string;
      tag: string;
      recent: string;
      search: string;
    };
    view: {
      zoom: "s" | "m" | "l";
    };
  });

  const rmListenerBooks = window.electronAPI.receiveAllBooks((b: Book[]) => {
    console.log("received books");
    update((s) => {
      s.allBooks = b;
      return s;
    });
    books.applyFilter();
  });

  return {
    set,
    subscribe,
    destroy: () => {
      rmListenerBooks();
    },
    fetch: () => {
      console.log("fetching books");
      window.electronAPI.readAllBooks();
    },
    addBook: (newBook: Book) => {
      console.log("adding book", newBook.title);
      update((s) => {
        s.allBooks.push(newBook);
        return s;
      });
      books.applyFilter();
    },
    updateBook: (updatedBook: Book, prevFilePath?: string) => {
      console.log("updating book", updatedBook.title);
      update((s) => {
        s.allBooks = s.allBooks.map((b) => {
          if (b.cache.filepath === prevFilePath) {
            return updatedBook;
          }
          return b;
        });
        return s;
      });
      books.applyFilter();
    },
    deleteBook: (removeBook: Book) => {
      console.log("deleteing book", removeBook.title);
      update((s) => {
        s.allBooks = s.allBooks.filter((b) => b.cache.filepath !== removeBook.cache.filepath);
        return s;
      });
      books.applyFilter();
    },
    sort: (method?: string) => {
      console.log("sorting books");
      // sort what is already filtered, then searched through
      update((s) => {
        if (method && !!sortFilters[method]) s.filters.sort = method;
        else if (!sortFilters[s.filters.sort]) return s;
        s.sortedBooks = sortFilters[s.filters.sort].sort(structuredClone(s.searchedBooks), s.filters.reverse);
        return s;
      });
    },
    sortReverse: () => {
      console.log("reversing books");
      update((s) => {
        s.filters.reverse = !s.filters.reverse;
        s.sortedBooks = s.sortedBooks.reverse();
        return s;
      });
    },
    search: () => {
      console.log("searching books");
      update((s) => {
        s.searchedBooks = searchBooks(structuredClone(s.filteredBooks), s.filters.search);
        return s;
      });
      books.sort();
    },
    clearSearch: () => {
      console.log("clearing book search");
      update((s) => {
        s.filters.search = "";
        s.searchedBooks = structuredClone(s.filteredBooks);
        return s;
      });
      books.sort();
    },
    catFilter: (cat: string) => {
      if (!catFilters[cat]) return;
      update((s) => {
        s.filters.filter = cat;
        s.filters.tag = "";
        return s;
      });
      books.applyFilter();
    },
    tagFilter: (tag: string) => {
      update((s) => {
        s.filters.filter = "";
        s.filters.tag = tag;
        return s;
      });
      books.applyFilter();
    },
    recentFilter: (r: string) => {
      if (!recentFilters[r]) return;
      update((s) => {
        s.filters.recent = r;
        return s;
      });
      books.applyFilter();
    },
    applyFilter: () => {
      console.log("applying books filter");
      update((s) => {
        let books: Book[] = recentFilters[s.filters.recent].filter(structuredClone(s.allBooks));
        if (s.filters.filter) {
          books = catFilters[s.filters.filter].filter(books);
        } else if (s.filters.tag) {
          books = filterByTag(books, s.filters.tag);
        }
        s.filteredBooks = books;
        return s;
      });
      books.search();
    },
  };
}
export const books = createBooks();
