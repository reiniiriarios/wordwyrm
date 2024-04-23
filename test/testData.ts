type Book = {
  version: "2";
  title: string;
  authors: {
    name: string;
    birth?: string;
    death?: string;
    ids?: {
      openLibraryId?: string;
    };
  }[];
  tags: string[];
  series: string;
  seriesNumber: string;
  datePublished: string;
  dateRead: string;
  timestampAdded: number;
  rating: number;
  description: string;
  notes: string;
  images: {
    hasImage: boolean;
    imageUpdated?: number;
  };
  ids: {
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
  cache: {
    authorDir?: string;
    filename?: string;
    filepath?: string;
    urlpath?: string;
    searchId?: string;
    image?: string;
    thumbnail?: string;
  };
};

const data: { [author: string]: { [book: string]: Partial<Book> } } = {
  "Author One": {
    "Book One": {
      version: "2",
      title: "Book One",
      authors: [
        {
          name: "Author One",
          ids: {
            openLibraryId: "ABC",
          },
        },
      ],
      datePublished: "2000-01-01",
      dateRead: "2023-04-23",
      tags: ["Fiction", "General"],
      series: "Some Series",
      seriesNumber: "1",
      timestampAdded: 1700000000010,
      rating: 3,
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      notes:
        "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      images: {
        hasImage: true,
        imageUpdated: 1700000000001,
      },
      ids: {
        googleBooksId: "ABCD",
        isbn: "123",
        openLibraryId: "/works/ABCD",
        amazonId: "456",
        goodreadsId: "789",
        internetArchiveId: "bookoneabcd",
        libraryThingId: "101112",
        oclcId: "131415",
      },
    },
    "Book Two": {
      version: "2",
      title: "Book Two",
      authors: [
        {
          name: "Author One",
        },
      ],
      datePublished: "2001-01-01",
      tags: ["Fiction", "General"],
      series: "Some Series",
      seriesNumber: "2",
      timestampAdded: 1700000000020,
      rating: 4,
      description: "",
      notes: "",
      images: {
        hasImage: true,
        imageUpdated: 1700000000001,
      },
    },
  },
  "Test Author": {
    "A Book": {
      version: "2",
      title: "A Book",
      authors: [
        {
          name: "Test Author",
        },
      ],
      datePublished: "2002-01-01",
      dateRead: "2024-04-22",
      tags: ["Fiction", "General"],
      timestampAdded: 1700000000005,
      rating: 4,
      description: "",
      notes: "",
      images: {
        hasImage: true,
        imageUpdated: 1700000000001,
      },
    },
    "Test Book": {
      version: "2",
      title: "Test Book",
      authors: [
        {
          name: "Test Author",
        },
      ],
      datePublished: "2002-01-01",
      dateRead: "2024-04-23",
      tags: ["Fiction", "General"],
      timestampAdded: 1700000000000,
      rating: 4,
      description: "",
      notes: "",
      images: {
        hasImage: true,
        imageUpdated: 1700000000001,
      },
    },
  },
};

export default data;
