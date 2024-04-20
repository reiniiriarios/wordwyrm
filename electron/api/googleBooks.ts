import log from "electron-log/main";
import { NodeHtmlMarkdown } from "node-html-markdown";
import WyrmError from "../error";

const ENDPOINT = "https://www.googleapis.com/books/v1";

/**
 * Google Books Volume
 *
 * @see https://developers.google.com/books/docs/v1/reference/volumes#resource
 */
export type Volume = {
  kind: "books#volume";
  id: string;
  etag: string;
  selfLink: string;
  volumeInfo: {
    title: string;
    subtitle: string;
    authors: string[];
    publisher: string;
    publishedDate: string;
    description: string;
    contentVersion: string;
    imageLinks: {
      smallThumbnail: string;
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
      extraLarge: string;
    };
    infoLink: string;
    canonicalVolumeLink: string;
    industryIdentifiers?: {
      type: "ISBN_10" | "ISBN_13" | "ISSN" | "OTHER";
      identifier: string;
    }[];
    pageCount?: number;
    dimensions?: {
      height: string;
      width: string;
      thickness: string;
    };
    printType?: "BOOK" | "MAGAZINE";
    mainCategory?: string;
    categories?: string[];
    averageRating?: number;
    ratingsCount?: number;
    language?: string;
    previewLink?: string;
  };
  saleInfo: {
    country: string;
    listPrice: {
      amount: number;
      currencyCode: string;
    };
    retailPrice: {
      amount: number;
      currencyCode: string;
    };
    saleability?: "FOR_SALE" | "FREE" | "NOT_FOR_SALE" | "FOR_PREORDER";
    onSaleDate?: string; // date
    isEbook?: boolean;
    buyLink?: string;
  };
  accessInfo: {
    country: string;
    epub: {
      isAvailable: boolean;
      downloadLink: string;
      acsTokenLink: string;
    };
    pdf: {
      isAvailable: boolean;
      downloadLink: string;
      acsTokenLink: string;
    };
    accessViewStatus: "FULL_PURCHASED" | "FULL_PUBLIC_DOMAIN" | "SAMPLE" | "NONE";
    viewability?: "PARTIAL" | "ALL_PAGES" | "NO_PAGES" | "UNKNOWN";
    embeddable?: boolean;
    publicDomain?: boolean;
    textToSpeechPermission?: "ALLOWED" | "ALLOWED_FOR_ACCESSIBILITY" | "NOT_ALLOWED";
    webReaderLink?: string;
    downloadAccess?: {
      kind: "books#downloadAccessRestriction";
      volumeId: string;
      restricted: boolean;
      deviceAllowed: boolean;
      justAcquired: boolean;
      maxDownloadDevices: number;
      downloadsAcquired: number;
      nonce: string;
      source: string;
      reasonCode: string;
      message: string;
      signature: string;
    };
  };
};

/**
 * Search results for looking up a Volume.
 */
export type VolumeSearch = {
  kind: "books#volumes";
  items: Volume[];
};

/**
 * Search Google Books for a volume.
 *
 * @param q Query
 * @returns VolumeSearch.
 * @throws WyrmError
 */
async function searchVolume(q: string): Promise<VolumeSearch> {
  try {
    log.debug(`Searching for Google Volume: ${q}`);
    return fetch(`${ENDPOINT}/volumes?q=${q}`)
      .then((res) => res.json())
      .then((res) => res as VolumeSearch)
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    log.error("searchVolume", e);
    throw new WyrmError("Error searching Google Books.", e);
  }
}

/**
 * Get a specific volume from Google Books.
 *
 * @param v Volume ID
 * @param lite Fetch only "lite" data
 * @returns Volume
 * @throws WyrmError
 */
async function getVolume(v: string, lite: boolean = false): Promise<Volume> {
  try {
    log.debug(`Fetching Google Volume ${v}`);
    return fetch(`${ENDPOINT}/volumes/${v}?projection=${lite ? "lite" : "full"}`)
      .then((res) => res.json())
      .then((res) => res as Volume)
      .catch((e) => {
        throw e;
      });
  } catch (e) {
    log.error("getVolume", e);
    throw new WyrmError("Error fetching volume data from Google Books.", e);
  }
}

/**
 * Conform Google Books Volume data to Book datatype.
 *
 * @param {Volume} v Google Books Volume
 * @returns {Book} Book
 */
