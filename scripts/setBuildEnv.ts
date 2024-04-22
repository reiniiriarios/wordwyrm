import fs from "fs";
import path from "path";

const pkg = process.argv.pop();

const buildData = (() => {
  switch (pkg) {
    case "dev":
      return { platform: "dev", package: "__none__" };
    case "appImage":
      return { platform: "linux", package: pkg };
    case "appx":
      return { platform: "windows", package: pkg };
    case "deb":
      return { platform: "linux", package: pkg };
    case "dmg":
      return { platform: "darwin", package: pkg };
    case "linux":
      return { platform: "linux", package: pkg };
    case "mas":
      return { platform: "darwin", package: pkg };
    case "nsis":
      return { platform: "windows", package: pkg };
    case "rpm":
      return { platform: "linux", package: pkg };
    case "snap":
      return { platform: "linux", package: pkg };
    case "win":
      return { platform: "windows", package: "portable" };
    default:
      console.error("Invalid build package.");
      process.exit();
  }
})();

fs.writeFileSync(
  path.join(__dirname, "../electron/build.ts"),
  `export default ${JSON.stringify(buildData, undefined, 2)};\n`,
  { flag: "w", encoding: "utf8" },
);
