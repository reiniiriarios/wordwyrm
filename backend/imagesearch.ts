import fetch from "electron-fetch";

const url = "https://duckduckgo.com/";

const p = -1; // moderate false
const retries = 2;
const iterations = 1;

export type SearchResult = {
  image: string;
  title: string;
  height: number;
  thumbnail: string;
  width: number;
  url: string;
  source: string;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function imageSearch(title: string, author: string): Promise<SearchResult[]> {
  let reqUrl = url + "i.js";
  let keywords = `${title} by ${author} book cover`;
  let attempt = 0;
  let results: SearchResult[] = [];

  try {
    let tokens = await fetch(`${url}?q=${keywords}`)
      .then((res) => res.text())
      .then((text) => text.match(/vqd=([\d-]+)\&/));
    let token = tokens && tokens.length > 1 ? tokens[1] : "";
    if (!token) throw "Error getting token";

    var params = new URLSearchParams({
      l: "wt-wt",
      o: "json",
      q: keywords,
      vqd: token,
      f: ",,,",
      p: "" + p,
    }).toString();

    for (let i = 0; i < iterations; i++) {
      while (true) {
        try {
          let response = await fetch(`${reqUrl}?${params}`, {
            headers: {
              dnt: "1",
              "accept-encoding": "gzip, deflate, sdch",
              "x-requested-with": "XMLHttpRequest",
              "accept-language": "en-GB,en-US;q=0.8,en;q=0.6,ms;q=0.4",
              "user-agent":
                "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36",
              accept: "application/json, text/javascript, */*; q=0.01",
              referer: "https://duckduckgo.com/",
              authority: "duckduckgo.com",
            },
          }).then((res) => res.json());

          if (!response.results) throw "No results";
          results = [...results, ...response.results];
          if (!response.next) {
            return results;
          }
          reqUrl = url + response.next;
          attempt = 0;
          break;
        } catch (error) {
          console.error(error);
          attempt++;
          if (attempt > retries) {
            return results;
          }
          await sleep(5000);
          continue;
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
  return results;
}
