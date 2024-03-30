export type Author = {
  name: string;
  birth?: string;
  death?: string;
};

export type Book = {
  title: string;
  authors: Author[];
  filename: string;
  tags: string[];
  datePublished?: string;
  dateRead?: string;
  image?: string;
};
