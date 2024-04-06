import { Writable, writable } from "svelte/store";

type AppState = {
  books: {
    sort: string;
    reverse: boolean;
    filter: string;
    tag: string;
    recent: string;
    search: string;
    zoom: string;
  };
};

export const appState: Writable<AppState> = writable({
  books: {
    sort: "read",
    reverse: false,
    filter: "all",
    tag: "",
    recent: "all",
    search: "",
    zoom: "m",
  },
});
