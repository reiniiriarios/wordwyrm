import fs from "fs";
import path from "path";
import { exec } from "child_process";
import readline from "readline";

import packageJson from "../package.json";
import packageLock from "../package-lock.json";

const newVersion = process.argv.pop();
if (!newVersion || !/^\d\.\d\.\d$/.test(newVersion)) {
  console.error("Invalid new version. Usage: npm run newver 1.2.3");
  process.exit();
}

let pkgJsonNew = packageJson;
let pkgLockNew = packageLock;
pkgJsonNew.version = newVersion;
pkgLockNew.version = newVersion;
pkgLockNew.packages[""].version = newVersion;

const dir = path.join(__dirname, "..");

const log = (message: string) => console.log(`\x1b[36m→ \x1b[35m${message}\x1b[0m`);
const logExec = (cmd: string, cb?: () => void) => {
  log(cmd);
  exec(cmd, (err, stdout, stderr) => {
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    if (err) {
      console.error(err);
      process.exit();
    }
    if (cb) cb();
  });
};

log("updating package files");
try {
  fs.writeFileSync(path.join(dir, "package.json"), JSON.stringify(pkgJsonNew, null, 2) + "\n");
  fs.writeFileSync(path.join(dir, "package-lock.json"), JSON.stringify(pkgLockNew, null, 2) + "\n");
} catch (err) {
  if (err) console.error(err);
  process.exit();
}

logExec("git add package.json package-lock.json", () => {
  logExec(`git commit -m "chore: update version to ${newVersion}"`, () => {
    logExec(`git tag v${newVersion}`, () => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question(`\x1b[36m→ \x1b[35mPush? (Y/n)\x1b[0m `, (ans) => {
        rl.close();
        if (!ans || ["y", "yes"].includes(ans.toLowerCase())) {
          logExec(`git push`, () => {
            logExec(`git push origin v${newVersion}`);
          });
        }
      });
    });
  });
});
