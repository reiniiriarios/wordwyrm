import NotFound from "@pages/404/404.svelte";
import Books from "@pages/books/books.svelte";
import Settings from "@pages/settings/settings.svelte";

export default {
  "/": Books,
  "/settings": Settings,
  "*": NotFound,
};
