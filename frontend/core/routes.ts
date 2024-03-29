import Wild from "@pages/wild/wild.svelte";
import NotFound from "@pages/404/404.svelte";
import Books from "@pages/books/books.svelte";

export default {
  "/": Books,
  "/wild": Wild,
  "/wild/*": Wild,
  "*": NotFound,
};
