import * as fs from "fs";
import * as path from "path";
import fetch from "electron-fetch";
import sharp from "sharp";
import { Author, Book } from "../frontend/data/book";
import { readYaml, saveYaml } from "./userdata";

export function initBookDirs(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function authorsToDir(authors: Author[]): string {
  return authors.map((a) => a.name.replace(/[^A-Za-z0-9\-',\. ]/g, "_")).join(", ");
}

async function saveBookImage(dir: string, book: Book, url: string) {
  let filepath = path.join(dir, book.authorDir, `${book.filename}.jpg`);
  // If a remote file, fetch and use buffer in sharp instead.
  if (url.startsWith("http") || url.startsWith("file:")) {
    let res = await fetch(url);
    let buf = await res.buffer();
    await sharpImage(buf, filepath);
  } else {
    await sharpImage(url, filepath);
  }
}

async function sharpImage(img: Buffer | string, filepath: string) {
  await sharp(img).resize(1000, 1000, { fit: "inside" }).toFile(filepath);
}

export async function addBookImage(dir: string, book: Book, url: string) {
  await saveBookImage(dir, book, url);
  delete book.image;
  delete book.thumbnail;
  book.hasImage = true;
  book.imageUpdated = new Date().getTime();
  saveYaml(path.join(dir, book.authorDir, `${book.filename}.yaml`), book);
}

export async function saveBook(dir: string, book: Book, oAuthorDir?: string, oFilename?: string): Promise<Book> {
  initBookDirs(dir);

  // Author directory.
  book.authorDir = authorsToDir(book.authors);
  const authorPath = path.join(dir, book.authorDir);
  if (!fs.existsSync(authorPath)) {
    fs.mkdirSync(authorPath, { recursive: true });
  }

  const newFilename = book.title.replace(/[^A-Za-z0-9\-'!\?,\.:; ]/g, "_");
  if (book.filename != newFilename) {
    book.filename = newFilename;
  }

  // Use the image variable to save the image, then delete the variable.
  let newImage = false;
  if (book.image) {
    await saveBookImage(dir, book, book.image);
    newImage = true;
    book.imageUpdated = new Date().getTime();
    delete book.image;
  }
  if (book.thumbnail) {
    delete book.thumbnail;
  }

  book.datePublished = book.datePublished?.trim() ?? "";
  book.dateRead = book.dateRead?.trim() ?? "";

  saveYaml(path.join(authorPath, `${book.filename}.yaml`), book);

  // After saving everything else, delete old data if present.
  if (oAuthorDir && path.join(dir, oAuthorDir) !== authorPath) {
    fs.rmSync(path.join(dir, oAuthorDir), { recursive: true, force: true });
  } else if (oFilename && oFilename !== book.filename) {
    fs.rmSync(path.join(authorPath, oFilename + ".yaml"), { force: true });
    if (newImage) {
      fs.rmSync(path.join(authorPath, oFilename + ".jpg"), { force: true });
    } else {
      fs.renameSync(path.join(authorPath, oFilename + ".jpg"), path.join(authorPath, book.filename + ".jpg"));
    }
  }

  return book;
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
          let pathname = path.join(subFile.path, subFile.name);
          let book = readYaml(pathname) as Book;
          // Reset image and dir location from current status
          book.hasImage = fs.existsSync(pathname.slice(0, -5) + ".jpg");
          book.authorDir = authorsToDir(book.authors);
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
  let book = readYaml(pathname) as Book;
  book.hasImage = fs.existsSync(pathname.slice(0, -5) + ".jpg");
  book.authorDir = authorDir;
  return book;
}
