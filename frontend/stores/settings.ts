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
    save: async (newSettings: UserSettings) => {
      set(newSettings);
      window.electronAPI.saveSettings(newSettings);
    },
  };
}
export const settings = createSettings();

export const currentTheme = writable("");

function createPlatform() {
  const { subscribe, set } = writable("");

  const removeListener = window.electronAPI.platform((p: string) => {
    set(p);
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
