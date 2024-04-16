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
    const work: OpenLibraryWork = await fetch(`${endpoint}/works/${olid}.json`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((json: OpenLibraryWork) => json)
      .catch((e) => {
        throw e;
      });
    return work;
  } catch (e) {
    console.error("getOpenLibraryWork", e);
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
    const editions: OpenLibraryEdition[] = await fetch(`${endpoint}/works/${olid}/editions.json`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((json: OpenLibraryEditions) => {
        if (!json.size) return [];
        return json.entries;
      })
      .catch((e) => {
        throw e;
      });
    return editions;
  } catch (e) {
    console.error("getOpenLibraryEditions", e);
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
    const editions: OpenLibraryEdition[] = await fetch(`${endpoint}/isbn/${isbn}.json`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((json: OpenLibraryEditions) => {
        if (!json.size) return [];
        return json.entries;
      })
      .catch((e) => {
        throw e;
      });
    return editions;
  } catch (e) {
    console.error("getOpenLibraryEditionsByISBN", e);
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
    const work: OpenLibrarySearchResult = await fetch(`${endpoint}/search.json?isbn=${isbn}`, {
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
      .then((json: OpenLibrarySearchResponse) => {
        if (!json.numFound) return null;
        return json.docs[0];
      })
      .catch((e) => {
        throw e;
      });
    return conformOpenLibrarySearchResult(work, isbn);
  } catch (e) {
    console.error("searchOpenLibraryWorkByISBN", e);
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
    const works: OpenLibrarySearchResult[] = await fetch(`${endpoint}/search.json?q=${search}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    })
      .then((res) => res.json())
      .then((json: OpenLibrarySearchResponse) => {
        if (!json.numFound) return [];
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
    throw new WyrmError("Error searching Open Library.", e);
  }
  return [];
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
  let authors: Author[] = [];
  let names = new Set<string>();
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
    timestampAdded: 0,
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
