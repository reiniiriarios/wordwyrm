import NotFound from "@pages/404/404.svelte";
import Books from "@pages/books/Books.svelte";
import Book from "@pages/book/Book.svelte";
import EditBook from "@pages/book/Edit.svelte";
import Settings from "@pages/settings/Settings.svelte";
import Chart from "@pages/chart/Chart.svelte";
import List from "@pages/list/List.svelte";

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
