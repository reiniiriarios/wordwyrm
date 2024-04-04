/// <reference types="svelte" />

import { api } from "../electron/preload";

type UserSettings = {
  booksDir: string;
  chartStartYear: number;
  searchEngines: string[];
  googleApiKey: string;
  googleSearchEngineId: string;
  filterTags: string;
  commonTags: string;
  appVersion: string;
};

type AppState = {
  books: {
    sort: string;
    reverse: boolean;
    filter: string;
    tag: string;
    recent: string;
    zoom: string;
  };
};

declare global {
  interface Window {
    electronAPI: typeof api;
    userSettings: UserSettings;
    appState: AppState;
  }
}
