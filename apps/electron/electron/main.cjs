const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

const windowIcon = path.resolve(__dirname, "../../web/public/app-logo-512.png");

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    title: "GitLoud",
    icon: windowIcon,
    frame: false,
    backgroundColor: "#0f1115",
    titleBarStyle: process.platform === "darwin" ? "hidden" : "default",
    trafficLightPosition:
      process.platform === "darwin" ? { x: 16, y: 14 } : undefined,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  win.loadURL("http://localhost:5173");

  const showDebugger = process.env.ELECTRON_SHOW_DEBUGGER === "true";

  if (!app.isPackaged && showDebugger) {
    win.webContents.openDevTools({ mode: "detach" });
  }
}

app.whenReady().then(createWindow);

ipcMain.on("window:minimize", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.minimize();
});

ipcMain.on("window:maximize", (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);

  if (!win) {
    return;
  }

  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});

ipcMain.on("window:close", (event) => {
  BrowserWindow.fromWebContents(event.sender)?.close();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
