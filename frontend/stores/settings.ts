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
