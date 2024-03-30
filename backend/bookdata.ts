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
  const newFilename =
    book.authors.map((a) => a.name.replace(/[^A-Za-z0-9\-]/, "_")).join("-") +
    "--" +
    book.title.replace(/[^A-Za-z0-9\-]/, "_") +
    (book.datePublished && book.datePublished !== "undefined" ? "--" + book.datePublished : "");
  if (book.filename != newFilename) {
    // todo: delete old file
    book.filename = newFilename;
  }

  if (book.image) {
    if (book.image.startsWith("http") || book.image.startsWith("file:")) {
      fetch(book.image).then((response) => {
        response.buffer().then((buf) => {
          sharp(buf)
            .resize(1000, 1000, { fit: "inside" })
            .toFile(`${book.filename}.jpg`, (err, info) => {
              if (err) console.error(err);
              console.log(info);
            });
        });
      });
    } else {
      sharp(book.image)
        .resize(1000, 1000, { fit: "inside" })
        .toFile(path.join(dir, `${book.filename}.jpg`), (err, info) => {
          if (err) console.error(err);
          console.log(info);
        });
    }
    delete book.image;
  }

  saveYaml(path.join(dir, `${book.filename}.yaml`), book);
}

export async function readAllBooks(dir: string): Promise<Book[]> {
  initBookDirs(dir);
  let books: Book[] = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
    if (file.isFile() && file.name.endsWith(".yaml")) {
      let book = readYaml(path.join(file.path, file.name)) as Book;
      book.hasImage = fs.existsSync(path.join(file.path, file.name.slice(0, -5) + ".jpg"));
      books.push(book);
    }
  });
  return books;
}
