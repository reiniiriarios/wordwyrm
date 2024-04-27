import { describe, it } from "mocha";
import { Key } from "webdriverio";
import { browser, $, $$ } from "@wdio/globals";

// Each book in list.
const bookData: Record<string, [string, string]> = {
  a1b1: ["Author One", "Book One"],
  a1b2: ["Author One", "Book Two"],
  taab: ["Test Author", "A Book"],
  tatb: ["Test Author", "Test Book"],
};

// Expected order of books, by link, by each sort method.
const bookOrder: Record<string, [string, string][]> = {
  read: [bookData.a1b2, bookData.tatb, bookData.taab, bookData.a1b1],
  added: [bookData.a1b2, bookData.a1b1, bookData.taab, bookData.tatb],
  author: [bookData.tatb, bookData.taab, bookData.a1b1, bookData.a1b2],
  series: [bookData.a1b1, bookData.a1b2, bookData.tatb, bookData.taab],
  seriesRev: [bookData.tatb, bookData.taab, bookData.a1b1, bookData.a1b2],
  title: [bookData.taab, bookData.a1b1, bookData.a1b2, bookData.tatb],
  published: [bookData.tatb, bookData.a1b1, bookData.taab, bookData.a1b2],
};

const NUM_TEST_BOOKS = 4;

async function waitTillBooksLoad(): Promise<WebdriverIO.ElementArray> {
  const bookRows = await $$(".scrollTable__body tr");
  await browser.waitUntil(
    async function () {
      return bookRows.length === 4;
    },
    {
      timeout: 5000,
      timeoutMsg: "expected book list to load",
    },
  );
  expect(bookRows.length).toBe(NUM_TEST_BOOKS);
  return bookRows;
}

async function getTitleAuthor(book: WebdriverIO.Element): Promise<[string, string]> {
  return [await (await book.$(".col--author")).getText(), await (await book.$(".col--title")).getText()];
}

describe("list page", () => {
  it("should load all books in correct order", async () => {
    // Navigate
    const menuLink = await $(".nav__link--list");
    await menuLink.click();
    // Get book links
    const bookRows = await waitTillBooksLoad();
    let i = 0;
    for await (const book of bookRows) {
      expect(bookOrder.read[i]).toStrictEqual(await getTitleAuthor(book));
      i++;
    }
  });

  it("should sort books", async () => {
    // Read
    const sortRead = await $(".scrollTable__head th.col--read");
    await sortRead.click();
    let bookRows = await $$(".scrollTable__body tr");
    let i = NUM_TEST_BOOKS - 1;
    for await (const book of bookRows) {
      expect(bookOrder.read[i]).toStrictEqual(await getTitleAuthor(book));
      i--;
    }
    // Columns
    for (const s of ["title", "author", "series", "published", "added"]) {
      const btn = await $(`.scrollTable__head th.col--${s}`);
      await btn.click();
      bookRows = await $$(".scrollTable__body tr");
      i = 0;
      for await (const book of bookRows) {
        expect(bookOrder[s][i]).toStrictEqual(await getTitleAuthor(book));
        i++;
      }
      await btn.click();
      bookRows = await $$(".scrollTable__body tr");
      i = NUM_TEST_BOOKS - 1;
      const rev = s === "series" ? "seriesRev" : s;
      for await (const book of bookRows) {
        expect(bookOrder[rev][i]).toStrictEqual(await getTitleAuthor(book));
        i--;
      }
    }
    // Reset
    await sortRead.click();
  });

  it("should filter books by category", async () => {
    // Get buttons
    const filterDropdown = await $(".filter--cats");
    const filterButtons = await $$(".filter--cats .dropdownFilter__opt");
    expect(filterButtons.length).toBe(3); // Default: All, Fiction, Non-Fiction
    await filterDropdown.moveTo();
    // Fiction
    await filterButtons[1].moveTo();
    await filterButtons[1].click();
    let books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(2);
    expect(await getTitleAuthor(books[0])).toStrictEqual(bookData.a1b2);
    expect(await getTitleAuthor(books[1])).toStrictEqual(bookData.tatb);
    // Non-Fiction
    await filterButtons[2].moveTo();
    await filterButtons[2].click();
    books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(2);
    expect(await getTitleAuthor(books[0])).toStrictEqual(bookData.taab);
    expect(await getTitleAuthor(books[1])).toStrictEqual(bookData.a1b1);
    // All
    await filterButtons[0].moveTo();
    await filterButtons[0].click();
    books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(4);
    expect(await getTitleAuthor(books[0])).toStrictEqual(bookData.a1b2);
    expect(await getTitleAuthor(books[1])).toStrictEqual(bookData.tatb);
    expect(await getTitleAuthor(books[2])).toStrictEqual(bookData.taab);
    expect(await getTitleAuthor(books[3])).toStrictEqual(bookData.a1b1);
  });

  it("should filter books by read date", async () => {
    // Get buttons
    const filterDropdown = await $(".filter--read");
    const filterButtons = await $$(".filter--read .dropdownFilter__opt");
    expect(filterButtons.length).toBe(8);
    await filterDropdown.moveTo();
    // Read
    await filterButtons[1].moveTo();
    await filterButtons[1].click();
    let books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(2);
    expect(await getTitleAuthor(books[0])).toStrictEqual(bookData.taab);
    expect(await getTitleAuthor(books[1])).toStrictEqual(bookData.a1b1);
    // Unread
    await filterButtons[2].moveTo();
    await filterButtons[2].click();
    books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(2);
    expect(await getTitleAuthor(books[0])).toStrictEqual(bookData.a1b2);
    expect(await getTitleAuthor(books[1])).toStrictEqual(bookData.tatb);
    // This Year
    await filterButtons[3].moveTo();
    await filterButtons[3].click();
    books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(1);
    expect(await getTitleAuthor(books[0])).toStrictEqual(bookData.taab);
    // Last 2 Years
    await filterButtons[5].moveTo();
    await filterButtons[5].click();
    books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(2);
    expect(await getTitleAuthor(books[0])).toStrictEqual(bookData.taab);
    expect(await getTitleAuthor(books[1])).toStrictEqual(bookData.a1b1);
    // > 5 years
    await filterButtons[7].moveTo();
    await filterButtons[7].click();
    books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(0);
    // All
    await filterButtons[0].moveTo();
    await filterButtons[0].click();
    books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(4);
    expect(await getTitleAuthor(books[0])).toStrictEqual(bookData.a1b2);
    expect(await getTitleAuthor(books[1])).toStrictEqual(bookData.tatb);
    expect(await getTitleAuthor(books[2])).toStrictEqual(bookData.taab);
    expect(await getTitleAuthor(books[3])).toStrictEqual(bookData.a1b1);
  });

  it("should search books", async () => {
    // Search
    await (await $(".search input")).click();
    await browser.keys(["t", "w", "o"]);
    await browser.keys(Key.Enter);
    let books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(1);
    expect(await getTitleAuthor(books[0])).toStrictEqual(bookData.a1b2);
    // Clear search
    await (await $(".search .x")).click();
    books = await $$(".scrollTable__body tr");
    expect(books.length).toBe(4);
  });
});
