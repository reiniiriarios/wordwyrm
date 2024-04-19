import log from "electron-log/renderer";
import { writable } from "svelte/store";
import { UserSettings } from "types/global";

function createSettings() {
  const { subscribe, set } = writable({} as UserSettings);

  const rmListenerSettings = window.electronAPI.settingsLoaded((newSettings: UserSettings) => {
    // ensure default values where necessary
    if (!newSettings.searchEngines.length) {
      newSettings.searchEngines = ["openLibrary"];
    }
    if (!newSettings.chartStartYear) {
      newSettings.chartStartYear = 2020;
    }
    set(newSettings);
    currentTheme.set(newSettings.theme);
  });

  return {
    subscribe,
    destroy: () => {
      rmListenerSettings();
    },
    fetch: () => {
      window.electronAPI.loadSettings();
    },
    save: async (newSettings: UserSettings, moveData: boolean = false) => {
      set(newSettings);
      window.electronAPI.saveSettings(newSettings, moveData);
    },
  };
}
export const settings = createSettings();

export const currentTheme = writable("");

type PlatformInfo = {
  platform: string;
  arch: string;
  pkg: string;
  fileBrowser: string;
};

function createPlatform() {
  const def: PlatformInfo = {
    platform: "",
    arch: "",
    pkg: "",
    fileBrowser: "",
  };
  const { subscribe, set } = writable(def);

  const removeListener = window.electronAPI.platform((p: PlatformInfo) => {
    p.fileBrowser = p.platform === "darwin" ? "Finder" : p.platform === "win32" ? "File Explorer" : "File Manager";
    set(p);
    log.info(`platform:${p.platform}, arch:${p.arch}, package:${p.pkg}`);
  });

  return {
    subscribe,
    destroy: () => {
      removeListener();
    },
    fetch: () => {
      window.electronAPI.getPlatform();
    },
  };
}
export const platform = createPlatform();
