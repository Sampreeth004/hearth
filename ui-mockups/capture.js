/**
 * Captures every Hearth view as a desktop and mobile PNG.
 *
 * Uses puppeteer-core with the locally installed Chrome so the viewport can be
 * set exactly (the Chrome CLI clamps small windows to ~492px, which would clip
 * the mobile layout).
 *
 * Run:
 *   npm install puppeteer-core        # once, anywhere reachable via NODE_PATH
 *   node capture.js
 */
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer-core");

const ROOT = __dirname;
const BASE = pathToFileURL(path.join(ROOT, "mockup.html")).href;

function findChrome() {
  const candidates = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  throw new Error("No Chromium browser found.");
}

const DESKTOP = [
  ["login", "01-login"],
  ["chats-empty", "02-chats-empty"],
  ["chat-active", "03-chat-active"],
  ["chat-gif", "04-chat-gif-picker"],
  ["chat-profile", "05-chat-user-profile"],
  ["chat-lightbox", "06-chat-image-lightbox"],
  ["chat-toast", "07-chat-toast"],
  ["friends", "08-friends"],
  ["friends-requests", "09-friends-requests"],
  ["friends-sent", "10-friends-sent"],
  ["search", "11-search"],
  ["profile", "12-profile"],
  ["share", "13-share"],
];

const MOBILE = [
  ["login", "01-login"],
  ["chats-empty", "02-chats-list"],
  ["chat-active", "03-chat-active"],
  ["chat-gif", "04-chat-gif-picker"],
  ["chat-profile", "05-chat-user-profile"],
  ["chat-lightbox", "06-chat-image-lightbox"],
  ["chat-toast", "07-chat-toast"],
  ["friends", "08-friends"],
  ["friends-requests", "09-friends-requests"],
  ["search", "10-search"],
  ["profile", "11-profile"],
  ["share", "12-share"],
];

async function capture(page, view, name, dir, width, height) {
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  await page.goto(`${BASE}?view=${view}`, { waitUntil: "networkidle0" });
  await page.evaluate(() => {
    const el = document.querySelector(".chat-wallpaper");
    if (el) el.scrollTop = el.scrollHeight;
  });
  await new Promise((r) => setTimeout(r, 120));
  const out = path.join(ROOT, dir, `${name}.png`);
  await page.screenshot({ path: out });
  console.log(`  OK  ${dir}\\${name}.png`);
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    args: ["--hide-scrollbars", "--disable-gpu", "--no-sandbox"],
  });
  const page = await browser.newPage();

  console.log("Desktop (1440x900):");
  for (const [view, name] of DESKTOP) await capture(page, view, name, "desktop", 1440, 900);

  console.log("Mobile (390x844):");
  for (const [view, name] of MOBILE) await capture(page, view, name, "mobile", 390, 844);

  await browser.close();
  console.log("Done.");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
