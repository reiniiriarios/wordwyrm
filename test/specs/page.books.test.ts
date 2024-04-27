import { describe, it } from "mocha";
import { Key } from "webdriverio";
import { browser, $, $$ } from "@wdio/globals";

// Links for each book in list.
const href: Record<string, string> = {
  a1b1: "#/book/Author One/Book One",
  a1b2: "#/book/Author One/Book Two",
  taab: "#/book/Test Author/A Book",
  tatb: "#/book/Test Author/Test Book",
};

const imgs: number[] = [0, 1700000000002, 0, 1700000000003]; // read order

// Expected order of books, by link, by each sort method.
const bookOrder: Record<string, string[]> = {
  read: [href.a1b2, href.tatb, href.taab, href.a1b1],
  added: [href.a1b2, href.a1b1, href.taab, href.tatb],
  author: [href.tatb, href.taab, href.a1b1, href.a1b2],
  title: [href.taab, href.a1b1, href.a1b2, href.tatb],
  published: [href.tatb, href.a1b1, href.taab, href.a1b2],
  rating: [href.taab, href.a1b2, href.a1b1, href.tatb],
};

const NUM_TEST_BOOKS = 4;

async function waitTillBooksLoad(): Promise<WebdriverIO.ElementArray> {
  const bookLinks = await $$(".bookList .book > a");
  await browser.waitUntil(
    async function () {
      return bookLinks.length === 4;
    },
    {
      timeout: 5000,
      timeoutMsg: "expected book list to load",
    },
  );
  expect(bookLinks.length).toBe(NUM_TEST_BOOKS);
  return bookLinks;
}

describe("books page", () => {
  it("should load all books in correct order", async () => {
    // Get book links
    const bookLinks = await waitTillBooksLoad();
    let i = 0;
    for await (const bookLink of bookLinks) {
      // Check href
      const href = await bookLink.getAttribute("href");
      expect(href).toMatch(/^#\/book\/[^/]+\/[^/]+$/);
      // Against default order
      expect(bookOrder.read[i]).toBe(href);
      // Check images
      if (imgs[i]) {
        const imgSrc = await bookLink.$("img").getAttribute("src");
        expect(imgSrc).toBe(`bookimage://${href.replace("#/book/", "").replace(/ /g, "%20")}.jpg?t=${imgs[i]}`);
      } else {
        const [a, b] = href.split("/").slice(2);
        const title = await (await bookLink.$(".bookPlaceholder__title")).getText();
        const author = await (await bookLink.$(".bookPlaceholder__author")).getText();
        expect(title).toBe(b);
        expect(author).toBe(a);
      }
      i++;
    }
  });

  it("should sort books", async () => {
    // Get books
    let bookLinks = await waitTillBooksLoad();
    // Get buttons
    const sortButtons = await $$(".filter--sort .filter__btn");
    const directionButton = await $(".filter--sort .filter__direction");
    expect(sortButtons.length).toBe(Object.keys(bookOrder).length);
    // Check data
    for await (const sortButton of sortButtons) {
      await sortButton.click();
      const order = await sortButton.getAttribute("data-val");
      bookLinks = await $$(".bookList .book > a");
      let n = 0;
      // Check order
      for await (const bookLink of bookLinks) {
        const href = await bookLink.getAttribute("href");
        expect(bookOrder[order][n]).toBe(href);
        n++;
      }
      // Flip asc/desc
      await directionButton.click();
      bookLinks = await $$(".bookList .book > a");
      n = NUM_TEST_BOOKS - 1;
      // Check reverse order
      for await (const bookLink of bookLinks) {
        const href = await bookLink.getAttribute("href");
        expect(bookOrder[order][n]).toBe(href);
        n--;
      }
      // Flip back
      await directionButton.click();
    }
    // Reset
    await sortButtons[0].click();
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
    let bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(2);
    expect(await bookLinks[0].getAttribute("href")).toBe(href.a1b2);
    expect(await bookLinks[1].getAttribute("href")).toBe(href.tatb);
    // Non-Fiction
    await filterButtons[2].moveTo();
    await filterButtons[2].click();
    bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(2);
    expect(await bookLinks[0].getAttribute("href")).toBe(href.taab);
    expect(await bookLinks[1].getAttribute("href")).toBe(href.a1b1);
    // All
    await filterButtons[0].moveTo();
    await filterButtons[0].click();
    bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(4);
    expect(await bookLinks[0].getAttribute("href")).toBe(href.a1b2);
    expect(await bookLinks[1].getAttribute("href")).toBe(href.tatb);
    expect(await bookLinks[2].getAttribute("href")).toBe(href.taab);
    expect(await bookLinks[3].getAttribute("href")).toBe(href.a1b1);
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
    let bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(2);
    expect(await bookLinks[0].getAttribute("href")).toBe(href.taab);
    expect(await bookLinks[1].getAttribute("href")).toBe(href.a1b1);
    // Unread
    await filterButtons[2].moveTo();
    await filterButtons[2].click();
    bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(2);
    expect(await bookLinks[0].getAttribute("href")).toBe(href.a1b2);
    expect(await bookLinks[1].getAttribute("href")).toBe(href.tatb);
    // This Year
    await filterButtons[3].moveTo();
    await filterButtons[3].click();
    bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(1);
    expect(await bookLinks[0].getAttribute("href")).toBe(href.taab);
    // Last 2 Years
    await filterButtons[5].moveTo();
    await filterButtons[5].click();
    bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(2);
    expect(await bookLinks[0].getAttribute("href")).toBe(href.taab);
    expect(await bookLinks[1].getAttribute("href")).toBe(href.a1b1);
    // > 5 years
    await filterButtons[7].moveTo();
    await filterButtons[7].click();
    bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(0);
    // All
    await filterButtons[0].moveTo();
    await filterButtons[0].click();
    bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(4);
    expect(await bookLinks[0].getAttribute("href")).toBe(href.a1b2);
    expect(await bookLinks[1].getAttribute("href")).toBe(href.tatb);
    expect(await bookLinks[2].getAttribute("href")).toBe(href.taab);
    expect(await bookLinks[3].getAttribute("href")).toBe(href.a1b1);
  });

  it("should zoom books", async () => {
    // Get buttons
    const zoomButtons = await $$(".zoom .zoom__btn");
    // S
    await zoomButtons[0].click();
    let books = await $$(".bookList .book.zoomSmall");
    expect(books.length).toBe(4);
    // L
    await zoomButtons[2].click();
    books = await $$(".bookList .book.zoomSmall");
    expect(books.length).toBe(0);
    books = await $$(".bookList .book.zoomLarge");
    expect(books.length).toBe(4);
    // M
    await zoomButtons[1].click();
    books = await $$(".bookList .book.zoomSmall");
    expect(books.length).toBe(0);
    books = await $$(".bookList .book.zoomLarge");
    expect(books.length).toBe(0);
  });

  it("should search books", async () => {
    // Search
    await (await $(".search input")).click();
    await browser.keys(["t", "w", "o"]);
    await browser.keys(Key.Enter);
    let bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(1);
    expect(await bookLinks[0].getAttribute("href")).toBe(href.a1b2);
    // Clear search
    await (await $(".search .x")).click();
    bookLinks = await $$(".bookList .book > a");
    expect(bookLinks.length).toBe(4);
  });
});
