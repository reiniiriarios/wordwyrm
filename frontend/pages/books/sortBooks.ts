import { Book } from "@data/book";

type filterFn = (books: Book[]) => Book[];

export const sortFilters: Record<string, { name: string; sort: filterFn }> = {
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

export const catFilters: Record<string, { name: string; filter: filterFn }> = {
  all: {
    name: "All",
    filter: (books: Book[]): Book[] => books,
  },
  fiction: {
    name: "Fiction",
    filter: (books: Book[]): Book[] =>
      books.filter((book) => {
        let tags = book.tags.map((t) => t.toLowerCase());
        return !tags.includes("non-fiction") && !tags.includes("nonfiction");
      }),
  },
  nonFiction: {
    name: "Non-Fiction",
    filter: (books: Book[]): Book[] =>
      books.filter((book) => {
        let tags = book.tags.map((t) => t.toLowerCase());
        return tags.includes("non-fiction") || tags.includes("nonfiction");
      }),
  },
  scienceFiction: {
    name: "Science Fiction",
    filter: (books: Book[]): Book[] =>
      books.filter((book) => {
        let tags = book.tags.map((t) => t.toLowerCase());
        return tags.includes("science fiction") || tags.includes("scifi");
      }),
  },
  fantasy: {
    name: "Fantasy",
    filter: (books: Book[]): Book[] =>
      books.filter((book) => {
        let tags = book.tags.map((t) => t.toLowerCase());
        return tags.includes("fantasy");
      }),
  },
};
