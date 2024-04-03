export type Author = {
  name: string;
  birth?: string;
  death?: string;
};

export type Book = {
  title: string;
  authors: Author[];
  authorDir: string;
  filename: string;
  tags: string[];
  series?: string;
  datePublished?: string;
  dateRead?: string;
  hasImage?: boolean;
  imageUpdated?: number;
  image?: string;
  thumbnail?: string;
  googleBooksId?: string;
  isbn?: string;
};
