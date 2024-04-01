import { search, type DuckbarImageResult } from "duck-duck-scrape";

export async function imageSearch(title: string, author: string): Promise<DuckbarImageResult[] | null> {
  try {
    let keywords = encodeURIComponent(`${title} by ${author} book cover`);
    const searchResults = await search(keywords, {
      offset: 24,
    });
    if (!searchResults.images) throw "no image results";
    return searchResults.images;
  } catch (e) {
    console.error(e);
  }
  return null;
}
