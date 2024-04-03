/// <reference types="svelte" />

import { api } from "../electron/preload";

type UserSettings = {
  booksDir: string;
  chartStartYear: number;
  googleApiKey: string;
  googleSearchEngineId: string;
  filterTags: string;
  commonTags: string;
};

declare global {
  interface Window {
    electronAPI: typeof api;
    userSettings: UserSettings;
  }
}
