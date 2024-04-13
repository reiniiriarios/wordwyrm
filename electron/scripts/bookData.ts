import * as fs from "fs";
import * as path from "path";
import fetch from "electron-fetch";
import sharp from "sharp";
import { readYaml, saveYaml } from "./userData";

export function initBookDirs(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function authorsToDir(authors: Author[]): string {
  return authors
    .map((a) =>
      a.name
        .replace(/[\/\\\:\^\*\{\}\[\]\?`\|\"]/g, "_")
        .replace(/_+/g, "_")
        .replace(/(?:_ | _)/g, " "),
    )
    .join(", ");
}

export function titleToDir(title: string): string {
  return title
    .replace(/[\/\\\:\^\*\{\}\[\]\?`\|\"]/g, "_")
    .replace(/_+/g, "_")
    .replace(/(?:_ | _)/g, " ");
}

async function saveBookImage(dir: string, book: Book, url: string) {
  try {
    if (!book.cache.authorDir) {
      book.cache.authorDir = authorsToDir(book.authors);
    }
    let filepath = path.join(dir, book.cache.authorDir, `${book.cache.filename}.jpg`);
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
    console.error(e);
  }
}

async function sharpImage(img: Buffer | string, filepath: string) {
  await sharp(img).resize(1000, 1000, { fit: "inside" }).toFile(filepath);
}

export async function addBookImage(dir: string, book: Book, url: string) {
  if (!book.cache.authorDir) {
    book.cache.authorDir = authorsToDir(book.authors);
  }
  await saveBookImage(dir, book, url);
  book.images.hasImage = true;
  book.images.imageUpdated = new Date().getTime();
  saveYaml(path.join(dir, book.cache.authorDir, `${book.cache.filename}.yaml`), book);
}

export async function addBookImageBase64(dir: string, book: Book, base64: string) {
  try {
    if (!book.cache.authorDir || !book.cache.filepath) {
      book.cache.authorDir = authorsToDir(book.authors);
      book.cache.filename = titleToDir(book.title);
      book.cache.filepath = book.cache.authorDir + "/" + book.cache.filename;
    }
    fs.writeFileSync(path.join(dir, book.cache.filepath + ".jpg"), Buffer.from(base64, "base64"), { flag: "w" });
    book.images.imageUpdated = new Date().getTime();
    saveYaml(path.join(dir, book.cache.authorDir, `${book.cache.filename}.yaml`), book);
  } catch (e) {
    console.error(e);
  }
}

export async function saveBook(dir: string, book: Book, oAuthorDir?: string, oFilename?: string): Promise<Book> {
  initBookDirs(dir);

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
  const authorPath = path.join(dir, book.cache.authorDir);
  if (!fs.existsSync(authorPath)) {
    fs.mkdirSync(authorPath, { recursive: true });
  }
  const newFilename = titleToDir(book.title);
  if (book.cache.filename != newFilename) {
    book.cache.filename = newFilename;
  }
  book.cache.filepath = book.cache.authorDir + "/" + book.cache.filename;
  book.cache.urlpath = book.cache.filepath.replace(/ /g, "%20");

  // Use the image variable to save the image, then delete the variable.
  let newImage = false;
  // [sic], not checking the hasImage variable, checking if there's a new image
  if (book.cache.image) {
    await saveBookImage(dir, book, book.cache.image);
    newImage = true;
    book.images.hasImage = true;
    book.images.imageUpdated = new Date().getTime();
  }

  if (!book.tags) book.tags = [];
  else book.tags = book.tags.filter((t) => t.trim().length);

  const filepath = path.join(dir, `${book.cache.filepath}.yaml`);
  if (!book.timestampAdded && !fs.existsSync(filepath)) {
    book.timestampAdded = new Date().getTime();
  }

  saveYaml(filepath, book);

  // After saving everything else, delete old data if present.
  if (oAuthorDir && path.join(dir, oAuthorDir) !== authorPath) {
    fs.rmSync(path.join(dir, oAuthorDir), { recursive: true, force: true });
  } else if (oFilename && oFilename !== newFilename) {
    fs.rmSync(path.join(authorPath, oFilename + ".yaml"), { force: true });
    if (newImage) {
      fs.rmSync(path.join(authorPath, oFilename + ".jpg"), { force: true });
    } else {
      fs.renameSync(path.join(authorPath, oFilename + ".jpg"), path.join(authorPath, newFilename + ".jpg"));
    }
  }

  return book;
}

export async function deleteBook(dir: string, book: Book) {
  try {
    if (!book.cache.authorDir || !book.cache.filepath) {
      book.cache.authorDir = authorsToDir(book.authors);
      book.cache.filename = titleToDir(book.title);
      book.cache.filepath = book.cache.authorDir + "/" + book.cache.filename;
    }
    const authorpath = path.join(dir, book.cache.authorDir);
    const fullpath = path.join(dir, book.cache.filepath);
    if (fs.existsSync(`${fullpath}.yaml`)) {
      fs.rmSync(`${fullpath}.yaml`, { force: true });
    }
    if (fs.existsSync(`${fullpath}.jpg`)) {
      fs.rmSync(`${fullpath}.jpg`, { force: true });
    }
    const ad = fs.readdirSync(authorpath);
    if (!ad.length) {
      fs.rmSync(authorpath, { recursive: true, force: true });
    }
  } catch (e) {
    console.error(e);
  }
}

export async function readAllBooks(dir: string): Promise<Book[]> {
  initBookDirs(dir);
  let books: Book[] = [];
  // Read author dirs
  fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
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
}

export async function readBook(dir: string, authorDir: string, filename: string): Promise<Book | null> {
  const pathname = path.join(dir, authorDir, filename + ".yaml");
  if (!fs.existsSync(pathname)) return null;
  // Import
  let book: BookImport = readYaml(pathname);
  if (!book.version || book.version === "1") book = transformV1(book as Book_v1);
  else if (book.version !== "2") return null; // Unrecognized version, unable to parse.
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
