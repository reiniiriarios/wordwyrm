type sortFn = (books: Book[], reverse: boolean) => Book[];
type filterFn = (books: Book[]) => Book[];

export const sortFilters: Record<string, { name: string; sort: sortFn; hidden?: boolean }> = {
  read: {
    name: "Date Read",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        let xD = !x.dateRead ? 9999999999999 : new Date(x.dateRead).getTime();
        let yD = !y.dateRead ? 9999999999999 : new Date(y.dateRead).getTime();
        if (reverse) {
          if (xD < yD) return -1;
          if (xD > yD) return 1;
        } else {
          if (xD > yD) return -1;
          if (xD < yD) return 1;
        }
        return 0;
      });
      return books;
    },
  },
  added: {
    name: "Date Added",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        let xD = x.timestampAdded ?? 0;
        let yD = y.timestampAdded ?? 0;
        if (reverse) {
          if (xD < yD) return -1;
          if (xD > yD) return 1;
        } else {
          if (xD > yD) return -1;
          if (xD < yD) return 1;
        }
        return 0;
      });
      return books;
    },
  },
  author: {
    name: "Author",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        let xA = x.authors[0].name.split(" ").pop();
        let yA = y.authors[0].name.split(" ").pop();
        if (reverse) return (yA ?? "").localeCompare(xA ?? "");
        return (xA ?? "").localeCompare(yA ?? "");
      });
      return books;
    },
  },
  title: {
    name: "Title",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        let xT = x.title.replace(/^(?:A|An|The) /i, "");
        let yT = y.title.replace(/^(?:A|An|The) /i, "");
        if (reverse) return yT.localeCompare(xT);
        return xT.localeCompare(yT);
      });
      return books;
    },
  },
  published: {
    name: "Publish Date",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        let xD = (
          x.datePublished?.match(/^\-?\d+$/) ? new Date(+x.datePublished, 1, 1) : new Date(x.datePublished ?? "")
        ).getTime();
        let yD = (
          y.datePublished?.match(/^\-?\d+$/) ? new Date(+y.datePublished, 1, 1) : new Date(y.datePublished ?? "")
        ).getTime();
        if (reverse) {
          if (xD > yD) return -1;
          if (xD < yD) return 1;
        } else {
          if (xD < yD) return -1;
          if (xD > yD) return 1;
        }
        return 0;
      });
      return books;
    },
  },
  rating: {
    name: "Rating",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        let xR = x.rating ?? 0;
        let yR = y.rating ?? 0;
        if (reverse) {
          if (xR > yR) return -1;
          if (xR < yR) return 1;
        } else {
          if (xR > yR) return -1;
          if (xR < yR) return 1;
        }
        // ratings are often similar, go to author name after that
        let xA = x.authors[0].name.split(" ").pop();
        let yA = y.authors[0].name.split(" ").pop();
        if (reverse) return (yA ?? "").localeCompare(xA ?? "");
        return (xA ?? "").localeCompare(yA ?? "");
      });
      return books;
    },
  },
  series: {
    name: "Series",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        let xS = x.series?.replace(/^(?:A|An|The) /i, "") ?? "";
        let yS = y.series?.replace(/^(?:A|An|The) /i, "") ?? "";
        if (xS && !yS) return -1;
        if (!xS && yS) return 1;
        if (reverse) return yS.localeCompare(xS);
        return xS.localeCompare(yS);
      });
      return books;
    },
    hidden: true,
  },
  tags: {
    name: "Tags",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        if (reverse) {
          if (x.tags.length < y.tags.length) return -1;
          if (x.tags.length > y.tags.length) return 1;
        } else {
          if (x.tags.length > y.tags.length) return -1;
          if (x.tags.length < y.tags.length) return 1;
        }
        let xT = x.tags.join(" ");
        let yT = y.tags.join(" ");
        if (reverse) return yT.localeCompare(xT);
        return xT.localeCompare(yT);
      });
      return books;
    },
    hidden: true,
  },
};

export const catFilters: Record<string, { name: string; filter: filterFn }> = {
  all: {
    name: "All Books",
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
};

export function filterByTag(books: Book[], tag: string): Book[] {
  return books.filter((book) => {
    let tags = book.tags.map((t) => t.toLowerCase());
    return tags.includes(tag.toLowerCase());
  });
}

function yearsAgo(books: Book[], years: number, reverse: boolean = false): Book[] {
  let yearsAgo = new Date();
  yearsAgo.setFullYear(yearsAgo.getFullYear() - years);
  let timeAgo = yearsAgo.getTime();
  return books.filter((book) => {
    if (!book.dateRead) return false;
    let diff = new Date(book.dateRead).getTime() - timeAgo;
    return reverse ? diff < 0 : diff > 0;
  });
}

export const recentFilters: Record<string, { name: string; filter: filterFn }> = {
  all: {
    name: "All Books",
    filter: (books: Book[]): Book[] => books,
  },
  allRead: {
    name: "All Read",
    filter: (books: Book[]): Book[] => books.filter((book) => book.dateRead),
  },
  allUnread: {
    name: "All Unread",
    filter: (books: Book[]): Book[] => books.filter((book) => !book.dateRead),
  },
  readThis: {
    name: "This Year",
    filter: (books: Book[]): Book[] => {
      let thisYearJan1 = new Date();
      thisYearJan1.setMonth(0);
      thisYearJan1.setDate(1);
      let timeAgo = thisYearJan1.getTime();
      return books.filter((book) => {
        if (!book.dateRead) return false;
        let diff = new Date(book.dateRead).getTime() - timeAgo;
        return diff > 0;
      });
    },
  },
  read1: {
    name: "Last 1 Year",
    filter: (books: Book[]): Book[] => yearsAgo(books, 1),
  },
  read2: {
    name: "Last 2 Years",
    filter: (books: Book[]): Book[] => yearsAgo(books, 2),
  },
  read5: {
    name: "Last 5 Years",
    filter: (books: Book[]): Book[] => yearsAgo(books, 5),
  },
  read5rev: {
    name: "> 5 Years Ago",
    filter: (books: Book[]): Book[] => yearsAgo(books, 5, true),
  },
};

export function searchBooks(books: Book[], search: string): Book[] {
  if (!search) return books;
  search = search.toLowerCase();
  return structuredClone(books).filter((b) => {
    return (
      b.title.toLowerCase().includes(search) ||
      b.authors
        .map((a) => a.name)
        .join(",")
        .toLowerCase()
        .includes(search) ||
      b.series?.toLowerCase().includes(search)
    );
  });
}
