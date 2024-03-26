/* eslint-disable @typescript-eslint/no-var-requires */
import { app, BrowserWindow } from "electron";
import * as path from "path";
const PORT = 5000;
const DEBUG = true;

function createWindow() {
	const mainWindow = new BrowserWindow({
		width: 1024,
		height: 768,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
		},
	});

	if (DEBUG) {
		mainWindow.loadURL(`http://localhost:${PORT}`);
		mainWindow.webContents.openDevTools();
	} else {
		mainWindow.loadFile(path.join(__dirname, "../../index.html"));
	}
}

app.on("ready", () => {
	createWindow();

	app.on("activate", function () {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
