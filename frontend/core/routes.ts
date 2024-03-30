import NotFound from "@pages/404/404.svelte";
import Books from "@pages/books/books.svelte";
import Book from "@pages/book/book.svelte";
import Settings from "@pages/settings/settings.svelte";

export default {
  "/": Books,
  "/book": Book,
  "/book/:author/:book": Book,
  "/settings": Settings,
  "*": NotFound,
};
