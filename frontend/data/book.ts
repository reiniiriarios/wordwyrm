export type Author = {
  name: string;
  birth?: string;
  death?: string;
};

export type Book = {
  title: string;
  authors: Author[];
  authorDir?: string;
  filename?: string;
  tags: string[];
  series?: string;
  datePublished?: string;
  dateRead?: string;
  timestampAdded?: number; // ms
  hasImage?: boolean;
  imageUpdated?: number;
  image?: string;
  thumbnail?: string;
  isbn?: string;
  googleBooksId?: string;
  goodreadsId?: string;
  amazonId?: string;
  libraryThingId?: string;
  wikidataId?: string;
  openLibraryId?: string;
  internetArchiveId?: string;
  oclcId?: string;
};
