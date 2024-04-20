import log from "electron-log/renderer";
import { get, writable } from "svelte/store";
import { UserSettings } from "types/global";

const UPDATE_EVERY = 86400000000; // 1d in ms

export const version = writable({
  current: "",
  updateAvailable: false,
  latestVersion: "",
});

function createSettings() {
  const { subscribe, set, update } = writable({} as UserSettings);

  let autoUpdateInterval: NodeJS.Timeout;

  const rmListenerSettings = window.electronAPI.settingsLoaded((newSettings: UserSettings) => {
    set(newSettings);
    currentTheme.set(newSettings.theme);
    // Only check version after settings are fully loaded.
    // Only set the interval once, before the current version is immediately set after.
    if (!get(version).current) {
      // TODO: && newSettings.autoUpdate
      settings.enableAutoUpdate();
    }
    version.update((v) => ({ ...v, current: newSettings.appVersion }));
  });

  const rmListenerUpdate = window.electronAPI.updateAvailable((latestVersion: string) => {
    version.update((v) => ({ ...v, latestVersion, updateAvailable: v.current !== latestVersion }));
  });

  return {
    subscribe,
    destroy: () => {
      rmListenerSettings();
      rmListenerUpdate();
    },
    fetch: () => {
      window.electronAPI.loadSettings();
    },
    save: async (newSettings: UserSettings, moveData: boolean = false) => {
      set(newSettings);
      window.electronAPI.saveSettings(newSettings, moveData);
    },
    enableAutoUpdate: () => {
      settings.checkVersion();
      autoUpdateInterval = setInterval(settings.checkVersion, 4500000); // every 1.25hrs
    },
    disableAutoUpdate: () => {
      clearInterval(autoUpdateInterval);
    },
    checkVersion: () => {
      const now = new Date().getTime();
      const currentSettings = get(settings);
      if (currentSettings && +(currentSettings.lastUpdateCheck ?? 0) + UPDATE_EVERY < now) {
        update((s) => {
          log.debug("Checking for update");
          window.electronAPI.checkVersion();
          s.lastUpdateCheck = now;
          window.electronAPI.saveSettings(s, false);
          return s;
        });
      }
    },
  };
}
export const settings = createSettings();

export const currentTheme = writable(""); // not derived, need separate

type PlatformInfo = {
  platform: string;
  arch: string;
  pkg: string;
  buildPlatform: string;
  fileBrowser: string;
};

function createPlatform() {
  const def: PlatformInfo = {
    platform: "",
    arch: "",
    pkg: "",
    buildPlatform: "",
    fileBrowser: "",
  };
  const { subscribe, set } = writable(def);

  const removeListener = window.electronAPI.platform((p: PlatformInfo) => {
    p.fileBrowser = p.platform === "darwin" ? "Finder" : p.platform === "win32" ? "File Explorer" : "File Manager";
    set(p);
    log.info(`platform: ${p.platform}, arch: ${p.arch}, buildPlatform: ${p.buildPlatform}, package: ${p.pkg}`);
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
