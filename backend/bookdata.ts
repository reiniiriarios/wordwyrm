import * as fs from "fs";
import * as path from "path";
import fetch from "electron-fetch";
import sharp from "sharp";
import { Book } from "../frontend/data/book";
import { readYaml, saveYaml } from "./userdata";

export function initBookDirs(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function saveBook(dir: string, book: Book) {
  initBookDirs(dir);

  // Author directory.
  const authorDir = book.authors.map((a) => a.name.replace(/[^A-Za-z0-9\-',\. ]/, "_")).join(", ");
  if (!fs.existsSync(authorDir)) {
    fs.mkdirSync(authorDir, { recursive: true });
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
            .toFile(path.join(dir, authorDir, `${book.filename}.jpg`), (err, info) => {
              if (err) console.error(err);
              console.log(info);
            });
        });
      });
    } else {
      // Save from local file.
      sharp(book.image)
        .resize(1000, 1000, { fit: "inside" })
        .toFile(path.join(dir, authorDir, `${book.filename}.jpg`), (err, info) => {
          if (err) console.error(err);
          console.log(info);
        });
    }
    delete book.image;
  }

  saveYaml(path.join(dir, authorDir, `${book.filename}.yaml`), book);
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
          book.hasImage = fs.existsSync(pathname.slice(0, -5) + ".jpg");
          books.push(book);
        }
      });
    }
  });
  return books;
}
