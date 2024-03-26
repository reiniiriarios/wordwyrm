import Home from "@pages/home/home.svelte";
import Wild from "@pages/wild/wild.svelte";
import NotFound from "@pages/404/404.svelte";

export default {
  "/": Home,
  "/wild": Wild,
  "/wild/*": Wild,
  "*": NotFound,
};
