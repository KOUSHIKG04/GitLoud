const path = require("node:path");
const { createRequire } = require("node:module");
const { PassThrough } = require("node:stream");
const electronmon = require("electronmon");

const appRoot = path.resolve(__dirname, "..");
const appRequire = createRequire(path.join(appRoot, "package.json"));
const electronPath = appRequire("electron");
const electronStdin = new PassThrough();
let electronApp;
let restarting = false;

async function restartElectron() {
  if (!electronApp || restarting) {
    return;
  }

  restarting = true;
  try {
    console.log("[dev-electron] restarting Electron...");
    await electronApp.restart();
  } finally {
    restarting = false;
  }
}

function handleInput(chunk) {
  const input = chunk.toString().trim().toLowerCase();

  if (input === "r" || input === "rs") {
    void restartElectron();
  }
}

function bindRestartInput() {
  process.stdin.setEncoding("utf8");
  process.stdin.resume();
  process.stdin.on("data", handleInput);

  console.log("[dev-electron] Press r then Enter to restart Electron.");
}

async function start() {
  electronApp = await electronmon({
    cwd: appRoot,
    args: ["electron/main.cjs"],
    env: process.env,
    electronPath,
    stdio: [electronStdin, process.stdout, process.stderr],
    patterns: [
      "electron/**/*",
      "src/**/*",
      "public/**/*",
      "package.json",
      "!dist/**",
      "!node_modules/**",
    ],
  });

  bindRestartInput();
}

process.on("SIGINT", () => {
  electronStdin.destroy();
  process.exit(0);
});

start().catch((error) => {
  console.error("[dev-electron] failed to start", error);
  process.exit(1);
});
