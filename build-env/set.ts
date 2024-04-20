import fs from "fs";
import path from "path";

const pkg = process.argv.pop();
if (!pkg || !["dev", "linux", "appImage", "appx", "deb", "dmg", "nsis", "rpm", "snap", "win"].includes(pkg)) {
  console.error("Invalid build package.");
  process.exit();
}

console.log(`Updating 'build.ts' to '${pkg}'`);
fs.copyFileSync(path.join(__dirname, `build.${pkg}.ts`), path.join(__dirname, "../electron/build.ts"));