function conformBook(v: Volume): Book {
  const book: Book = {
    version: "2",
    title: v.volumeInfo?.title ?? "",
    authors: v.volumeInfo?.authors?.map((a) => ({ name: a })) ?? [],
    datePublished: v.volumeInfo?.publishedDate ?? "",
    dateRead: "",
    tags: [],
    series: "",
    seriesNumber: "",
    timestampAdded: new Date().getTime(),
    rating: 0,
    description: v.volumeInfo?.description?.length ? NodeHtmlMarkdown.translate(v.volumeInfo.description) : "",
    notes: "",
    images: {
      hasImage: false,
    },
    ids: {
      googleBooksId: v.id ?? "",
    },
    cache: {
      searchId: v.id ?? "",
    },
  };

  // Select primary image in preference order.
  if (v.volumeInfo?.imageLinks?.medium) {
    book.cache.image = v.volumeInfo.imageLinks.medium;
  } else if (v.volumeInfo?.imageLinks?.large) {
    book.cache.image = v.volumeInfo.imageLinks.large;
  } else if (v.volumeInfo?.imageLinks?.extraLarge) {
    book.cache.image = v.volumeInfo.imageLinks.extraLarge;
  } else if (v.volumeInfo?.imageLinks?.small) {
    book.cache.image = v.volumeInfo.imageLinks.small;
  } else if (v.volumeInfo?.imageLinks?.thumbnail) {
    book.cache.image = v.volumeInfo.imageLinks.thumbnail;
  } else if (v.volumeInfo?.imageLinks?.smallThumbnail) {
    book.cache.image = v.volumeInfo.imageLinks.smallThumbnail;
  }

  // Select thumbnail in preference order.
  if (v.volumeInfo?.imageLinks?.thumbnail) {
    book.cache.thumbnail = v.volumeInfo.imageLinks.thumbnail;
  } else if (v.volumeInfo?.imageLinks?.smallThumbnail) {
    book.cache.thumbnail = v.volumeInfo.imageLinks.smallThumbnail;
  } else if (v.volumeInfo?.imageLinks?.small) {
    book.cache.thumbnail = v.volumeInfo.imageLinks.small;
  } else if (v.volumeInfo?.imageLinks?.medium) {
    book.cache.thumbnail = v.volumeInfo.imageLinks.medium;
  } else if (v.volumeInfo?.imageLinks?.large) {
    book.cache.thumbnail = v.volumeInfo.imageLinks.large;
  } else if (v.volumeInfo?.imageLinks?.extraLarge) {
    book.cache.thumbnail = v.volumeInfo.imageLinks.extraLarge;
  }

  if (book.cache.image) {
    book.images.hasImage = true;
  }

  // Categories are in BISAC Heading format
  // e.g. https://www.bisg.org/fiction
  const splitCategories = (cat: string) => cat.split("/").map((c) => c.trim());
  const mergeCategories = (a: string[], b: string[], predicate = (a: string, b: string) => a === b): string[] => {
    const c = [...a]; // copy to avoid side effects
    // add all items from B to copy C if they're not already present
    b.forEach((bItem) => (c.some((cItem) => predicate(bItem, cItem)) ? null : c.push(bItem)));
    return c;
  };

  book.tags = [];
  if (v.volumeInfo?.mainCategory) {
    book.tags = splitCategories(v.volumeInfo.mainCategory);
  }
  if (v.volumeInfo?.categories) {
    v.volumeInfo.categories.forEach((cat) => {
      book.tags = mergeCategories(book.tags, splitCategories(cat));
    });
  }

  v.volumeInfo?.industryIdentifiers?.forEach((id) => {
    if (id.type === "ISBN_13") {
      book.ids.isbn = id.identifier;
    } else if (!book.ids.isbn && id.type === "ISBN_10") {
      book.ids.isbn = id.identifier;
    }
  });

  return book;
}

/**
 * Search Google Books for a volume.
 *
 * @param q Search Query
 * @returns {Book[]} Array of Books
 * @throws WyrmError
 */
export async function searchGoogleBooks(q: string): Promise<Book[]> {
  return searchVolume(q).then((volumeSearch) => {
    if (!volumeSearch) {
      return [];
    }
    const books: Book[] = [];
    volumeSearch.items?.forEach((v) => {
      books.push(conformBook(v));
    });
    return books;
  });
}

/**
 * Get specific book from Google Books.
 *
 * @param gid Google Books ID
 * @returns Book or null if error or not found
 * @throws WyrmError
 */
export async function getGoogleBook(gid: string): Promise<Book | null> {
  return getVolume(gid).then((v) => (v ? conformBook(v) : null));
}
