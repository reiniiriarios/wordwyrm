import * as fs from "fs";
import * as path from "path";
import log from "electron-log/main";
import fetch from "electron-fetch";
import sharp from "sharp";
import { readYaml, saveYaml } from "./userData";
import WyrmError from "../error";
import { getGoogleBook } from "../api/googleBooks";
import { searchOpenLibraryWorkByISBN } from "../api/openLibrary";

/**
 * Create full path to user books directory.
 *
 * We call this often in case the user makes changes to the file
 * structure while the app is running.
 *
 * @param dir Full path to user books directory
 */
export function initBookDirs(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Convert Author array to directory name.
 *
 * @param {Author[]} authors
 * @returns Directory name
 */
export function authorsToDir(authors: Author[]): string {
  let dir = authors
    .map((a) =>
      a.name
        .replace(/[\/\\\:\^\*\{\}\[\]\?`\|\"]/g, "_")
        .replace(/_+/g, "_")
        .replace(/(?:_ | _)/g, " "),
    )
    .join(", ");
  if (!dir) dir = "__unknown__";
  return dir;
}

/**
 * Convert title to filename.
 *
 * @param {title} title
 * @returns Filename
 */
export function titleToFilename(title: string): string {
  let filename = title
    .replace(/[\/\\\:\^\*\{\}\[\]\?`\|\"]/g, "_")
    .replace(/_+/g, "_")
    .replace(/(?:_ | _)/g, " ");
  if (!filename) filename = "__unknown__";
  return filename;
}

/**
 * Save image to books data from either the interwebs or a local file.
 *
 * @param {string} booksDir Books directory
 * @param {Book} book Book
 * @param {string} url Url or local path to image.
 * @throws WyrmError
 */
async function saveBookImage(booksDir: string, book: Book, url: string) {
  try {
    if (!booksDir) {
      throw new Error("Books directory not specified.");
    }
    if (!book.cache.authorDir) {
      book.cache.authorDir = authorsToDir(book.authors);
    }
    let filepath = path.join(booksDir, book.cache.authorDir, `${book.cache.filename}.jpg`);
    url = url.replace(/\\/g, "/");
    // If a remote file, fetch and use buffer in sharp instead.
    if (url.startsWith("http") || url.startsWith("file:")) {
      url = url.replace(/^http:/, "https:");
      let res = await fetch(url);
      let buf = await res.buffer();
      await sharpImage(buf, filepath);
    } else {
      // sharp needs windows files to NOT start with a /
      if (url.match(/^\/[A-Za-z]:/)) {
        url = url.slice(1);
      }
      url = url.replace(/%20/g, " "); // bugfix
      await sharpImage(url, filepath);
    }
  } catch (e) {
    log.error(e);
    throw new WyrmError("Error saving image.", e);
  }
}

/**
 * Resize and save image from buffer or file.
 *
 * @param {Buffer | string} img Buffered data or filepath to local image.
 * @param {string} filepath Filepath to save resulting image to.
 */
async function sharpImage(img: Buffer | string, filepath: string) {
  await sharp(img).resize(1000, 1000, { fit: "inside" }).toFile(filepath);
}

/**
 * Add a book image for a specific book.
 *
 * @param {string} booksDir Books directory
 * @param {Book} book Book
 * @param {string} url Url or local path to image.
 * @throws WyrmError
 */
export async function addBookImage(booksDir: string, book: Book, url: string) {
  if (!booksDir) {
    throw new WyrmError("Books directory not specified.");
  }
  if (!book.cache.authorDir) {
    book.cache.authorDir = authorsToDir(book.authors);
  }
  await saveBookImage(booksDir, book, url);
  book.images.hasImage = true;
  book.images.imageUpdated = new Date().getTime();
  saveYaml(path.join(booksDir, book.cache.authorDir, `${book.cache.filename}.yaml`), book);
}

/**
 * Save base64-encoded image data for a specific book.
 *
 * @param {string} booksDir Books directory
 * @param {Book} book Book
 * @param {string} base64 Base64-encoded image data (no data prefix, just raw data)
 * @throws WyrmError
 */
export async function addBookImageBase64(booksDir: string, book: Book, base64: string) {
  try {
    if (!booksDir) {
      throw new Error("Books directory not specified.");
    }
    if (!book.cache.authorDir || !book.cache.filepath) {
      book.cache.authorDir = authorsToDir(book.authors);
      book.cache.filename = titleToFilename(book.title);
      book.cache.filepath = book.cache.authorDir + "/" + book.cache.filename;
    }
    fs.writeFileSync(path.join(booksDir, book.cache.filepath + ".jpg"), Buffer.from(base64, "base64"), { flag: "w" });
    book.images.imageUpdated = new Date().getTime();
    saveYaml(path.join(booksDir, book.cache.authorDir, `${book.cache.filename}.yaml`), book);
  } catch (e) {
    log.error(e);
    throw new WyrmError("Error saving image.", e);
  }
}

/**
 * Save book data.
 *
 * @param {string} booksDir Books directory
 * @param {Book} book Book
 * @param {string} [oAuthorDir] Existing author dir before saving
 * @param {string} [oFilename] Existing filename before saving
 * @returns Book
 * @throws WyrmError
 */
export async function saveBook(booksDir: string, book: Book, oAuthorDir?: string, oFilename?: string): Promise<Book> {
  try {
    if (!booksDir) {
      throw new Error("Books directory not specified.");
    }
    initBookDirs(booksDir);

    // Trim, default values.
    book.title = book.title.trim();
    book.series = book.series?.trim() ?? "";
    book.seriesNumber = book.seriesNumber?.trim() ?? "";
    book.datePublished = book.datePublished?.trim() ?? "";
    book.dateRead = book.dateRead?.trim() ?? "";
    book.notes = book.notes?.trim() ?? "";
    if (!book.cache) book.cache = {};
    if (!book.images) {
      book.images = {
        hasImage: false,
      };
    }

    // Paths
    book.cache.authorDir = authorsToDir(book.authors);
    const authorPath = path.join(booksDir, book.cache.authorDir);
    if (!fs.existsSync(authorPath)) {
      fs.mkdirSync(authorPath, { recursive: true });
    }
    const newFilename = titleToFilename(book.title);
    if (book.cache.filename != newFilename) {
      book.cache.filename = newFilename;
    }
    book.cache.filepath = book.cache.authorDir + "/" + book.cache.filename;
    book.cache.urlpath = book.cache.filepath.replace(/ /g, "%20");

    const changedAuthor = !!oAuthorDir && oAuthorDir !== book.cache.authorDir;
    const changedTitle = !!oFilename && oFilename !== newFilename;
    const oAuthorPath = !!oAuthorDir ? path.join(booksDir, oAuthorDir) : authorPath;
    const oFilepath = path.join(oAuthorPath, !!oFilename ? oFilename : book.cache.filename);

    // Use the image variable to save the image, then delete the variable.
    let newImage = false;
    let oldImage = book.images.hasImage;
    // [sic], not checking the hasImage variable, checking if there's a new image
    if (book.cache.image) {
      await saveBookImage(booksDir, book, book.cache.image);
      newImage = true;
      book.images.hasImage = true;
      book.images.imageUpdated = new Date().getTime();
    }

    if (!book.tags) book.tags = [];
    else book.tags = book.tags.filter((t) => t.trim().length);

    const filepath = path.join(booksDir, `${book.cache.filepath}.yaml`);
    if (!book.timestampAdded && !fs.existsSync(filepath)) {
      book.timestampAdded = new Date().getTime();
    }

    saveYaml(filepath, book);

    // Handle old data

    if (oldImage && (changedAuthor || changedTitle) && fs.existsSync(oFilepath + ".jpg")) {
      if (newImage) {
        log.debug("Deleting old image");
        fs.rmSync(oFilepath + ".jpg", { force: true });
      } else {
        log.debug("Moving image");
        fs.renameSync(oFilepath + ".jpg", path.join(authorPath, newFilename + ".jpg"));
      }
    }

    if ((changedAuthor || changedTitle) && fs.existsSync(oFilepath + ".yaml")) {
      log.debug("Deleting old yaml");
      fs.rmSync(oFilepath + ".yaml", { force: true });
    }

    if (changedAuthor && fs.existsSync(oAuthorPath)) {
      // If we moved the author dir and the old one is empty, delete it.
      const oldAuthorDir = fs.readdirSync(oAuthorPath);
      if (!oldAuthorDir.length) {
        log.debug("Deleting empty old author dir");
        fs.rmSync(oAuthorPath, { recursive: true, force: true });
      }
    }
  } catch (e) {
    throw new WyrmError("Error saving book.", e);
  }

  return book;
}

/**
 * Delete a book's data files.
 *
 * @param {string} booksDir Books directory
 * @param {Book} book Book
 * @throws WyrmError
 */
export async function deleteBook(booksDir: string, book: Book) {
  try {
    if (!booksDir) {
      throw new Error("Books directory not specified.");
      1;
    }
    if (!book.cache.authorDir || !book.cache.filepath) {
      book.cache.authorDir = authorsToDir(book.authors);
      book.cache.filename = titleToFilename(book.title);
      book.cache.filepath = book.cache.authorDir + "/" + book.cache.filename;
    }
    const authorpath = path.join(booksDir, book.cache.authorDir);
    const fullpath = path.join(booksDir, book.cache.filepath);
    if (fs.existsSync(`${fullpath}.yaml`)) {
      fs.rmSync(`${fullpath}.yaml`, { force: true });
    }
    if (fs.existsSync(`${fullpath}.jpg`)) {
      fs.rmSync(`${fullpath}.jpg`, { force: true });
    }
    const ad = fs.readdirSync(authorpath);
    if (!ad?.length) {
      fs.rmSync(authorpath, { recursive: true, force: true });
    }
  } catch (e) {
    log.error(e);
    throw new WyrmError("Error deleting book.", e);
  }
}

/**
 * Read all book data.
 *
 * @param {string} booksDir Books directory
 * @throws WyrmError
 */
export async function readAllBooks(booksDir: string): Promise<Book[]> {
  try {
    if (!booksDir) {
      throw new Error("Books directory not specified.");
    }
    initBookDirs(booksDir);
    let books: Book[] = [];
    // Read author dirs
    fs.readdirSync(booksDir, { withFileTypes: true }).forEach((file) => {
      if (file.isDirectory()) {
        // Read yaml in author dirs
        fs.readdirSync(path.join(file.path, file.name), { withFileTypes: true }).forEach((subFile) => {
          if (subFile.isFile() && subFile.name.endsWith(".yaml")) {
            // Get data for book
            const pathname = path.join(subFile.path, subFile.name);
            // Import
            let book: BookImport = readYaml(pathname);
            if (!book.version || book.version === "1") book = transformV1(book as Book_v1);
            else if (book.version !== "2") return; // Unrecognized version, unable to parse.
            // Build cache data
            book.images.hasImage = fs.existsSync(pathname.slice(0, -5) + ".jpg");
            book.cache = {
              authorDir: file.name,
              filename: subFile.name.slice(0, -5),
            };
            book.cache.filepath = book.cache.authorDir + "/" + book.cache.filename;
            book.cache.urlpath = book.cache.filepath.replace(/ /g, "%20");
            books.push(book);
          }
        });
      }
    });
    return books;
  } catch (e) {
    throw new WyrmError("Error reading book data.", e);
  }
}

/**
 * Read book data for specific book.
 *
 * @param {string} booksDir Books directory
 * @param {string} authorDir Author directory name
 * @param {string} filename Filename from title (no extension)
 * @throws WyrmError
 */
export async function readBook(booksDir: string, authorDir: string, filename: string): Promise<Book | null> {
  if (!booksDir) {
    throw new WyrmError("Books directory not specified.");
  }
  const pathname = path.join(booksDir, authorDir, filename + ".yaml");
  if (!fs.existsSync(pathname)) throw new WyrmError("Book data not found.", pathname);
  // Import
  let book: BookImport = readYaml(pathname);
  if (!book.version || book.version === "1") book = transformV1(book as Book_v1);
  else if (book.version !== "2") throw new WyrmError("Unrecognized data.", "book.version != 2");
  // Build cache data
  book.images.hasImage = fs.existsSync(pathname.slice(0, -5) + ".jpg");
  let filepath = authorDir + "/" + filename;
  book.cache = {
    authorDir,
    filename,
    filepath,
    urlpath: filepath.replace(/ /g, "%20"),
  };
  return book;
}

/**
 * Add additional data from both Google Books and Open Library to existing Book.
 *
 * @param {Book} book Book with minimal/less data
 * @returns {Book} Book with supplemental data from Google Books and/or Open Library
 */
export async function addGooglePlusOpenLibraryData(book: Book): Promise<Book> {
  let googleBookP: Promise<Book>;
  let olBookP: Promise<Book>;
  let googleBook: Book | null = null;
  let olBook: Book | null = null;

  try {
    // Run both queries.
    if (book.ids.googleBooksId) googleBookP = getGoogleBook(book.ids.googleBooksId);
    if (book.ids.isbn) olBookP = searchOpenLibraryWorkByISBN(book.ids.isbn);

    // Wait for data.
    if (book.ids.googleBooksId) googleBook = await googleBookP;
    if (book.ids.isbn) olBook = await olBookP;

    // If we didn't have either of the necessary ids at first, run those again.
    if (!olBook && googleBook.ids.isbn) olBookP = searchOpenLibraryWorkByISBN(googleBook.ids.isbn);
    if (!googleBook && olBook.ids.googleBooksId) googleBookP = getGoogleBook(olBook.ids.googleBooksId);

    // Wait on secondary data if any.
    if (!olBook && googleBook.ids.isbn) olBook = await olBookP;
    if (!googleBook && olBook.ids.googleBooksId) googleBook = await googleBookP;

    // Sort out data
    if (googleBook) {
      book = { ...book, ...googleBook };
    }
    if (olBook) {
      book = combineGooglePlusOpenLibrary(book, olBook);
    }
    return book;
  } catch (e) {
    throw new WyrmError("Error supplementing book data", e);
  }
}

/**
 * Add Open Library data to Google Books data.
 *
 * @param {Book} googleBook Book parsed from Google Books Volume
 * @param {Book} olBook Book parsed from Open Library Work
 * @returns {Book} Combined data
 */
export function combineGooglePlusOpenLibrary(googleBook: Book, olBook: Book): Book {
  let book: Book = structuredClone(googleBook);
  // OpenLibrary author data also has IDs
  book.authors = olBook.authors;
  // OpenLibrary accurate to original publish date
  if (olBook.datePublished) book.datePublished = olBook.datePublished;
  // Ids
  if (!book.ids.googleBooksId && olBook.ids.googleBooksId) book.ids.googleBooksId = olBook.ids.googleBooksId;
  book.ids.openLibraryId = olBook.ids.openLibraryId;
  book.ids.amazonId = olBook.ids.amazonId;
  book.ids.goodreadsId = olBook.ids.goodreadsId;
  book.ids.internetArchiveId = olBook.ids.internetArchiveId;
  book.ids.libraryThingId = olBook.ids.libraryThingId;
  book.ids.oclcId = olBook.ids.oclcId;
  book.ids.wikidataId = olBook.ids.wikidataId;
  return book;
}

/**
 * Transform Book_v1 data to Book (v2) data.
 *
 * @param {Book_v1} book
 * @returns {Book} Book (v2)
 */
function transformV1(book: Book_v1): Book {
  return {
    version: "2",
    title: book.title,
    authors: book.authors,
    tags: book.tags,
    series: book.series ?? "",
    seriesNumber: "",
    rating: 0,
    description: "",
    notes: "",
    datePublished: book.datePublished ?? "",
    dateRead: book.dateRead ?? "",
    timestampAdded: book.timestampAdded ?? 0,
    images: {
      hasImage: book.hasImage ?? false,
      imageUpdated: book.imageUpdated,
    },
    ids: {
      isbn: book.isbn,
      googleBooksId: book.googleBooksId,
    },
    cache: {
      authorDir: book.authorDir,
      filename: book.filename,
      filepath: book.authorDir + "/" + book.filename,
      image: book.image,
      thumbnail: book.thumbnail,
    },
  };
}
