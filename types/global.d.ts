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
  dateFormat: string;
  theme: string;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
};

declare global {
  interface Window {
    electronAPI: typeof api;
  }
}
