import NotFound from "@pages/404.svelte";
import Books from "@pages/Books.svelte";
import Book from "@pages/Book.svelte";
import EditBook from "@pages/Edit.svelte";
import Settings from "@pages/Settings.svelte";
import Chart from "@pages/Chart.svelte";
import List from "@pages/List.svelte";
import Help from "@pages/Help.svelte";

export default {
  "/": Books,
  "/book": Book,
  "/book/:author/:book/edit": EditBook,
  "/book/:author/:book": Book,
  "/list": List,
  "/chart": Chart,
  "/settings": Settings,
  "/help": Help,
  "*": NotFound,
};
