import * as fs from "fs-extra";
import * as yaml from "js-yaml";
import * as path from "path";
import { UserSettings } from "../../types/global";
import WyrmError from "../error";

// Get platform-idiomatic user data directory.
let dataPath: string;
let dataDir: string;
// Windows
if (process.env.APPDATA) {
  dataPath = process.env.APPDATA;
  dataDir = "WordwyrmData"; // "Wordwyrm" is used for app data.
}
// macOS
else if (process.platform === "darwin") {
  dataPath = path.join(process.env.HOME, "/Library/Preferences");
  dataDir = "me.reinii.wordwyrm";
}
// Linux
else {
  dataPath = path.join(process.env.HOME, "/.local/share");
  dataDir = "wordwyrm";
}
export const DATA_PATH = path.join(dataPath, dataDir);

const SCREENSHOT_MODE = process.env.WYRM_PREV === "true";

/**
 * Create user data directories if not already present.
 *
 * @returns {boolean} data directory moved
 */
export function initUserDirs(): boolean {
  if (!fs.existsSync(DATA_PATH)) {
    console.log("Data directory not found, creating");
    // -- upgrade from 1.24.0 --
    // move data dir on window and linux
    if (process.platform !== "darwin") {
      const oldDir = path.join(dataPath, "me.reinii.wordwyrm");
      if (fs.existsSync(oldDir)) {
        console.log("Migrating old data directory (>1.24.0)");
        try {
          fs.moveSync(oldDir, DATA_PATH);
          return true;
        } catch (err) {
          console.error(err);
        }
      }
    }
    // -- end --
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
export function readYaml(filename: string): any {
  try {
    const doc = yaml.load(fs.readFileSync(filename, "utf8"));
    return doc;
  } catch (e) {
    console.error(e);
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
export function saveYaml(filename: string, data: any) {
  try {
    let toWrite = structuredClone(data);
    if (toWrite.cache) delete toWrite.cache;
    const doc = yaml.dump(toWrite);
    fs.writeFileSync(filename, doc, { flag: "w", encoding: "utf8" });
  } catch (e) {
    console.error(e);
  }
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
    const sf = path.join(DATA_PATH, "settings.yaml");
    if (!fs.existsSync(sf)) {
      saveYaml(sf, {});
      return {} as UserSettings;
    }
    let settings: UserSettings = readYaml(sf);

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

    if (!settings.booksDir) {
      settings.booksDir = path.join(DATA_PATH, "books");
    } else if (SCREENSHOT_MODE) {
      settings.booksDir = path.join(DATA_PATH, "DEV-screenshot-mode");
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
  saveYaml(path.join(DATA_PATH, "settings.yaml"), settings);
  if (!options.moveData) return callback();
  moveDirectory(options.oldDir, settings.booksDir, (err) => {
    if (err) return callback(err);
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
      for (let file of files) {
        if (file.isDirectory()) {
          // Move each directory
          const od = path.join(oldDir, file.name);
          const nd = path.join(newDir, file.name);
          try {
            fs.moveSync(od, nd);
          } catch (err) {
            console.error(err);
            return callback(new WyrmError("Error moving data", err));
          }
        }
      }
      return callback();
    })
    .catch((err) => {
      console.error(err);
      return callback(new WyrmError("Error reading data", err));
    });
}
