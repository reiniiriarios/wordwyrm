const ENDPOINT = "https://www.googleapis.com/books/v1";

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

export type VolumeSearch = {
  kind: "books#volumes";
  items: Volume[];
};

async function searchVolume(q: string, apiKey: string): Promise<VolumeSearch | null> {
  try {
    return fetch(`${ENDPOINT}/volumes?q=${q}&key=${apiKey}`)
      .then((res) => res.json())
      .then((res) => res as VolumeSearch);
  } catch (e) {
    console.error(e);
  }
  return null;
}

async function getVolume(v: string, apiKey: string, lite: boolean = false): Promise<Volume> {
  return fetch(`${ENDPOINT}/volumes/${v}?projection=${lite ? "lite" : "full"}&key=${apiKey}`)
    .then((res) => res.json())
    .then((res) => res as Volume);
}

function conformBook(v: Volume): Book {
  let book: Book = {
    version: "2",
    title: v.volumeInfo?.title ?? "",
    authors: v.volumeInfo?.authors?.map((a) => ({ name: a })) ?? [],
    datePublished: v.volumeInfo?.publishedDate ?? "",
    dateRead: "",
    tags: [],
    series: "",
    timestampAdded: 0,
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

  book.tags = [];
  if (v.volumeInfo?.mainCategory) {
    book.tags.push(v.volumeInfo.mainCategory);
  }
  if (v.volumeInfo?.categories) {
    v.volumeInfo.categories.forEach((cat) => {
      if (cat !== v.volumeInfo.mainCategory) {
        book.tags.push(cat);
      }
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

export async function searchGoogleBooks(q: string, apiKey: string): Promise<Book[]> {
  return searchVolume(q, apiKey).then((volumeSearch) => {
    if (!volumeSearch) return [];
    let books: Book[] = [];
    volumeSearch.items?.forEach((v) => {
      books.push(conformBook(v));
    });
    return books;
  });
}

export async function getGoogleBook(gid: string, apiKey: string): Promise<Book> {
  return getVolume(gid, apiKey).then((v) => conformBook(v));
}
