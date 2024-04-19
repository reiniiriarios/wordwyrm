import { BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log/main";
import packageJson from "../package.json";
import WyrmError from "./error";

const DEV = process.env.WYRM_ENV === "dev";
const PKG = process.env.WYRM_PKG ?? "";

const GH_USER = "reiniiriarios";
const GH_REPO = "wordwyrm";

const CAN_AUTO_UPDATE = ["dmg", "appImage", "deb", "rpm", "nsis", "linux"].includes(PKG);
const USES_APP_STORE = ["mas", "appx", "snap"].includes(PKG);

/**
 * Updater (auto and manual).
 */
class AppUpdater {
  public currentWindow: BrowserWindow;

  /**
   * Setup.
   */
  public init(): void {
    if (!CAN_AUTO_UPDATE) {
      return;
    }

    // Valid auto-update targets:
    //   macOS:   dmg
    //   Linux:   appImage, deb, rpm
    //   Windows: nsis
    autoUpdater.logger = log;
    autoUpdater.on("checking-for-update", () => {
      log.info("Checking for update...");
    });
    autoUpdater.on("update-available", (info) => {
      log.info(`Update available: ${info.version}, released ${info.releaseDate}; running ${packageJson.version}`);
    });
    autoUpdater.on("update-not-available", (_info) => {
      log.info("Update not available.");
    });
    autoUpdater.on("error", (err) => {
      log.error("Error in auto-updater:", err);
    });
    autoUpdater.on("download-progress", (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + " - Downloaded " + progressObj.percent + "%";
      log_message = log_message + " (" + progressObj.transferred + "/" + progressObj.total + ")";
      log.info(log_message);
    });
    autoUpdater.on("update-downloaded", (info) => {
      log.info("Update downloaded:", info.version);
    });
  }

  /**
   * Check for updates and notify appropriately.
   */
  public check(): void {
    if (CAN_AUTO_UPDATE) {
      log.debug("Checking for updates.");
      autoUpdater.checkForUpdatesAndNotify();
    } else if (USES_APP_STORE) {
      log.debug("This build uses an app store to update.");
    } else {
      log.debug("Checking for manual updates.");
      this.checkForUpdate();
    }
  }

  /**
   * Check for updates manually.
   */
  private checkForUpdate(): void {
    fetch(`https://api.github.com/repos/${GH_USER}/${GH_REPO}/releases?per_page=1`)
      .then((res) => res.json())
      .then((releases) => {
        const tag = releases[0].tag_name;
        if (!tag.match(/^v\d+\.\d+\.\d+/)) {
          throw "Invalid tag";
        }
        const latestVersion = tag.slice(1);
        if (latestVersion === packageJson.version) {
          log.info(`Up to date, running ${latestVersion}`);
          return;
        }
        if (DEV) {
          log.info(`Version mismatch: latest is ${latestVersion}, running ${packageJson.version}`);
        } else {
          log.info(`Update available: ${latestVersion}, running ${packageJson.version}`);
        }
        this.currentWindow.webContents.send("updateAvailable", latestVersion);
      })
      .catch((err) => {
        log.error(err);
        this.currentWindow.webContents.send("error", new WyrmError("Error checking for updates.", err).getData());
      });
  }
}

export default new AppUpdater();
