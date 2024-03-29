import * as fs from "fs";
import * as path from "path";
import { Book } from "../frontend/data/book";
import { readYaml, saveYaml } from "./userdata";

export function initBookDirs(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function saveBook(dir: string, book: Book) {
  let newFilename =
    book.authors.map((a) => a.name.replace(/[^A-Za-z0-9\-]/, "_")).join("-") +
      "--" +
      book.title.replace(/[^A-Za-z0-9\-]/, "_") +
      "--" +
      book.datePublished?.getFullYear() ?? "";
  if (book.filename != newFilename) {
    // delete old file
    book.filename = newFilename;
  }
  saveYaml(path.join(dir, `${book.filename}.yaml`), book);
}

export async function readAllBooks(dir: string): Promise<Book[]> {
  initBookDirs(dir);
  let books: Book[] = [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach((file) => {
    if (file.isFile() && file.name.endsWith(".yaml")) {
      books.push(readYaml(path.join(file.path, file.name)) as Book);
    }
  });
  return books;
}
