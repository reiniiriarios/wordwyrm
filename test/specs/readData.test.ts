import { describe, it } from "mocha";
import { browser, $, $$ } from "@wdio/globals";
import testData from "../testData";

const bookOrder: Record<string, [string, string][]> = {
  read: [
    ["Author One", "Book Two"],
    ["Test Author", "Test Book"],
    ["Test Author", "A Book"],
    ["Author One", "Book One"],
  ],
  added: [
    ["Author One", "Book Two"],
    ["Author One", "Book One"],
    ["Test Author", "A Book"],
    ["Test Author", "Test Book"],
  ],
  author: [
    ["Author One", "Book Two"],
    ["Author One", "Book One"],
    ["Test Author", "A Book"],
    ["Test Author", "Test Book"],
  ],
  title: [
    ["Test Author", "A Book"],
    ["Author One", "Book One"],
    ["Author One", "Book Two"],
    ["Test Author", "Test Book"],
  ],
  published: [
    ["Author One", "Book Two"],
    ["Author One", "Book One"],
    ["Test Author", "A Book"],
    ["Test Author", "Test Book"],
  ],
  rating: [
    ["Author One", "Book Two"],
    ["Test Author", "A Book"],
    ["Author One", "Book One"],
    ["Test Author", "Test Book"],
  ],
};

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
  return bookLinks;
}

const NUM_TEST_BOOKS = 4;

describe("books list", () => {
  it("should load all books in test data in order", async () => {
    const bookLinks = await waitTillBooksLoad();
    expect(bookLinks.length).toBe(NUM_TEST_BOOKS);
    let i = 0;
    for await (const bookLink of bookLinks) {
      const href = await bookLink.getAttribute("href");
      expect(href).toMatch(/^#\/book\/[^/]+\/[^/]+$/);
      const [_hash, _page, a, b] = href.split("/");
      expect(testData[a]?.[b]?.authors?.[0]?.name).toBe(a);
      expect(testData[a]?.[b]?.title).toBe(b);
      expect(bookOrder.read[i][0]).toBe(a);
      expect(bookOrder.read[i][1]).toBe(b);
      i++;
    }
  });

  it("should sort books correctly", async () => {
    let bookLinks = await waitTillBooksLoad();
    expect(bookLinks.length).toBe(NUM_TEST_BOOKS);
    const sortButtons = await $$(".filter--sort .filter__btn");
    const directionButton = await $(".filter--sort .filter__direction");
    expect(sortButtons.length).toBe(Object.keys(bookOrder).length);
    for await (const sortButton of sortButtons) {
      await sortButton.click();
      const order = await sortButton.getAttribute("data-val");
      bookLinks = await $$(".bookList .book > a");
      let n = 0;
      for await (const bookLink of bookLinks) {
        const href = await bookLink.getAttribute("href");
        const [_hash, _page, a, b] = href.split("/");
        expect(bookOrder[order][n][0]).toBe(a);
        expect(bookOrder[order][n][1]).toBe(b);
        n++;
      }
      await directionButton.click();
      bookLinks = await $$(".bookList .book > a");
      n = NUM_TEST_BOOKS - 1;
      for await (const bookLink of bookLinks) {
        const href = await bookLink.getAttribute("href");
        const [_hash, _page, a, b] = href.split("/");
        expect(bookOrder[order][n][0]).toBe(a);
        expect(bookOrder[order][n][1]).toBe(b);
        n--;
      }
      await directionButton.click();
    }
  });
});
