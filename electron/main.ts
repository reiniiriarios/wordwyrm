import { app, BrowserWindow, shell } from "electron";
import { LogMessage } from "electron-log";
import log from "electron-log/main";
import * as path from "path";

import packageJson from "../package.json";
import BUILD from "./build";

import { UserSettings } from "../types/global";

import ENV from "../env.cjs";
import bridge from "./bridge";
import autoUpdate from "./autoUpdate";

import { DATA_PATH, initUserDirs, loadSettings, saveSettings } from "./data/userData";

const PORT = 5000;

/**
 * Startup.
 */
app.on("ready", () => {
  // Setup logging
  log.transports.file.level = ENV === "prod" ? "info" : "debug";
  log.transports.file.format = "{h}:{i}:{s}.{ms} [{level}] {text}";
  log.transports.console.level = ENV === "prod" ? "info" : ENV === "test" ? "error" : "debug";
  log.transports.console.format = ({ message }: { message: LogMessage }): unknown[] => {
    const d = message.date || new Date();
    const h = d.getHours().toString(10).padStart(2, "0");
    const i = d.getMinutes().toString(10).padStart(2, "0");
    const s = d.getSeconds().toString(10).padStart(2, "0");
    const m = d.getMilliseconds().toString(10).padStart(3, "0");
    const level = `[${message.level || "info"}]`.padEnd(7, " ");
    const c = { debug: 34, info: 36, warn: 33, error: 31 }[message.level] ?? 35;
    return [`\x1b[30m${h}:${i}:${s}.${m} \x1b[${c}m${level}\x1b[0m`, ...message.data];
  };
  log.transports.file.resolvePathFn = (variables) => {
    return path.join(DATA_PATH, "logs", variables.fileName);
  };
  log.initialize();

  // Start
  log.info(
    `Starting: env=${ENV}, platform=${process.platform}, arch=${process.arch}, build=${BUILD.platform}, pkg=${BUILD.package}`,
  );

  // Create user data directories if not already present.
  const migrateData = initUserDirs();
  const settings = loadSettings({ migrateData });
  settings.appVersion = packageJson.version;
  bridge.setWindowTheme(settings.theme);

  // Create window
  createWindow(settings);
  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(bridge.currentSettings || settings);
    }
  });

  // Set up auto updates.
  autoUpdate.init();

  // Init bridge for front/back communication.
  bridge.init(settings);
});

/**
 * On close.
 */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

/**
 * Create a new (main) window.
 */
function createWindow(settings: UserSettings) {
  const mainWindow = new BrowserWindow({
    width: 1445,
    height: 815,
    minWidth: 1200,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
    },
    icon: "assets/icons/512x512.png",
  });
  mainWindow.removeMenu();

  if (!["prod", "test"].includes(ENV)) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
    if (ENV !== "screenshot") {
      log.info("Opening dev tools");
      mainWindow.webContents.openDevTools();
    }
  } else {
    mainWindow.loadFile(path.join(__dirname, "../../index.html"));
  }

  if (ENV !== "screenshot") {
    mainWindow.setBounds(settings.bounds);
  }

  mainWindow.on("close", function () {
    // only if already loaded, thx
    if (bridge.currentSettings) {
      // don't change screenshot bounds
      if (ENV !== "screenshot") {
        bridge.currentSettings.bounds = mainWindow.getBounds();
      }
      saveSettings(bridge.currentSettings, {}, (err: Error) => {
        if (err) {
          log.error(err);
        }
      });
    }
  });

  // Intercept a click on anchor with `target="_blank"`.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("http:") || url.startsWith("https:")) {
      try {
        shell.openExternal(url);
      } catch (error: unknown) {
        log.error(`Failed to open url: ${error}`);
      }
    }
    return { action: "deny" };
  });

  // When creating a new window, let these two objects know about it.
  autoUpdate.currentWindow = mainWindow;
  bridge.currentWindow = mainWindow;
}
