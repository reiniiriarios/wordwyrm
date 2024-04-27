import { describe, it } from "mocha";
import { $, $$ } from "@wdio/globals";
import { Key } from "webdriverio";

const bookHref = "Author One/Book One";

const chartYear1 = "2000";
const chartYear2 = "2002";
const filterTags2 = ["abc", "def"];
const commonTags2 = ["123", "456"];

const dateFormats: Record<string, string> = {
  "local-long": "January 1, 2002", // a1b2
  "local-medium": "Jan 1, 2002",
  "local-short": "1/1/2002",
  "yyyy-mm-dd": "2002-01-01",
};

const imageEngines = [
  "https://www.google.com/search?tbm=isch&q=",
  "https://duckduckgo.com/?t=h_&iax=images&ia=images&q=",
  "https://www.bing.com/images/search?q=",
  "https://www.ecosia.org/images?q=",
];

async function typeValue(el: WebdriverIO.Element, v: string) {
  await el.click();
  await browser.keys([Key.Ctrl, "a"]);
  await browser.keys([Key.Delete]);
  await browser.keys(v.split(""));
}

async function waitTillBooksLoad(selector: string) {
  const bookLinks = await $$(selector);
  await browser.waitUntil(
    async function () {
      return bookLinks.length === 4;
    },
    {
      timeout: 5000,
      timeoutMsg: "expected book list to load",
    },
  );
}

describe("settings", () => {
  it("should edit and save", async () => {
    // Navigate to settings page
    await (await $(".nav__link--settings")).click();

    // Fields
    const themeSel = await $(".settings__opt--theme .select__selected");
    const themeOpts = await $$(".settings__opt--theme .select__opt");
    const filterTags = await $(".settings__opt--filterTags input");
    const commonTags = await $(".settings__opt--commonTags input");
    const chartYear = await $(".settings__opt--chartYear input");
    const save = await $(".btn--save");

    // Edit
    await themeSel.moveTo();
    await themeOpts[1].moveTo();
    await themeOpts[1].click();
    await filterTags.moveTo(); // must mouse out of Select
    await typeValue(filterTags, filterTags2.join(", "));
    await typeValue(commonTags, commonTags2.join(", "));
    await typeValue(chartYear, chartYear2);
    await save.click();
    await browser.pause(20);

    // Navigate to Books page
    await (await $(".nav__link--books")).click();
    await waitTillBooksLoad(".bookList .book > a");

    // Validate tag filters
    const filterCats = await $$(".filter--cats .dropdownFilter__opt");
    expect(filterCats.length).toBe(5); // 3 default + 2 added
    let i = -3;
    for (const f of filterCats) {
      if (i >= 0) {
        expect(await f.getAttribute("data-val")).toBe(filterTags2[i]);
      }
      i++;
    }

    // Validate theme
    const theme = await (await $("#appContainer")).getAttribute("data-theme");
    expect(theme.length).toBeGreaterThan(0);

    // Navigate to Edit Book page
    await (await $(`.book a[href='#/book/${bookHref}']`)).click();
    await (await $(`.pageNav__actions a[href='#/book/${bookHref}/edit']`)).click();

    // Validate common tags
    const cTags = await $$(".commonTags__tags .tag");
    expect(cTags.length).toBe(2);
    i = 0;
    for (const t of cTags) {
      expect(await t.getText()).toBe(commonTags2[i]);
      i++;
    }

    // Navigate to Chart page
    await (await $(".nav__link--trend")).click();

    // Validate chart start year
    const startYear = await (await $(".chartStartYear")).getValue();
    expect(startYear).toBe(chartYear2);

    // Navigate to settings page
    await (await $(".nav__link--settings")).click();

    // Reset
    await themeSel.moveTo();
    await themeOpts[0].moveTo();
    await themeOpts[0].click();
    await filterTags.moveTo();
    await typeValue(filterTags, "");
    await typeValue(commonTags, "");
    await typeValue(chartYear, chartYear1);
    await save.click();
    await browser.pause(20);
  });

  it("should set date formats correctly", async () => {
    // Settings
    const dateSel = await $(".settings__opt--dateFormat .select__selected");
    const dateOpts = await $$(".settings__opt--dateFormat .select__opt");
    const heading = await $(".pageNav__header");
    const save = await $(".btn--save");

    // rev, default option last
    for (let i = dateOpts.length - 1; i >= 0; i--) {
      // Edit
      await dateSel.moveTo();
      await dateOpts[i].moveTo();
      await dateOpts[i].click();
      await heading.moveTo(); // must mouse out of Select
      await save.click();

      // Navigate to list page
      await (await $(".nav__link--list")).click();
      await waitTillBooksLoad(".scrollTable__body tr");

      // Validate
      // first row is a1b2
      const firstDateFound = await (await $(".col--published.date")).getText();
      expect(firstDateFound).toBe(dateFormats[Object.keys(dateFormats)[i]]);

      // Navigate to Settings page
      await (await $(".nav__link--settings")).click();
    }
  });

  it("should set image search engines correctly", async () => {
    // Navigate to Settings page
    const imageEngineSel = await $(".settings__opt--imageSearchEngine .select__selected");
    const imageEngineOpts = await $$(".settings__opt--imageSearchEngine .select__opt");
    const heading = await $(".pageNav__header");
    const save = await $(".btn--save");

    // rev, default option last
    for (const i of [0, 2, 3, 1]) {
      // Edit
      await imageEngineSel.moveTo();
      await imageEngineOpts[i].moveTo();
      await imageEngineOpts[i].click();
      await heading.moveTo(); // must mouse out of Select
      await save.click();

      // Navigate to Edit Book page
      await (await $(".nav__link--books")).click();
      await waitTillBooksLoad(".bookList .book > a");
      await (await $(`.book a[href='#/book/${bookHref}']`)).click();
      await (await $(`.pageNav__actions a[href='#/book/${bookHref}/edit']`)).click();

      // Validate
      // first row is a1b2
      const searchHref = await (await $(".btn--searchForImage")).getAttribute("href");
      expect(searchHref.startsWith(imageEngines[i])).toBeTruthy();

      // Navigate to Settings page
      await (await $(".nav__link--settings")).click();
    }
  });
});
