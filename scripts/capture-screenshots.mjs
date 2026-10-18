import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import assert from "node:assert/strict";

const browser = await chromium.launch({ channel: "chrome", headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1150 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(process.env.PREVIEW_URL ?? "http://localhost:3000", { waitUntil: "networkidle" });
  await page.locator(".player").first().waitFor();
  await page.getByRole("button", { name: "Sıfırla" }).click();
  await page.locator(".toast").waitFor({ state: "hidden" });
  assert.equal(await page.locator(".player").count(), 11);
  assert.equal(await page.locator(".bench-player").count(), 21);
  assert.equal(await page.locator("img").evaluateAll((images) => images.every((i) => i.complete && i.naturalWidth > 0)), true);
  await mkdir("docs/screenshots", { recursive: true });
  await page.screenshot({ path: "docs/screenshots/masaustu.png", fullPage: true });

  await page.getByRole("button", { name: "4-3-3", exact: true }).click();
  assert.equal(await page.locator(".formation-badge").innerText(), "4-3-3");
  await page.locator(".player").nth(7).click();
  await page.getByRole("textbox", { name: "Oyuncu ara" }).fill("Leão");
  await page.locator(".bench-player").click();
  assert.match(await page.locator(".player").nth(7).innerText(), /Leão/);
  await page.getByRole("button", { name: /Kaptan/ }).click();
  await page.reload({ waitUntil: "networkidle" });
  assert.match(await page.locator(".player").nth(7).innerText(), /Leão/);
  assert.equal(await page.locator(".formation-badge").innerText(), "4-3-3");
  assert.equal(await page.locator(".player").nth(7).locator(".captain-badge").count(), 1);
  await page.locator(".player").nth(7).click();
  await page.getByRole("textbox", { name: "Oyuncu ara" }).fill("Deniz");
  await page.screenshot({ path: "docs/screenshots/oyuncu-degisikligi.png", fullPage: true });

  await page.getByRole("button", { name: "Sıfırla" }).click();
  await page.getByRole("textbox", { name: "Oyuncu ara" }).fill("");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator(".toast").waitFor({ state: "hidden" });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.screenshot({ path: "docs/screenshots/mobil.png", fullPage: true });
  assert.deepEqual(errors, []);
  console.log("11 oyuncu, 21 yedek, fotoğraflar, diziliş, değişiklik, kaptan, kalıcılık ve mobil görünüm doğrulandı; 3 ekran görüntüsü kaydedildi.");
} finally {
  await browser.close();
}
