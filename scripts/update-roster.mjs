import { mkdir, readFile, writeFile } from "node:fs/promises";

const source = "https://www.galatasaray.org/pl/futbol-takim-kadrosu/9";
const root = new URL("../", import.meta.url);
const decode = (text) => text.replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
  .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ").trim();

const previous = JSON.parse(await readFile(new URL("data/roster.json", root), "utf8"));
const response = await fetch(source);
if (!response.ok) throw new Error(`Kadro kaynağı: HTTP ${response.status}`);
const html = await response.text();
const blocks = html.split('<div class="photolist_block">').slice(1);
const groups = { kaleci: "Kaleci", defans: "Defans", "orta saha": "Orta Saha", forvet: "Forvet" };
const players = blocks.flatMap((block) => {
  const title = block.match(/<p class="title">\s*(\d+)\s*-\s*([^<]+)<\/p>/);
  const groupText = block.match(/<p class="desc">\s*([^<]+)<\/p>/);
  const photo = block.match(/<img src="(https:\/\/[^\"]+)"/);
  if (!title || !groupText || !photo) return [];
  const name = decode(title[2]);
  const group = groups[decode(groupText[1]).toLocaleLowerCase("tr")];
  if (!group) throw new Error(`Bilinmeyen mevki: ${groupText[1]}`);
  const old = previous.players.find((p) => p.name === name);
  const words = name.split(" ");
  return [{ id: title[1], number: Number(title[1]), name, short: old?.short ?? `${words[0][0]}. ${words.at(-1)}`,
    group, role: old?.role ?? ({ Kaleci: "KL", Defans: "DEF", "Orta Saha": "MO", Forvet: "F" })[group], photo: decode(photo[1]) }];
});
if (players.length < 18 || new Set(players.map((p) => p.id)).size !== players.length) {
  throw new Error("Kadro doğrulanamadı; mevcut dosyalar değiştirilmedi.");
}
// Download all images before replacing the data file; a failed request leaves the roster intact.
const images = await Promise.all(players.map(async (p) => {
  const image = await fetch(p.photo);
  if (!image.ok || !image.headers.get("content-type")?.startsWith("image/")) throw new Error(`Fotoğraf alınamadı: ${p.name}`);
  return [p.number, Buffer.from(await image.arrayBuffer())];
}));
await mkdir(new URL("public/players/", root), { recursive: true });
for (const [number, bytes] of images) await writeFile(new URL(`public/players/${number}.jpg`, root), bytes);
await writeFile(new URL("data/roster.json", root), JSON.stringify({ source, checkedAt: new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Istanbul" }), players }, null, 2) + "\n");
console.log(`Resmî kaynaktan ${players.length} oyuncu ve fotoğraf güncellendi.`);
