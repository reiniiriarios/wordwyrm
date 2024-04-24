import { describe, it } from "mocha";
import { $, $$ } from "@wdio/globals";

describe("help page", () => {
  it("should load", async () => {
    // Navigate
    const menuLink = await $(".nav__link--help");
    await menuLink.click();
    // Check content is present
    const content = await $$(".help__info");
    expect(content.length).toBeGreaterThan(0);
  });
});
