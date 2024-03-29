import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

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
    const doc = yaml.dump(data);
    fs.writeFileSync(filename, doc, { flag: "w", encoding: "utf8" });
  } catch (e) {
    console.error(e);
  }
}

export function loadSettings(): Record<string, any> {
  const sf = path.join(DATA_PATH, "settings.yaml");
  if (!fs.existsSync(sf)) {
    saveYaml(sf, {});
    return {};
  }
  return readYaml(sf);
}

export function saveSettings(settings: Record<string, any>) {
  return saveYaml(path.join(DATA_PATH, "settings.yaml"), settings);
}
