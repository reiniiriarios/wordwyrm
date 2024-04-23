import * as path from "path";
import * as fs from "fs";
import { describe, it } from "mocha";
import { browser, $, $$ } from "@wdio/globals";
import testData from "../testData";

const settingsFile = path.join(path.resolve("."), "test", "data", "settings-test.yaml");

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

describe("books list", () => {
  before(() => {
    // Clear settings
    if (fs.existsSync(settingsFile)) {
      fs.rmSync(settingsFile);
    }
  });

  it("should load all books in test data in order", async () => {
    // Get book links
    const bookLinks = await waitTillBooksLoad();
    let i = 0;
    for await (const bookLink of bookLinks) {
      // Check href
      const href = await bookLink.getAttribute("href");
      expect(href).toMatch(/^#\/book\/[^/]+\/[^/]+$/);
      const [_hash, _page, a, b] = href.split("/");
      // Against test data
      expect(testData[a]?.[b]?.authors?.[0]?.name).toBe(a);
      expect(testData[a]?.[b]?.title).toBe(b);
      // Against default order
      expect(bookOrder.read[i][0]).toBe(a);
      expect(bookOrder.read[i][1]).toBe(b);
      // Check images
      if (testData[a]?.[b]?.images?.hasImage) {
        const imgSrc = await bookLink.$("img").getAttribute("src");
        expect(imgSrc).toBe(
          `bookimage://${a.replace(/ /g, "%20")}/${b.replace(/ /g, "%20")}.jpg?t=${testData[a]?.[b]?.images?.imageUpdated ?? 0}`,
        );
      } else {
        const title = await (await bookLink.$(".bookPlaceholder__title")).getText();
        const author = await (await bookLink.$(".bookPlaceholder__author")).getText();
        expect(title).toBe(b);
        expect(author).toBe(a);
      }
      i++;
    }
  });

  it("should sort books correctly", async () => {
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
        const [a, b] = href.split("/").slice(2);
        expect(bookOrder[order][n][0]).toBe(a);
        expect(bookOrder[order][n][1]).toBe(b);
        n++;
      }
      // Flip asc/desc
      await directionButton.click();
      bookLinks = await $$(".bookList .book > a");
      n = NUM_TEST_BOOKS - 1;
      // Check reverse order
      for await (const bookLink of bookLinks) {
        const href = await bookLink.getAttribute("href");
        const [a, b] = href.split("/").slice(2);
        expect(bookOrder[order][n][0]).toBe(a);
        expect(bookOrder[order][n][1]).toBe(b);
        n--;
      }
      // Flip back
      await directionButton.click();
    }
  });
});
