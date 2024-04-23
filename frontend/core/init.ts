import App from "@core/App.svelte";
import log from "electron-log/renderer";

log.transports.console.level =
  window.electronAPI.env === "prod" ? "info" : window.electronAPI.env === "test" ? "error" : "debug";

const app = new App({
  target: document.body,
});

export default app;
