import fetch from "electron-fetch";
import WyrmError from "../error";

const DEV = process.env.WYRM_ENV === "dev";
const PKG = process.env.WYRM_PKG ?? "";

const GH_USER = "reiniiriarios";
const GH_REPO = "wordwyrm";

/**
 * Check for app updates.
 *
 * @param {string} currentVersion
 * @returns Returns new version if available or null if up to date.
 * @throws WyrmError
 */
export async function checkForUpdate(currentVersion: string): Promise<string | null> {
  // Updates for some platforms are handled by the Microsoft App Store / Snap Store.
  if (PKG === "appx" || PKG === "snap") return null;
  // else: linux, windows, darwin:

  return await fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/releases?per_page=1`)
    .then((res) => res.json())
    .then((releases) => {
      const tag = releases[0].tag_name;
      if (!tag.match(/^v\d+\.\d+\.\d+/)) {
        throw "Invalid tag";
      }
      const latestVersion = tag.slice(1);
      if (latestVersion !== currentVersion) {
        if (DEV) {
          console.log(`Version mismatch: latest is ${latestVersion}, running ${currentVersion}`);
        } else {
          console.log(`Update available: ${latestVersion}, running ${currentVersion}`);
        }
        return latestVersion;
      }
      console.log(`Running latest version: ${currentVersion}`);
      return null;
    })
    .catch((err) => {
      console.error(err);
      throw new WyrmError("Error checking for updates.", err);
    });
}
