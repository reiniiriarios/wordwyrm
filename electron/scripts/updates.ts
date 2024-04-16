import fetch from "electron-fetch";

const DEV = process.env.WYRM_ENV === "dev";

const user = "reiniiriarios";
const repo = "wordwyrm";

/**
 * Check for app updates.
 *
 * @param {string} currentVersion
 * @returns Returns new version if available or null if up to date.
 */
export async function checkForUpdate(currentVersion: string): Promise<string | null> {
  return await fetch(`https://api.github.com/repos/${user}/${repo}/releases?per_page=1`)
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
      return null;
    });
}
