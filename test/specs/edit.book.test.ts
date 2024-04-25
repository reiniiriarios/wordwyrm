import { describe, it } from "mocha";
import { $, $$ } from "@wdio/globals";
import { Key } from "webdriverio";

const href1 = "Author One/Book One";
const href2 = "エマ, ウィンリィ/無効 取り替える";

const data1: Record<string, string> = {
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

const data2: Record<string, string> = {
  title: "無効: 取り替える",
  authors: "エマ, ウィンリィ",
  published: "June 2, 2002",
  seriesName: "テスト",
  seriesNumber: "#2",
  readDate: "January 24, 2024",
  descriptionText: "本",
  notesText: "メモ",
};

const dates1: Record<string, string> = {
  published: "2001\t0101", // in form of keys to type
  read: "2023\t0423",
};

const dates2: Record<string, string> = {
  published: "2002\t0602",
  read: "2024\t0124",
};

const tags1 = ["Non-Fiction", "Art"];
const tags2 = ["フィクション", "芸術"];

const seriesHrefs: string[] = ["#/book/Author One/Book One", "#/book/Author One/Book Two"];

const imgUpdated = 1700000000003;

const ids1: Record<string, string> = {
  isbn: "123",
  google: "ABCD",
  goodreads: "789",
  openlibrary: "/works/DCBA",
};

const ids2: Record<string, string> = {
  isbn: "321",
  google: "",
  goodreads: "",
  openlibrary: "",
};

const idLinks1: Record<string, string> = {
  google: "https://www.google.com/books/edition/_/ABCD",
  goodreads: "https://goodreads.com/book/show/789",
  openlibrary: "https://openlibrary.org//works/DCBA",
};

const idLinks2: Record<string, string> = {
  google:
    "https://www.google.com/search?tbo=p&tbm=bks&q=intitle:%E7%84%A1%E5%8A%B9%3A+intitle:%E5%8F%96%E3%82%8A%E6%9B%BF%E3%81%88%E3%82%8B+inauthor:%E3%82%A8%E3%83%9E+inauthor:%E3%82%A6%E3%82%A3%E3%83%B3%E3%83%AA%E3%82%A3",
  goodreads:
    "https://goodreads.com/search?q=%E7%84%A1%E5%8A%B9%3A+%E5%8F%96%E3%82%8A%E6%9B%BF%E3%81%88%E3%82%8B+by+%E3%82%A8%E3%83%9E%2C+%E3%82%A6%E3%82%A3%E3%83%B3%E3%83%AA%E3%82%A3",
  openlibrary:
    "https://openlibrary.org/search?title=%E7%84%A1%E5%8A%B9%3A+%E5%8F%96%E3%82%8A%E6%9B%BF%E3%81%88%E3%82%8B&author=%E3%82%A8%E3%83%9E%2C+%E3%82%A6%E3%82%A3%E3%83%B3%E3%83%AA%E3%82%A3",
};

const rating1 = 3;
const rating2 = 4;

async function verifyData(
  data: Record<string, string>,
  rating: number,
  tags: string[],
  idLinks: Record<string, string>,
) {
  for (const k of Object.keys(data)) {
    expect(await (await $(`.bookInfo--${k}`)).getText()).toBe(data[k]);
  }

  expect(await (await $(`.bookInfo--rating .rating`)).getAttribute("aria-label")).toBe(
    `Rating: ${rating} out of 5 stars`,
  );

  for (const id of Object.keys(idLinks)) {
    expect(await (await $(`.moreinfo__${id}`)).getAttribute("href")).toBe(idLinks[id]);
  }

  const visibleTags: string[] = [];
  const tagEls = await $$(".bookInfo--tags .tag");
  for (const el of tagEls) {
    visibleTags.push(await el.getText());
  }
  expect(visibleTags).toStrictEqual(tags);
}

async function setData(
  data: Record<string, string>,
  rating: number,
  tags: string[],
  ids: Record<string, string>,
  dates: Record<string, string>,
) {
  // Get elements.
  const [
    fTitle,
    fAuthor,
    fPublished,
    fRead,
    fSeries,
    fSeriesN,
    fTags,
    fDesc,
    fNotes,
    fIsbn,
    fGoogle,
    fOpenlib,
    fGoodreads,
  ] = await Promise.all([
    $(".field--title input"),
    $(".field--author input"),
    $(".field--published input"),
    $(".field--read input"),
    $(".field--series input"),
    $(".field--seriesNumber input"),
    $(".field--tags input"),
    $(".field--description textarea"),
    $(".field--notes textarea"),
    $(".field--isbn input"),
    $(".field--googlebooks input"),
    $(".field--openlibrary input"),
    $(".field--goodreads input"),
  ]);

  async function typeValue(el: WebdriverIO.Element, v: string) {
    await el.click();
    await browser.keys([Key.Ctrl, "a"]);
    await browser.keys([Key.Delete]);
    await browser.keys(v.split(""));
  }
  await typeValue(fTitle, data.title);
  await typeValue(fAuthor, data.authors);
  await typeValue(fSeries, data.seriesName);
  await typeValue(fSeriesN, data.seriesNumber.replace("#", ""));
  await typeValue(fTags, tags.join(", "));
  await typeValue(fDesc, data.descriptionText);
  await typeValue(fNotes, data.notesText);
  await typeValue(fIsbn, ids.isbn);
  await typeValue(fGoogle, ids.google);
  await typeValue(fOpenlib, ids.openlibrary);
  await typeValue(fGoodreads, ids.goodreads);
  await typeValue(fPublished, dates.published);
  await typeValue(fRead, dates.read);

  const stars = await $$(".field--rating .star");
  await stars[rating - 1].click();
  await (await $(".btn--save")).click();
}

describe("book page", () => {
  it("should load correct data", async () => {
    // Navigate
    await (await $(`.book a[href='#/book/${href1}']`)).click();

    // Data
    await verifyData(data1, rating1, tags1, idLinks1);

    const seriesLinks = await $$(".seriesList__inner");
    expect(seriesLinks.length).toBe(seriesHrefs.length);
    let i = 0;
    for (const s of seriesLinks) {
      expect(await s.getAttribute("href")).toBe(seriesHrefs[i]);
      i++;
    }

    expect(await (await $(".bookPage__image img")).getAttribute("src")).toBe(
      `bookimage://${href1.replace(/ /g, "%20")}.jpg?t=${imgUpdated}`,
    );
  });

  it("should save edited data", async () => {
    // Navigate
    await (await $(`.pageNav__actions a[href='#/book/${href1}/edit']`)).click();

    // Set data
    await setData(data2, rating2, tags2, ids2, dates2);

    // Verify data
    await verifyData(data2, rating2, tags2, idLinks2);
    const seriesLinks = await $$(".seriesList__inner");
    expect(seriesLinks.length).toBe(1);

    // Navigate
    await (await $(`.pageNav__actions a[href='#/book/${href2}/edit']`)).click();

    // Reset data
    await setData(data1, rating1, tags1, ids1, dates1);

    // Verify data reset
    await verifyData(data1, rating1, tags1, idLinks1);
  });
});
