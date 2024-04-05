import fetch from "electron-fetch";

// https://openlibrary.org/dev/docs/api/search

const endpoint = "https://openlibrary.org/";
const imgEndpoint = "https://covers.openlibrary.org/b/";
// authorEndpoint: https://covers.openlibrary.org/a/olid/

type OpenLibrarySearchResult = {
  key: string;
  title: string;
  author_alternative_name: string[];
  author_key: string[];
  author_name: string[];
  isbn: string[];
  first_publish_year: number | null;
  publish_date: string[];
  publish_year: number[];
  cover_edition_key: string;
  cover_i: number;
  ia: string[];
  oclc: string[];
  id_librarything: string[];
  id_goodreads: string[];
  id_amazon: string[];
  id_google: string[];
  id_wikidata: string[];
};

type OpenLibrarySearchResponse = {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OpenLibrarySearchResult[];
};

type OpenLibraryWork = {
  title: string;
  key: string;
  authors: {
    author: {
      key: string;
    };
    type: {
      key: string;
    };
  }[];
  description: string;
  covers: number[];
};

type OpenLibraryEdition = {
  key: string;
  title: string;
  full_title: string;
  authors: {
    key: string;
  }[];
  isbn_13: string[];
  isbn_10: string[];
  publish_date: string;
  identifiers: {
    [name: string]: string[];
    // goodreads
    // librarything
    // ..?
  };
  source_records: string[]; // "name:id", e.g. "amazon:1234"
  works: {
    key: string;
  }[];
  covers: number[];
};

type OpenLibraryEditions = {
  links: {
    self: string;
    work: string;
    next: string;
  };
  size: number;
  entries: OpenLibraryEdition[];
};

// @todo: conform
export async function getOpenLibraryWork(olid: string): Promise<OpenLibraryWork | null> {
  try {
    const work: OpenLibraryWork = await fetch(`${endpoint}/works/${olid}.json`)
      .then((res) => res.json())
      .then((json: OpenLibraryWork) => json)
      .catch((e) => {
        throw e;
      });
    return work;
  } catch (e) {
    console.error("getOpenLibraryWork", e);
  }
  return null;
}

// @todo: conform
export async function getOpenLibraryEditions(olid: string): Promise<OpenLibraryEdition[] | null> {
  try {
    const editions: OpenLibraryEdition[] = await fetch(`${endpoint}/works/${olid}/editions.json`)
      .then((res) => res.json())
      .then((json: OpenLibraryEditions) => {
        if (!json.size) throw new Error("No results");
        return json.entries;
      })
      .catch((e) => {
        throw e;
      });
    return editions;
  } catch (e) {
    console.error("getOpenLibraryEditions", e);
  }
  return null;
}

// @todo: conform
export async function getOpenLibraryEditionsByISBN(isbn: string): Promise<OpenLibraryEdition[] | null> {
  try {
    const editions: OpenLibraryEdition[] = await fetch(`${endpoint}/isbn/${isbn}.json`)
      .then((res) => res.json())
      .then((json: OpenLibraryEditions) => {
        if (!json.size) throw new Error("No results");
        return json.entries;
      })
      .catch((e) => {
        throw e;
      });
    return editions;
  } catch (e) {
    console.error("getOpenLibraryEditionsByISBN", e);
  }
  return null;
}

export async function searchOpenLibraryWorkByISBN(isbn: string): Promise<Book | null> {
  try {
    const work: OpenLibrarySearchResult = await fetch(`${endpoint}/search.json?isbn=${isbn}`)
      .then((res) => res.json())
      .then((json: OpenLibrarySearchResponse) => {
        if (!json.numFound) throw new Error("No results");
        return json.docs[0];
      })
      .catch((e) => {
        throw e;
      });
    return conformOpenLibrarySearchResult(work, isbn);
  } catch (e) {
    console.error("searchOpenLibraryWorkByISBN", e);
  }
  return null;
}

export async function searchOpenLibrary(search: string): Promise<Book[]> {
  try {
    const works: OpenLibrarySearchResult[] = await fetch(`${endpoint}/search.json?q=${search}`)
      .then((res) => res.json())
      .then((json: OpenLibrarySearchResponse) => {
        if (!json.numFound) throw new Error("No results");
        return json.docs;
      })
      .catch((e) => {
        throw e;
      });
    if (works.length) {
      return works.map((work) => conformOpenLibrarySearchResult(work));
    }
  } catch (e) {
    console.error("searchOpenLibrary", e);
  }
  return [];
}

function setFirstId(ids: string[] | undefined | null, callback: (id: string) => void) {
  ids?.every((id) => {
    if (id) {
      callback(id);
      return false;
    }
    return true;
  });
}

function conformOpenLibrarySearchResult(work: OpenLibrarySearchResult, isbn?: string): Book {
  const book: Book = {
    version: "2",
    title: work.title,
    authors: work.author_name?.map((name) => ({ name })) ?? [],
    datePublished: (work.first_publish_year ?? work.publish_year?.sort()[0] ?? "").toString(),
    dateRead: "",
    timestampAdded: 0,
    tags: [],
    series: "",
    images: {
      hasImage: false,
    },
    ids: {
      openLibraryId: work.key,
    },
    cache: {
      searchId: work.key,
    },
  };
  if (work.cover_edition_key || work.cover_i) {
    book.images.hasImage = true;
    let imageUrl = imgEndpoint + (work.cover_edition_key ? "olid/" + work.cover_edition_key : "id/" + work.cover_i);
    book.cache.image = imageUrl + "-L.jpg";
    book.cache.thumbnail = imageUrl + "-M.jpg";
  }
  if (isbn) {
    book.ids.isbn = isbn;
  } else {
    setFirstId(work.isbn, (i) => (book.ids.isbn = i));
  }
  setFirstId(work.id_google, (i) => (book.ids.googleBooksId = i));
  setFirstId(work.id_librarything, (i) => (book.ids.libraryThingId = i));
  setFirstId(work.id_amazon, (i) => (book.ids.amazonId = i));
  setFirstId(work.id_goodreads, (i) => (book.ids.goodreadsId = i));
  setFirstId(work.id_wikidata, (i) => (book.ids.wikidataId = i));
  setFirstId(work.oclc, (i) => (book.ids.oclcId = i));
  setFirstId(work.ia, (i) => (book.ids.internetArchiveId = i));
  return book;
}
