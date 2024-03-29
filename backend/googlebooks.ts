import { Author, Book } from "@data/book";
import { GOOGLE_API_KEY } from "../.env";

const ENDPOINT = "https://www.googleapis.com/books/v1";

export type VolumeLite = {
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
    language: string;
    infoLink: string;
    canonicalVolumeLink: string;
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
    buyLink: string;
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
  };
};

export type Volume = VolumeLite & {
  volumeInfo: {
    industryIdentifiers: {
      type: "ISBN_10" | "ISBN_13" | "ISSN" | "OTHER";
      identifier: string;
    }[];
    pageCount: number;
    dimensions: {
      height: string;
      width: string;
      thickness: string;
    };
    printType: "BOOK" | "MAGAZINE";
    mainCategory: string;
    categories: string[];
    averageRating: number;
    ratingsCount: number;
    language: string;
    previewLink: string;
  };
  saleInfo: {
    saleability: "FOR_SALE" | "FREE" | "NOT_FOR_SALE" | "FOR_PREORDER";
    onSaleDate: string; // date
    isEbook: boolean;
    buyLink: string;
  };
  accessInfo: {
    viewability: "PARTIAL" | "ALL_PAGES" | "NO_PAGES" | "UNKNOWN";
    embeddable: boolean;
    publicDomain: boolean;
    textToSpeechPermission: "ALLOWED" | "ALLOWED_FOR_ACCESSIBILITY" | "NOT_ALLOWED";
    webReaderLink: string;
    downloadAccess: {
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
  items: Volume[] | VolumeLite[];
};

async function searchVolume(q: string): Promise<VolumeSearch> {
  return fetch(`${ENDPOINT}/volumes?q=${q}&key=${GOOGLE_API_KEY}`)
    .then((res) => res.json())
    .then((res) => res as VolumeSearch);
}

async function getVolume(v: string, lite: boolean = true): Promise<Volume | VolumeLite> {
  return fetch(`${ENDPOINT}/volumes/${v}?projection=${lite ? "lite" : "full"}&key=${GOOGLE_API_KEY}`)
    .then((res) => res.json())
    .then((res) => (lite ? (res as VolumeLite) : (res as Volume)));
}

function conformBook(v: Volume | VolumeLite): Book {
  let authors: Author[] = [];
  let book = { authors } as Book;
  v.volumeInfo?.authors?.forEach((a) => book.authors.push({ name: a }));
  book.title = v.volumeInfo.title;
  book.datePublished = new Date(v.volumeInfo?.publishedDate);
  return book;
}

export async function searchBook(q: string): Promise<Book[]> {
  return searchVolume(q).then((volumeSearch) => {
    let books: Book[] = [];
    volumeSearch.items?.forEach((v) => {
      books.push(conformBook(v));
    });
    return books;
  });
}

export async function getBook(gid: string): Promise<Book> {
  return getVolume(gid).then((v) => conformBook(v));
}
