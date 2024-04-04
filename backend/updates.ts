import fetch from "electron-fetch";

const user = "reiniiriarios";
const repo = "book-tracker";

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
        return latestVersion;
      }
    })
    .catch((err) => {
      console.error(err);
      return null;
    });
}
