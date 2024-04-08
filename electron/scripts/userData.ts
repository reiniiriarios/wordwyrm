import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";
import { UserSettings } from "../../types/global";

const USER_DATA_PATH =
  process.env.APPDATA ||
  (process.platform == "darwin" ? process.env.HOME + "/Library/Preferences" : process.env.HOME + "/.local/share");
const DATA_PATH = path.join(USER_DATA_PATH, "me.reinii.book-tracker");

export function initUserDirs() {
  if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH, { recursive: true });
  }
}

export function readYaml(filename: string): any {
  try {
    const doc = yaml.load(fs.readFileSync(filename, "utf8"));
    return doc;
  } catch (e) {
    console.error(e);
  }
}

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

export function loadSettings(): UserSettings {
  const sf = path.join(DATA_PATH, "settings.yaml");
  if (!fs.existsSync(sf)) {
    saveYaml(sf, {});
    return {} as UserSettings;
  }
  let settings: UserSettings = readYaml(sf);
  if (!settings.searchEngines) {
    settings.searchEngines = [];
  }
  // Verify we have the API Key to search with the Google Books engine.
  else if (!settings.googleApiKey?.length && settings.searchEngines.includes("googleBooks")) {
    settings.searchEngines.filter((e) => e !== "googleBooks");
  }
  return settings;
}

export function saveSettings(settings: UserSettings) {
  return saveYaml(path.join(DATA_PATH, "settings.yaml"), settings);
}
