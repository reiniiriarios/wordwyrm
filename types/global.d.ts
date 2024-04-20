/// <reference types="svelte" />

import { api } from "../electron/preload";

type UserSettings = {
  booksDir: string;
  chartStartYear: number;
  searchEngines: string[];
  imageSearchEngine: "google" | "duckduckgo" | "bing" | "ecosia";
  googleApiKey: string;
  googleSearchEngineId: string;
  filterTags: string;
  commonTags: string;
  appVersion: string;
  dateFormat: string;
  theme: string;
  autoUpdate: boolean;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  lastUpdateCheck: number;
};

type WyrmErrorDetails = {
  message: string;
  details: string;
};

declare global {
  interface Window {
    electronAPI: typeof api;
  }
}
