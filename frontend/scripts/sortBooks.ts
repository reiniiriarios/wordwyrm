type sortFn = (books: Book[], reverse: boolean) => Book[];
type filterFn = (books: Book[]) => Book[];

export const sortFilters: Record<string, { name: string; sort: sortFn; hidden?: boolean }> = {
  read: {
    name: "Date Read",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        const r = sortValueRead(x, y, reverse);
        if (r !== 0) {
          return r;
        }
        return sortValueDatePublished(x, y, !reverse);
      });
      return books;
    },
  },
  added: {
    name: "Date Added",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        return sortValueN(x.timestampAdded, y.timestampAdded, !reverse); // reverse reverse
      });
      return books;
    },
  },
  author: {
    name: "Author",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        const a = sortValueAuthors(x, y, reverse);
        if (a !== 0) {
          return a;
        }
        return sortValueDatePublished(x, y, reverse);
      });
      return books;
    },
  },
  title: {
    name: "Title",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        const t = sortValueTitle(x, y, reverse);
        if (t !== 0) {
          return t;
        }
        return sortValueAuthors(x, y, reverse);
      });
      return books;
    },
  },
  published: {
    name: "Publish Date",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        const d = sortValueDatePublished(x, y, reverse);
        if (d !== 0) {
          return d;
        }
        return sortValueAuthors(x, y, reverse);
      });
      return books;
    },
  },
  rating: {
    name: "Rating",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        const n = sortValueN(x.rating, y.rating, !reverse); // reverse reverse
        if (n !== 0) {
          return n;
        }
        const a = sortValueAuthors(x, y, reverse);
        if (a !== 0) {
          return a;
        }
        return sortValueDatePublished(x, y, reverse);
      });
      return books;
    },
  },
  series: {
    name: "Series",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        const s = sortValueSeries(x, y, reverse);
        if (s !== 0) {
          return s;
        }
        const a = sortValueAuthors(x, y, reverse);
        if (a !== 0) {
          return a;
        }
        const n = sortValueN(x.seriesNumber, y.seriesNumber, reverse);
        if (n !== 0) {
          return n;
        }
        return sortValueDatePublished(x, y, reverse);
      });
      return books;
    },
    hidden: true,
  },
  tags: {
    name: "Tags",
    sort: (books: Book[], reverse: boolean): Book[] => {
      books.sort((x, y) => {
        return sortValueTags(x, y, reverse);
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
        const tags = book.tags.map((t) => t.toLowerCase());
        return !tags.includes("non-fiction") && !tags.includes("nonfiction");
      }),
  },
  nonFiction: {
    name: "Non-Fiction",
    filter: (books: Book[]): Book[] =>
      books.filter((book) => {
        const tags = book.tags.map((t) => t.toLowerCase());
        return tags.includes("non-fiction") || tags.includes("nonfiction");
      }),
  },
};

export function filterByTag(books: Book[], tag: string): Book[] {
  return books.filter((book) => {
    const tags = book.tags.map((t) => t.toLowerCase());
    return tags.includes(tag.toLowerCase());
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
      const thisYearJan1 = new Date();
      thisYearJan1.setMonth(0);
      thisYearJan1.setDate(1);
      const timeAgo = thisYearJan1.getTime();
      return books.filter((book) => {
        if (!book.dateRead) {
          return false;
        }
        const diff = new Date(book.dateRead).getTime() - timeAgo;
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
  if (!search) {
    return books;
  }
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

function yearsAgo(books: Book[], years: number, reverse: boolean = false): Book[] {
  const yearsAgo = new Date();
  yearsAgo.setFullYear(yearsAgo.getFullYear() - years);
  const timeAgo = yearsAgo.getTime();
  return books.filter((book) => {
    if (!book.dateRead) {
      return false;
    }
    const diff = new Date(book.dateRead).getTime() - timeAgo;
    return reverse ? diff < 0 : diff > 0;
  });
}

function sortValueN(a: number | string, b: number | string, reverse: boolean): number {
  const xN = a ? +a : 0;
  const yN = b ? +b : 0;
  if (reverse) {
    if (xN > yN) {
      return -1;
    }
    if (xN < yN) {
      return 1;
    }
  } else {
    if (xN < yN) {
      return -1;
    }
    if (xN > yN) {
      return 1;
    }
  }
  return 0;
}

function sortValueRead(x: Book, y: Book, reverse: boolean): number {
  const xD = !x.dateRead ? 9999999999999 : new Date(x.dateRead).getTime();
  const yD = !y.dateRead ? 9999999999999 : new Date(y.dateRead).getTime();
  if (reverse) {
    if (xD < yD) {
      return -1;
    }
    if (xD > yD) {
      return 1;
    }
  } else {
    if (xD > yD) {
      return -1;
    }
    if (xD < yD) {
      return 1;
    }
  }
  return 0;
}

function sortValueTitle(x: Book, y: Book, reverse: boolean): number {
  const xT = x.title.replace(/^(?:A|An|The) /i, "");
  const yT = y.title.replace(/^(?:A|An|The) /i, "");
  return reverse ? (yT ?? "").localeCompare(xT ?? "") : (xT ?? "").localeCompare(yT ?? "");
}

function sortValueSeries(x: Book, y: Book, reverse: boolean): number {
  const xS = x.series?.replace(/^(?:A|An|The) /i, "") ?? "";
  const yS = y.series?.replace(/^(?:A|An|The) /i, "") ?? "";
  if (xS && !yS) {
    return -1;
  }
  if (!xS && yS) {
    return 1;
  }
  return reverse ? (yS ?? "").localeCompare(xS ?? "") : (xS ?? "").localeCompare(yS ?? "");
}

function sortValueAuthors(x: Book, y: Book, reverse: boolean): number {
  const xA = x.authors?.[0].name.split(" ").pop();
  const yA = y.authors?.[0].name.split(" ").pop();
  return reverse ? (xA ?? "").localeCompare(yA ?? "") : (yA ?? "").localeCompare(xA ?? "");
}

function sortValueDatePublished(x: Book, y: Book, reverse: boolean): number {
  const xD = (
    x.datePublished?.match(/^-?\d+$/) ? new Date(+x.datePublished, 1, 1) : new Date(x.datePublished ?? "")
  ).getTime();
  const yD = (
    y.datePublished?.match(/^-?\d+$/) ? new Date(+y.datePublished, 1, 1) : new Date(y.datePublished ?? "")
  ).getTime();
  if (reverse) {
    if (xD > yD) {
      return -1;
    }
    if (xD < yD) {
      return 1;
    }
  } else {
    if (xD < yD) {
      return -1;
    }
    if (xD > yD) {
      return 1;
    }
  }
  return 0;
}

function sortValueTags(x: Book, y: Book, reverse: boolean): number {
  if (reverse) {
    if (x.tags.length < y.tags.length) {
      return -1;
    }
    if (x.tags.length > y.tags.length) {
      return 1;
    }
  } else {
    if (x.tags.length > y.tags.length) {
      return -1;
    }
    if (x.tags.length < y.tags.length) {
      return 1;
    }
  }
  const xT = x.tags.join(" ");
  const yT = y.tags.join(" ");
  if (reverse) {
    return yT.localeCompare(xT);
  }
  return xT.localeCompare(yT);
}
