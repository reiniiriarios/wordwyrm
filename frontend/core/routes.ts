import NotFound from "@pages/404/404.svelte";
import Books from "@pages/books/books.svelte";
import Book from "@pages/book/book.svelte";
import EditBook from "@pages/book/edit.svelte";
import Settings from "@pages/settings/settings.svelte";
import Chart from "@pages/chart/chart.svelte";
import List from "@pages/list/list.svelte";

export default {
  "/": Books,
  "/book": Book,
  "/book/:author/:book/edit": EditBook,
  "/book/:author/:book": Book,
  "/list": List,
  "/chart": Chart,
  "/settings": Settings,
  "*": NotFound,
};
