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

export async function saveBook(dir: string, book: Book, oAuthorDir?: string, oFilename?: string) {
  initBookDirs(dir);

  // Author directory.
  book.authorDir = path.join(dir, authorsToDir(book.authors));
  if (!fs.existsSync(book.authorDir)) {
    fs.mkdirSync(book.authorDir, { recursive: true });
  }

  const newFilename = book.title.replace(/[^A-Za-z0-9\-'!\?,\.:; ]/g, "_");
  if (book.filename != newFilename) {
    book.filename = newFilename;
  }

  // Use the image variable to save the image, then delete the variable.
  let newImage = false;
  if (book.image) {
    // Save from interwebs or file protocol.
    if (book.image.startsWith("http") || book.image.startsWith("file:")) {
      fetch(book.image).then((response) => {
        response.buffer().then((buf) => {
          sharp(buf)
            .resize(1000, 1000, { fit: "inside" })
            .toFile(path.join(book.authorDir ?? "", `${book.filename}.jpg`), (err, info) => {
              if (err) console.error(err);
            });
        });
      });
    } else {
      // Save from local file.
      sharp(book.image)
        .resize(1000, 1000, { fit: "inside" })
        .toFile(path.join(book.authorDir, `${book.filename}.jpg`), (err, info) => {
          if (err) console.error(err);
        });
    }
    newImage = true;
    delete book.image;
  }
  if (book.thumbnail) {
    delete book.thumbnail;
  }

  saveYaml(path.join(book.authorDir, `${book.filename}.yaml`), book);

  // After saving everything else, delete old data if present.
  if (oAuthorDir && path.join(dir, oAuthorDir) !== book.authorDir) {
    console.log(oAuthorDir, book.authorDir);
    fs.rmSync(path.join(dir, oAuthorDir), { recursive: true, force: true });
  } else if (oFilename && oFilename !== book.filename) {
    console.log(book.authorDir, oFilename, book.filename);
    if (newImage) {
      fs.rmSync(path.join(book.authorDir, oFilename + ".yaml"), { force: true });
    } else {
      fs.renameSync(path.join(book.authorDir, oFilename + ".jpg"), path.join(book.authorDir, book.filename + ".jpg"));
    }
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
