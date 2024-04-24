import { describe, it } from "mocha";
import { $, $$ } from "@wdio/globals";

const href = "Author One/Book One";

const data: Record<string, string> = {
  title: "Book One",
  authors: "Author One",
  published: "January 1, 2001",
  seriesName: "Some Series",
  seriesNumber: "#1",
  readDate: "April 23, 2023",
  descriptionText:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  notesText:
    "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
};

const expectedTags = ["Non-Fiction", "Art"];

const seriesHrefs: string[] = ["#/book/Author One/Book One", "#/book/Author One/Book Two"];

const ids: Record<string, string> = {
  google: "https://www.google.com/books/edition/_/ABCD",
  goodreads: "https://goodreads.com/book/show/789",
  openlibrary: "https://openlibrary.org//works/DCBA",
};

const rating = 3;

const imgUpdated = 1700000000003;

describe("book page", () => {
  it("should load correct data", async () => {
    // Navigate
    await (await $(`.book a[href='#/book/${href}']`)).click();

    // Data
    for (const k of Object.keys(data)) {
      expect(await (await $(`.bookInfo--${k}`)).getText()).toBe(data[k]);
    }

    expect(await (await $(`.bookInfo--rating .rating`)).getAttribute("aria-label")).toBe(
      `Rating: ${rating} out of 5 stars`,
    );

    const seriesLinks = await $$(".seriesList__inner");
    expect(seriesLinks.length).toBe(seriesHrefs.length);
    let i = 0;
    for (const s of seriesLinks) {
      expect(await s.getAttribute("href")).toBe(seriesHrefs[i]);
      i++;
    }

    const tags: string[] = [];
    const tagEls = await $$(".bookInfo--tags .tag");
    for (const el of tagEls) {
      tags.push(await el.getText());
    }
    expect(tags).toStrictEqual(expectedTags);

    for (const id of Object.keys(ids)) {
      expect(await (await $(`.moreinfo__${id}`)).getAttribute("href")).toBe(ids[id]);
    }

    expect(await (await $(".bookPage__image img")).getAttribute("src")).toBe(
      `bookimage://${href.replace(/ /g, "%20")}.jpg?t=${imgUpdated}`,
    );
  });
});
