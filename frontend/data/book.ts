export type Author = {
  name: string;
  birth?: Date;
  death?: Date;
};

export type Book = {
  title: string;
  authors: Author[];
  filename: string;
  tags: string[];
  datePublished?: Date;
  dateRead?: Date;
};
