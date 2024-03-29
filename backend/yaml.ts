import fs from "fs";
import yaml from "js-yaml";
import path from "path";
import { Book } from "../frontend/data/book";

const USER_DATA_PATH =
  process.env.APPDATA ||
  (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
const DATA_PATH = path.join(USER_DATA_PATH, "me.reinii.book-tracker");
const BOOKS_PATH = path.join(DATA_PATH, "books");

function readYaml(filename: string): any {
  try {
    const doc = yaml.load(fs.readFileSync(filename, "utf8"));
    console.log(doc);
    return doc;
  } catch (e) {
    console.error(e);
  }
}

function saveYaml(filename: string, data: any) {
  try {
    const doc = yaml.dump(data);
    console.log(doc);
    fs.writeFileSync(filename, doc, { flag: "w", encoding: "utf8" });
  } catch (e) {
    console.log(e);
  }
}

export async function saveBook(book: Book) {
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
  saveYaml(path.join(BOOKS_PATH, `${book.filename}.yaml`), book);
}

export async function readAllBooks(): Promise<Book[]> {
  let books: Book[] = [];
  fs.readdirSync(BOOKS_PATH).forEach((file) => {
    console.log(file);
    books.push(readYaml(file) as Book);
  });
  return books;
}
