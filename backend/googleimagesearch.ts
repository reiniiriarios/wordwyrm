import fetch from "electron-fetch";

// https://programmablesearchengine.google.com/

const endpoint = "https://customsearch.googleapis.com/customsearch/v1";

// https://developers.google.com/custom-search/v1/reference/rest/v1/Search

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

export type SearchResult = {
  image: string;
  width: number;
  height: number;
  thumbnail: string;
};

export async function imageSearch(
  apiKey: string,
  engineId: string,
  title: string,
  author: string,
): Promise<SearchResult[] | string> {
  let keywords = `${title} by ${author} book cover`;
  let results: SearchResult[] = [];

  try {
    // https://developers.google.com/custom-search/v1/reference/rest/v1/cse/list?apix=true
    var params = new URLSearchParams({
      key: apiKey,
      cx: engineId,
      filter: "0", // do not filter duplicate content
      num: "10", // number of results to obtain
      searchType: "image",
      q: keywords,
    }).toString();

    let response: GoogleSearchResponse = await fetch(`${endpoint}?${params}`).then((res) => res.json());

    response.items?.forEach((item) => {
      results.push({
        image: item.link ?? "",
        width: item.image?.width ?? 0,
        height: item.image?.height ?? 0,
        thumbnail: item.image?.thumbnailLink ?? "",
      });
    });

    return results;
  } catch (error: any) {
    console.error(error);
    return error.toString();
  }
}