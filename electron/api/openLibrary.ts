import log from "electron-log/main";
import fetch from "electron-fetch";
import WyrmError from "../error";

const endpoint = "https://openlibrary.org/";
const imgEndpoint = "https://covers.openlibrary.org/b/";
// authorEndpoint: https://covers.openlibrary.org/a/olid/

/**
 * Open Library Search Result
 *
 * @see https://openlibrary.org/dev/docs/api/search
 */
type OpenLibrarySearchResult = {
  key: string;
  title: string;
  type: string; // "work" | "edition" | ??
  author_alternative_name: string[];
  author_key: string[];
  author_name: string[];
  isbn: string[];
  first_publish_year: number | null;
  publish_date: string[];
  publish_year: number[];
  cover_edition_key: string;
  cover_i: number;
  ratings_average: number;
  ratings_sortable: number;
  ratings_count: number;
  ia: string[]; // internet archive
  oclc?: string[];
  ddc?: string[]; // dewey decimal
  ddc_sort?: string;
  lcc?: string[]; // library of congress classification
  lcc_sort?: string;
  lccn?: string[]; // library of congress control number
  id_librarything?: string[];
  id_goodreads?: string[];
  id_amazon?: string[];
  id_google?: string[];
  id_wikidata?: string[];
  id_overdrive?: string[];
  id_depósito_legal?: string[];
  id_paperback_swap?: string[];
  id_alibris_id?: string[];
};

/**
 * Open Library Search Response
 *
 * @see https://openlibrary.org/dev/docs/api/search
 */
type OpenLibrarySearchResponse = {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: OpenLibrarySearchResult[];
};

/**
 * Open Library Work
 *
 * @see https://openlibrary.org/dev/docs/api/books
 * @see https://openlibrary.org/dev/docs/api/search
 */
type OpenLibraryWork = {
  type: {
    key: "/type/work";
  };
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

/**
 * Open Library Edition
 *
 * @see https://openlibrary.org/dev/docs/api/books
 * @see https://openlibrary.org/dev/docs/api/search
 */
type OpenLibraryEdition = {
  type: {
    key: "/type/edition";
  };
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
  };
  source_records: string[]; // "name:id", e.g. "amazon:1234"
  works: {
    key: string;
  }[];
  covers: number[];
};

/**
 * Open Library Editions List
 *
 * @see https://openlibrary.org/dev/docs/api/books
 * @see https://openlibrary.org/dev/docs/api/search
 */
type OpenLibraryEditions = {
  links: {
    self: string;
    work: string;
    next: string;
  };
  size: number;
  entries: OpenLibraryEdition[];
};

/**
 * Type guard for Open Library Work.
 *
 * @param {unknown} obj Response data
 * @returns is OpenLibraryWork
 */
function isTypeOpenLibraryWork(obj: unknown): obj is OpenLibraryWork {
  return (
    typeof obj === "object" &&
    "type" in obj &&
    typeof obj.type === "object" &&
    "key" in obj.type &&
    obj.type.key === "/type/work"
  );
}

/**
 * Type guard for Open Library Edition.
 *
 * @param {unknown} obj Response data
 * @returns is OpenLibraryEdition
 */
function isTypeOpenLibraryEdition(obj: unknown): obj is OpenLibraryEdition {
  return (
    typeof obj === "object" &&
    "type" in obj &&
    typeof obj.type === "object" &&
    "key" in obj.type &&
    obj.type.key === "/type/edition"
  );
}

/**
 * Type guard for Open Library Editions Response.
 *
 * @param {unknown} obj Response data
 * @returns is OpenLibraryEditions
 */
function isTypeOpenLibraryEditions(obj: unknown): obj is OpenLibraryEditions {
  return typeof obj === "object" && "size" in obj && "entries" in obj && Array.isArray(obj.entries);
}

/**
 * Type guard for Open Library Search Response.
 *
 * @param {unknown} obj Response data
 * @returns is OpenLibrarySearchResponse
 */
function isTypeOpenLibrarySearchResponse(obj: unknown): obj is OpenLibrarySearchResponse {
  return typeof obj === "object" && "numFound" in obj && "docs" in obj && Array.isArray(obj.docs);
}

/**
 * Get specific Work from Open Library
 *
 * @param olid Open Library Work ID
 * @returns Work
 * @throws WyrmError
 *
 * @todo Conform data
 */
export async function getOpenLibraryWork(olid: string): Promise<OpenLibraryWork> {
  try {
    log.info(`Fetching Open Library Work: ${olid}`);
    return await fetch(`${endpoint}/works/${olid}.json`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (!isTypeOpenLibraryWork(res)) {
          log.error(res);
          throw new Error("Unrecognized response data.");
        }
        return res;
      })
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    log.error("getOpenLibraryWork", e);
    throw new WyrmError("Error fetching Work data from Open Library.", e);
  }
}

/**
 * Get specific Edition from Open Library
 *
 * @param olid Open Library Work ID
 * @returns Work
 * @throws WyrmError
 *
 * @todo Conform data
 */
export async function getOpenLibraryEdition(olid: string): Promise<OpenLibraryEdition> {
  try {
    log.info(`Fetching Open Library Work: ${olid}`);
    return await fetch(`${endpoint}/books/${olid}.json`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (!isTypeOpenLibraryEdition(res)) {
          log.error(res);
          throw new Error("Unrecognized response data.");
        }
        return res;
      })
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    log.error("getOpenLibraryWork", e);
    throw new WyrmError("Error fetching Work data from Open Library.", e);
  }
}

