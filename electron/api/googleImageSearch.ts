import fetch from "electron-fetch";
import WyrmError from "../error";

// https://programmablesearchengine.google.com/

const endpoint = "https://customsearch.googleapis.com/customsearch/v1";

/**
 * Google Search Result Page
 *
 * @see https://developers.google.com/custom-search/v1/reference/rest/v1/Search
 */
type GoogleSearchResultPage = {
  title: string;
  totalResults: string;
  searchTerms: string;
  count: number;
  startIndex: number;
  startPage: number;
  language: string;
  inputEncoding: string;
  outputEncoding: string;
  safe: string;
  cx: string;
  sort: string;
  filter: string;
  gl: string;
  cr: string;
  googleHost: string;
  disableCnTwTranslation: string;
  hq: string;
  hl: string;
  siteSearch: string;
  siteSearchFilter: string;
  exactTerms: string;
  excludeTerms: string;
  linkSite: string;
  orTerms: string;
  relatedSite: string;
  dateRestrict: string;
  lowRange: string;
  highRange: string;
  fileType: string;
  rights: string;
  searchType: string;
  imgSize: string;
  imgType: string;
  imgColorType: string;
  imgDominantColor: string;
};

/**
 * Google Search Result Promotion
 *
 * @see https://developers.google.com/custom-search/v1/reference/rest/v1/Search
 */
type GoogleSearchResultPromotion = {
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  bodyLines: [
    {
      title: string;
      htmlTitle: string;
      url: string;
      link: string;
    },
  ];
  image: {
    source: string;
    width: number;
    height: number;
  };
};

/**
 * Google Search Result
 *
 * @see https://developers.google.com/custom-search/v1/reference/rest/v1/Search
 */
type GoogleSearchResult = {
  kind: string;
  title: string;
  htmlTitle: string;
  link: string;
  displayLink: string;
  snippet: string;
  htmlSnippet: string;
  cacheId: string;
  formattedUrl: string;
  htmlFormattedUrl: string;
  pagemap: object;
  mime: string;
  fileFormat: string;
  image: {
    contextLink: string;
    height: number;
    width: number;
    byteSize: number;
    thumbnailLink: string;
    thumbnailHeight: number;
    thumbnailWidth: number;
  };
  labels: [
    {
      name: string;
      displayName: string;
      label_with_op: string;
    },
  ];
};

/**
 * Google Search Results Response
 *
 * @see https://developers.google.com/custom-search/v1/reference/rest/v1/Search
 */
type GoogleSearchResponse = {
  kind: string;
  url: {
    type: string;
    template: string;
  };
  queries: {
    previousPage: GoogleSearchResultPage[];
    request: GoogleSearchResultPage[];
    nextPage: GoogleSearchResultPage[];
  };
  promotions: GoogleSearchResultPromotion[];
  context: object;
  searchInformation: {
    searchTime: number;
    formattedSearchTime: string;
    totalResults: string;
    formattedTotalResults: string;
  };
  spelling: {
    correctedQuery: string;
    htmlCorrectedQuery: string;
  };
  items: GoogleSearchResult[];
};

/**
 * Search Result
 *
 * Simplified from Google data.
 */
export type SearchResult = {
  image: string;
  width: number;
  height: number;
  thumbnail: string;
};

/**
 * Search Google Images for a specific book cover.
 *
 * @param apiKey Google Cloud API Key
 * @param engineId Google Programmable Search Engine ID
 * @param title Book title
 * @param author Book author(s)
 * @param page Page of results
 * @returns {SearchResult[]} Search results
 * @throws WyrmError
 */
export async function googleImageSearch(
  apiKey: string,
  engineId: string,
  title: string,
  author: string,
  page: number = 0,
): Promise<SearchResult[]> {
  let keywords = `"${title}" by ${author} book cover`;
  let results: SearchResult[] = [];

  try {
    // https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list?apix=true
    var params = new URLSearchParams({
      key: apiKey,
      cx: engineId,
      filter: "0", // do not filter duplicate content
      num: "10", // number of results to obtain
      start: (10 * Math.min(Math.max(page, 0), 10)).toString(), // offset
      searchType: "image",
      q: keywords,
    }).toString();

    let response: GoogleSearchResponse = await fetch(`${endpoint}?${params}`)
      .then((res) => res.json())
      .catch((e) => {
        throw e;
      });

    if (response.items?.length) {
      response.items.forEach((item) => {
        results.push({
          image: item.link ?? "",
          width: item.image?.width ?? 0,
          height: item.image?.height ?? 0,
          thumbnail: item.image?.thumbnailLink ?? "",
        });
      });
    } else {
      console.log(response);
    }

    return results;
  } catch (e) {
    console.error(e);
    throw new WyrmError("Error searching Google Images.", e);
  }
}
