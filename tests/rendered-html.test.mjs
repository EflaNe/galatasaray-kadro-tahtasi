import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import test from "node:test";

const roster = JSON.parse(await readFile(new URL("../data/roster.json", import.meta.url), "utf8"));

test("roster has unique numbers, valid groups and local portraits", async () => {
  assert.ok(roster.players.length >= 18);
  assert.equal(new Set(roster.players.map((p) => p.id)).size, roster.players.length);
  assert.match(roster.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
  for (const p of roster.players) {
    assert.equal(p.id, String(p.number));
    assert.ok(["Kaleci", "Defans", "Orta Saha", "Forvet"].includes(p.group));
    assert.ok(p.name && p.short && p.role);
    await access(new URL(`../public/players/${p.number}.jpg`, import.meta.url));
  }
});

test("production worker renders the squad board and verification date", async () => {
  const { default: worker } = await import("../dist/server/index.js");
  const response = await worker.fetch(new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} });
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Galatasaray Kadro Tahtası/);
  assert.match(html, /Yedek Kulübesi/);
  assert.match(html, /Doğrulandı:/);
  assert.match(html, /4-2-3-1/);
  assert.match(html, /Victor Osimhen/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});
