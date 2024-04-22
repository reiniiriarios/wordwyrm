import * as fs from "fs-extra";
import * as yaml from "js-yaml";
import * as path from "path";
import log from "electron-log/main";
import { UserSettings } from "../../types/global";
import WyrmError from "../error";
import ENV from "../../env.cjs";

// Get platform-idiomatic user data directory.
let dataPath: string;
let dataDir: string;
if (process.env.APPDATA) {
  // Windows
  dataPath = process.env.APPDATA;
  dataDir = "WordwyrmData"; // "Wordwyrm" is used for app data.
} else if (process.platform === "darwin") {
  // macOS
  dataPath = path.join(process.env.HOME ?? "~", "/Library/Preferences");
  dataDir = "me.reinii.wordwyrm";
} else {
  // Linux
  dataPath = path.join(process.env.HOME ?? "~", "/.local/share");
  dataDir = "wordwyrm";
}
export const DATA_PATH = path.join(dataPath, dataDir);

const settingsFile = `settings${ENV ? `-${ENV}` : ""}.yaml`;

/**
 * Create user data directories if not already present.
 *
 * @returns {boolean} data directory moved
 */
export function initUserDirs(): boolean {
  if (!fs.existsSync(DATA_PATH)) {
    log.debug("Data directory not found.");
    // -- upgrade from 1.24.0 --
    // move data dir on window and linux
    if (process.platform !== "darwin") {
      const oldDir = path.join(dataPath, "me.reinii.wordwyrm");
      if (fs.existsSync(oldDir)) {
        log.debug("Migrating old data directory (>1.24.0)");
        log.debug(`${oldDir} >> ${DATA_PATH}`);
        try {
          fs.moveSync(oldDir, DATA_PATH);
          return true;
        } catch (err) {
          log.error(err);
        }
      }
    }
    // -- end --
    log.debug(`Creating: ${DATA_PATH}`);
    fs.mkdirSync(DATA_PATH, { recursive: true });
  }
  return false;
}

/**
 * Read YAML from file into object.
 *
 * @param {string} filename
 * @returns object
 *
 * @todo Use `unknown` and type guarding.
 */
export function readYaml(filename: string): unknown {
  try {
    const doc = yaml.load(fs.readFileSync(filename, "utf8"));
    return doc;
  } catch (e) {
    log.error(e);
  }
}

/**
 * Save object to YAML file.
 *
 * @param {string} filename
 * @param data object
 *
 * @todo Use `unknown` and type guarding.
 */
export function saveYaml(filename: string, data: unknown) {
  try {
    const toWrite = structuredClone(data);
    if (isTypeBook(toWrite) && toWrite.cache) {
      delete toWrite.cache;
    }
    const doc = yaml.dump(toWrite);
    fs.writeFileSync(filename, doc, { flag: "w", encoding: "utf8" });
  } catch (e) {
    log.error(e);
  }
}

/**
 * Type guard for User Settings.
 *
 * @param {unknown} obj
 * @returns is UserSettings
 */
function isTypeUserSettings(obj: unknown): obj is UserSettings {
  return typeof obj === "object" && "booksDir" in obj;
}

/**
 * Type guard for Books.
 *
 * @param {unknown} obj Data from yaml
 * @returns is Book
 */
function isTypeBook(obj: unknown): obj is Book {
  if (isTypeBookGeneric(obj)) {
    return obj.version === "2";
  }
  return false;
}

/**
 * Type guard for Books.
 *
 * @param {unknown} obj object
 * @returns is BookGeneric
 */
export function isTypeBookGeneric(obj: unknown): obj is BookGeneric {
  return typeof obj === "object" && "title" in obj && "authors" in obj;
}

/**
 * Load settings, validate, and parse for current version compatibility.
 *
 * @param args
 * @returns {UserSettings} settings
 * @throws WyrmError
 */
export function loadSettings(args?: { migrateData?: boolean }): UserSettings {
  try {
    log.debug("Loading settings");
    const sf = path.join(DATA_PATH, settingsFile);
    let settings: UserSettings;
    if (!fs.existsSync(sf)) {
      // No settings file, set minimum defaults.
      log.warn("No settings file found, creating.");
      settings = {
        booksDir: path.join(DATA_PATH, "books"),
      } as UserSettings;
      saveYaml(sf, settings);
    } else {
      // Read settings.
      const yaml = readYaml(sf);
      if (isTypeUserSettings(yaml)) {
        settings = yaml;
      } else {
        // Reset settings.
        log.error("Settings invalid. Backing up and setting defaults.");
        fs.copyFileSync(sf, `${sf}.bak`);
        settings = {
          booksDir: path.join(DATA_PATH, "books"),
        } as UserSettings;
      }
    }

    // Defaults
    if (!settings.searchEngines) {
      settings.searchEngines = ["openLibrary", "googleBooks"];
    }
    if (!settings.imageSearchEngine) {
      if (settings.googleApiKey && settings.googleSearchEngineId) {
        settings.imageSearchEngine = "google";
      } else {
        settings.imageSearchEngine = "duckduckgo";
      }
    }
    if (!settings.theme) {
      settings.theme = "default";
    }
    if (!settings.chartStartYear) {
      settings.chartStartYear = 2020;
    }
    if (!settings.booksDir) {
      settings.booksDir = path.join(DATA_PATH, "books");
    } else if (args?.migrateData) {
      // -- upgrade from 1.24.0 --
      if (settings.booksDir.startsWith(path.join(dataPath, "me.reinii.wordwyrm"))) {
        settings.booksDir = settings.booksDir.replace("me.reinii.wordwyrm", dataDir);
      }
      // -- end --
    }

    return settings;
  } catch (e) {
    throw new WyrmError("Error reading settings.", e);
  }
}

/**
 * Save user settings object to user data file.
 *
 * @param {UserSettings} settings
 * @param options
 * @param callback
 * @returns
 */
export function saveSettings(
  settings: UserSettings,
  options: { moveData?: boolean; oldDir?: string } = { moveData: false },
  callback: (error?: WyrmError) => void = () => {},
) {
  log.debug("Saving settings");
  saveYaml(path.join(DATA_PATH, settingsFile), settings);
  if (!options.moveData) {
    return callback();
  }
  moveDirectory(options.oldDir, settings.booksDir, (err) => {
    if (err) {
      return callback(err);
    }
    callback();
  });
}

/**
 * Move contents of directory with copy fallback in case of error or different drive.
 *
 * @param {string} oldDir
 * @param {string} newDir
 * @param callback
 */
function moveDirectory(oldDir: string, newDir: string, callback: (error?: WyrmError) => void) {
  // Read each author directory
  fs.readdir(oldDir, { withFileTypes: true })
    .then((files) => {
      for (const file of files) {
        if (file.isDirectory()) {
          // Move each directory
          const od = path.join(oldDir, file.name);
          const nd = path.join(newDir, file.name);
          try {
            fs.moveSync(od, nd);
          } catch (err) {
            log.error(err);
            return callback(new WyrmError("Error moving data", err));
          }
        }
      }
      return callback();
    })
    .catch((err) => {
      log.error(err);
      return callback(new WyrmError("Error reading data", err));
    });
}