/**
 * Get Editions of Work from Open Library
 *
 * @param olid Open Library Work ID
 * @returns Edition array
 * @throws WyrmError
 *
 * @todo Conform data
 */
export async function getOpenLibraryEditions(olid: string): Promise<OpenLibraryEdition[]> {
  try {
    log.info(`Searching Open Library Editions for Work: ${olid}`);
    return await fetch(`${endpoint}/works/${olid}/editions.json`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (!isTypeOpenLibraryEditions(res)) {
          log.error(res);
          throw new Error("Unrecognized response data.");
        }
        if (!res.size) {
          return [];
        }
        return res.entries;
      })
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    log.error("getOpenLibraryEditions", e);
    throw new WyrmError("Error fetching Edition data from Open Library.", e);
  }
}

/**
 * Get Editions of Work from Open Library by ISBN
 *
 * @param isbn ISBN
 * @returns Edition array
 * @throws WyrmError
 *
 * @todo Conform data
 */
export async function getOpenLibraryEditionsByISBN(isbn: string): Promise<OpenLibraryEdition[]> {
  try {
    log.info(`Searching Open Library Editions for ISBN: ${isbn}`);
    return await fetch(`${endpoint}/isbn/${isbn}.json`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (!isTypeOpenLibraryEditions(res)) {
          log.error(res);
          throw new Error("Unrecognized response data.");
        }
        if (!res.size) {
          return [];
        }
        return res.entries;
      })
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    log.error("getOpenLibraryEditionsByISBN", e);
    throw new WyrmError("Error fetching Edition data from Open Library.", e);
  }
}

/**
 * Search Open Library for Work by ISBN
 *
 * @param isbn ISBN
 * @returns Book or null if no results
 * @throws WyrmError
 */
export async function searchOpenLibraryWorkByISBN(isbn: string): Promise<Book | null> {
  try {
    log.info(`Searching Open Library Works for ISBN: ${isbn}`);
    const work = await fetch(`${endpoint}/search.json?isbn=${isbn}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => {
        if (res.status !== 200) {
          throw res.statusText;
        }
        return res.json();
      })
      .then((res) => {
        if (!isTypeOpenLibrarySearchResponse(res)) {
          log.error(res);
          throw new Error("Unrecognized response data.");
        }
        if (!res.numFound || !res.docs?.[0] || !res.docs?.[0]?.key) {
          return null;
        }
        return res.docs[0];
      })
      .catch((e) => {
        throw e;
      });
    if (!work) {
      return null;
    }
    return conformOpenLibrarySearchResult(work, isbn);
  } catch (e) {
    log.error("searchOpenLibraryWorkByISBN", e);
    throw new WyrmError("Error fetching Work data from Open Library.", e);
  }
}

/**
 * Search Open Library for Work by query
 *
 * @param search Query
 * @returns Array of Books
 * @throws WyrmError
 */
export async function searchOpenLibrary(search: string): Promise<Book[]> {
  try {
    log.info(`Searching Open Library Works for: ${search}`);
    const works = await fetch(`${endpoint}/search.json?q=${search}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        if (!isTypeOpenLibrarySearchResponse(res)) {
          log.error(res);
          throw new Error("Unrecognized response data.");
        }
        if (!res.numFound) {
          return [];
        }
        return res.docs;
      })
      .catch((e) => {
        throw e;
      });
    if (!works?.length) {
      return [];
    }
    return works.map((work) => conformOpenLibrarySearchResult(work));
  } catch (e) {
    log.error("searchOpenLibrary", e);
    throw new WyrmError("Error searching Open Library.", e);
  }
}

/**
 * Shortcut a la pop()
 *
 * @param ids Array of ids
 * @param callback
 */
function setFirstId(ids: string[] | undefined | null, callback: (id: string) => void) {
  ids?.every((id) => {
    if (id) {
      callback(id);
      return false;
    }
    return true;
  });
}

/**
 * Conform Open Library Work to Book data
 *
 * @param work Open Library Work from Search Result
 * @param {string} [isbn] If ISBN provided, will use this in data rather than one from Open Library
 * @returns Book
 */
function conformOpenLibrarySearchResult(work: OpenLibrarySearchResult, isbn?: string): Book {
  const authors: Author[] = [];
  const names = new Set<string>();
  for (let i = 0; i < work.author_name?.length; i++) {
    if (!names.has(work.author_name[i])) {
      names.add(work.author_name[i]);
      authors.push({
        name: work.author_name[i],
        ids: {
          openLibraryId: work.author_key?.[i] ?? "",
        },
      });
    }
  }

  const book: Book = {
    version: "2",
    title: work.title,
    authors,
    datePublished: (work.first_publish_year ?? work.publish_year?.sort()[0] ?? "").toString(),
    dateRead: "",
    timestampAdded: new Date().getTime(),
    rating: 0,
    description: "",
    notes: "",
    tags: [],
    series: "",
    seriesNumber: "",
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
    const imageUrl = imgEndpoint + (work.cover_edition_key ? `olid/${work.cover_edition_key}` : `id/${work.cover_i}`);
    book.cache.image = `${imageUrl}-L.jpg`;
    book.cache.thumbnail = `${imageUrl}-M.jpg`;
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
