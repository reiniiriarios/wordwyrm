import Author from "./author";

export default class Book {
  title: string = "";
  author: Author = {
    name: "",
  };
  filename: string = "";
  tags: string[] = [];
  datePublished?: Date;
  dateRead?: Date;

  getFilename(): string {
    if (!this.filename) this.setFilename();
    return this.filename;
  }

  setFilename(): void {
    this.filename = this.genFilename();
    // todo: save file
  }

  genFilename(): string {
    const title = this.title.replace(/[^A-Za-z0-9_-]/, "_");
    const author = this.author.name.replace(/[^A-Za-z0-9_-]/, "_");
    const year = this.datePublished?.getFullYear();
    return `${author}--${title}--${year}`;
  }
}
