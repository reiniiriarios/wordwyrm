import { describe, it } from "mocha";
import { $, $$ } from "@wdio/globals";

const href1 = "Some Author/Some Title";

const data1: Record<string, string> = {
  title: "Some: Title",
  authors: "Some: Author",
  published: "June 15, 1987",
  seriesName: "Some Series",
  seriesNumber: "#5",
  readDate: "April 25, 2024",
  descriptionText: "This is not a book.",
};

const dates1: Record<string, string> = {
  published: "1987\t0615", // in form of keys to type
  read: "2024\t0425",
};

const tags1 = ["Some", "Tags"];

describe("add book", () => {
  it("should add book from dialog", async () => {
    // Open Dialog
    await (await $(`.pageNav__actions .btn--addBook`)).click();

    // Get input fields
    const [fTitle, fAuthor, fPublished, fRead, fSeries, fSeriesN, fTags, fDesc] = await Promise.all([
      $(".field--title input"),
      $(".field--author input"),
      $(".field--datePublished  input"),
      $(".field--dateRead input"),
      $(".field--series input"),
      $(".field--seriesNumber input"),
      $(".field--tags input"),
      $(".field--desc textarea"),
    ]);

    // Enter data
    async function typeValue(el: WebdriverIO.Element, v: string) {
      await el.click();
      await browser.keys(v.split(""));
    }
    await typeValue(fTitle, data1.title);
    await typeValue(fAuthor, data1.authors);
    await typeValue(fPublished, dates1.published);
    await typeValue(fRead, dates1.read);
    await typeValue(fSeries, data1.seriesName);
    await typeValue(fSeriesN, data1.seriesNumber.replace("#", ""));
    await typeValue(fTags, tags1.join(", "));
    await typeValue(fDesc, data1.descriptionText);

    // Add
    await (await $(".add-book .btn--confirm")).click();

    // Check was added
    await browser.waitUntil(
      async function () {
        return (await (await $(`.book a[href='#/book/${href1}'] .bookPlaceholder__title`)).getText()) === data1.title;
      },
      {
        timeout: 5000,
        timeoutMsg: "expected book to be added",
      },
    );
  });

  it("should have correct data saved", async () => {
    // Navigate
    await (await $(`.book a[href='#/book/${href1}']`)).click();

    // Verify data
    for (const k of Object.keys(data1)) {
      expect(await (await $(`.bookInfo--${k}`)).getText()).toBe(data1[k]);
    }

    const visibleTags: string[] = [];
    const tagEls = await $$(".bookInfo--tags .tag");
    for (const el of tagEls) {
      visibleTags.push(await el.getText());
    }
    expect(visibleTags).toStrictEqual(tags1);

    const seriesLinks = await $$(".seriesList__inner");
    expect(seriesLinks.length).toBe(1);
  });

  it("should delete the book", async () => {
    // Navigate
    await (await $(`.pageNav__actions a[href='#/book/${href1}/edit']`)).click();

    // Delete book
    await (await $(".bookPage__actions .link--delete")).click();

    // Verify dialog message
    expect(await (await $(".deleteMsg__title")).getText()).toBe(data1.title);
    expect(await (await $(".deleteMsg__author")).getText()).toBe(data1.authors);

    // Confirm
    await (await $(".delete-book .btn--confirm")).click();

    // Wait to be redirected
    await browser.waitUntil(
      async function () {
        return (await $$(`.book`)).length > 0;
      },
      {
        timeout: 5000,
        timeoutMsg: "expected to be redirected to books page",
      },
    );

    // Verify deleted
    expect(await (await $(`.book a[href='#/book/${href1}']`)).isExisting()).not.toBeTruthy();
  });
});
