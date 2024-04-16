import { Manga as MDManga, Author as MDAuthor, Chapter as MDChapter, resolveArray } from "mangadex-full-api";

export async function searchManga(query: string): Promise<Manga[]> {
  try {
    let res = await MDManga.search({
      title: query,
      limit: 8, // API Max is 100 per request, but this function accepts more
    });
    let manga: Manga[] = [];
    for await (const m of res) {
      manga.push(await conformManga(m));
    }
    return manga;
  } catch (e) {
    console.error(e);
    return [];
  }
}

export async function getManga(id: string, full: boolean = true): Promise<Manga | null> {
  try {
    let res = await MDManga.get(id, full);
    return await conformManga(res);
  } catch (e) {
    console.error(e);
    return null;
  }
}

export async function getMangaChapters(
  id: string,
  language: string = "en",
  limit: number = 10,
  offset: number = 0,
): Promise<MangaVolume[]> {
  try {
    let res = await MDManga.getFeed(id, {
      translatedLanguage: [language],
      limit,
      offset,
      order: {
        publishAt: "asc",
      },
    });
    return conformMangaChapters(res);
  } catch (e) {
    console.error(e);
    return [];
  }
}

async function conformManga(m: MDManga): Promise<Manga> {
  let manga: Manga = {
    version: "1",
    title: m.title,
    authors: [],
    artists: [],
    tags: m.tags.map((t) => t.name),
    datePublished: m.year.toString(),
    dateRead: "",
    timestampAdded: new Date().getTime(),
    rating: 0,
    notes: "",
    images: {
      hasImage: false,
    },
    volumes: [],
    ids: {
      mangaDexId: m.id,
    },
  };
  for (const t of ["authors", "artists"]) {
    for (const a of m[t]) {
      manga[t].push({
        name: m[t].cached ? (await a.resolve()).name : "",
        ids: {
          mangaDexId: a.id,
        },
      });
    }
  }
  return manga;
}

function conformMangaChapters(chs: MDChapter[]): MangaVolume[] {
  let volumes: { [volume: string]: MangaVolume };
  for (const ch of chs) {
    if (!volumes[ch.volume]) {
      volumes[ch.volume] = {
        version: "1",
        title: ch.volume,
        images: { hasImage: false },
        chapters: [],
      };
    }
    volumes[ch.volume].chapters.push({
      version: "1",
      title: ch.title,
      datePublished: getDateYmd(ch.publishAt),
      images: { hasImage: false },
      ids: {
        mangaDexId: ch.id,
      },
    });
  }
  return Object.values(volumes);
}

function getDateYmd(d: Date): string {
  return (
    d.getUTCFullYear() +
    "-" +
    d.getUTCMonth().toString().padStart(2, "0") +
    "-" +
    d.getUTCDate().toString().padStart(2, "0")
  );
}
