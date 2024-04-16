type Manga = {
  version: "1";
  title: string;
  authors: Author[];
  artists: Author[];
  tags: string[];
  datePublished: string;
  dateRead: string;
  timestampAdded: number; // ms
  rating: number;
  notes: string;
  images: {
    hasImage: boolean;
    imageUpdated?: number;
  };
  volumes: MangaVolume[];
  ids: {
    mangaDexId: string;
  };
};

type MangaVolume = {
  version: "1";
  title: string;
  number?: number;
  images: {
    hasImage: boolean;
    imageUpdated?: number;
  };
  chapters: MangaChapter[];
};

type MangaChapter = {
  version: "1";
  number?: number;
  title: string;
  datePublished?: string;
  dateRead?: string;
  images: {
    hasImage: boolean;
    imageUpdated?: number;
  };
  ids: {
    mangaDexId: string;
  };
};
