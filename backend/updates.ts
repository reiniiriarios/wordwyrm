import fetch from "electron-fetch";

const user = "reiniiriarios";
const repo = "book-tracker";

export async function hasUpdate(currentVersion: string, callback?: (updateAvailable: string | null) => void) {
  let updateAvailable: string | null = null;
  fetch(`https://api.github.com/repos/${user}/${repo}/releases?per_page=1`)
    .then((res) => res.json())
    .then((releases) => {
      const tag = releases[0].tag_name;
      if (!tag.match(/^v\d+\.\d+\.\d+/)) {
        throw "Invalid tag";
      }
      const latestVersion = tag.slice(1);
      if (latestVersion !== currentVersion) {
        updateAvailable = latestVersion;
      }
    })
    .catch((err) => {
      console.error(err);
    });
  if (callback) callback(updateAvailable);
}
