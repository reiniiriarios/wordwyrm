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
  return authors.map((a) => a.name.replace(/[^A-Za-z0-9\-',\. ]/, "_")).join(", ");
}

export async function saveBook(dir: string, book: Book) {
  initBookDirs(dir);

  // Author directory.
  book.authorDir = path.join(dir, authorsToDir(book.authors));
  if (!fs.existsSync(book.authorDir)) {
    fs.mkdirSync(book.authorDir, { recursive: true });
  }

  // Filename.
  const filename = book.title.replace(/[^A-Za-z0-9\-'!\?,\. ]/, "_");
  if (book.filename != filename) {
    book.filename = filename;
  }

  // Use the image variable to save the image, then delete the variable.
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
    delete book.image;
  }
  if (book.thumbnail) {
    delete book.thumbnail;
  }

  saveYaml(path.join(book.authorDir, `${book.filename}.yaml`), book);
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
