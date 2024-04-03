import { Author, Book } from "@data/book";

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

async function searchVolume(q: string, apiKey: string): Promise<VolumeSearch> {
  return fetch(`${ENDPOINT}/volumes?q=${q}&key=${apiKey}`)
    .then((res) => res.json())
    .then((res) => res as VolumeSearch);
}

async function getVolume(v: string, apiKey: string, lite: boolean = false): Promise<Volume> {
  return fetch(`${ENDPOINT}/volumes/${v}?projection=${lite ? "lite" : "full"}&key=${apiKey}`)
    .then((res) => res.json())
    .then((res) => res as Volume);
}

function conformBook(v: Volume): Book {
  let authors: Author[] = [];
  let book = { authors } as Book;
  v.volumeInfo?.authors?.forEach((a) => book.authors.push({ name: a }));

  book.title = v.volumeInfo?.title ?? "";
  book.datePublished = v.volumeInfo?.publishedDate ?? "";
  book.googleBooksId = v.id ?? "";

  // Select primary image. Prefer "large".
  if (v.volumeInfo?.imageLinks?.large) {
    book.image = v.volumeInfo.imageLinks.large;
  } else if (v.volumeInfo?.imageLinks?.extraLarge) {
    book.image = v.volumeInfo.imageLinks.extraLarge;
  } else if (v.volumeInfo?.imageLinks?.medium) {
    book.image = v.volumeInfo.imageLinks.medium;
  } else if (v.volumeInfo?.imageLinks?.small) {
    book.image = v.volumeInfo.imageLinks.small;
  } else if (v.volumeInfo?.imageLinks?.thumbnail) {
    book.image = v.volumeInfo.imageLinks.thumbnail;
  } else if (v.volumeInfo?.imageLinks?.smallThumbnail) {
    book.image = v.volumeInfo.imageLinks.smallThumbnail;
  }

  // Select thumbnail. Prefer "thumbnail".
  if (v.volumeInfo?.imageLinks?.thumbnail) {
    book.thumbnail = v.volumeInfo.imageLinks.thumbnail;
  } else if (v.volumeInfo?.imageLinks?.smallThumbnail) {
    book.thumbnail = v.volumeInfo.imageLinks.smallThumbnail;
  } else if (v.volumeInfo?.imageLinks?.small) {
    book.thumbnail = v.volumeInfo.imageLinks.small;
  } else if (v.volumeInfo?.imageLinks?.medium) {
    book.thumbnail = v.volumeInfo.imageLinks.medium;
  } else if (v.volumeInfo?.imageLinks?.large) {
    book.thumbnail = v.volumeInfo.imageLinks.large;
  } else if (v.volumeInfo?.imageLinks?.extraLarge) {
    book.thumbnail = v.volumeInfo.imageLinks.extraLarge;
  }

  if (book.image) {
    book.hasImage = true;
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
      book.isbn = id.identifier;
    } else if (!book.isbn && id.type === "ISBN_10") {
      book.isbn = id.identifier;
    }
  });

  return book;
}

export async function searchBook(q: string, apiKey: string): Promise<Book[]> {
  return searchVolume(q, apiKey).then((volumeSearch) => {
    let books: Book[] = [];
    volumeSearch.items?.forEach((v) => {
      books.push(conformBook(v));
    });
    return books;
  });
}

export async function getBook(gid: string, apiKey: string): Promise<Book> {
  return getVolume(gid, apiKey).then((v) => conformBook(v));
}
