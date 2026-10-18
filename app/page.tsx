"use client";

import { useEffect, useMemo, useState } from "react";
import roster from "../data/roster.json";
import Image from "next/image";

type Group = "Kaleci" | "Defans" | "Orta Saha" | "Forvet";
type Player = { id: string; number: number; name: string; short: string; group: Group; role: string };
type Slot = { playerId: string; x: number; y: number };
type FormationKey = "4-2-3-1" | "4-3-3" | "4-4-2" | "3-4-2-1" | "3-5-2" | "Özel";

const players: Player[] = roster.players as Player[];

const playerMap = new Map(players.map((player) => [player.id, player]));
const initialIds = ["1","4","42","6","90","34","20","53","83","10","45"];
const formationOrder: Exclude<FormationKey, "Özel">[] = ["4-2-3-1","4-3-3","4-4-2","3-4-2-1","3-5-2"];
const templates: Record<Exclude<FormationKey, "Özel">, Array<[number,number]>> = {
  "4-2-3-1": [[50,90],[16,73],[38,76],[62,76],[84,73],[38,56],[62,56],[18,34],[50,38],[82,34],[50,14]],
  "4-3-3": [[50,90],[16,73],[38,76],[62,76],[84,73],[30,53],[50,58],[70,53],[18,29],[82,29],[50,14]],
  "4-4-2": [[50,90],[16,73],[38,76],[62,76],[84,73],[16,48],[39,55],[61,55],[84,48],[38,20],[62,20]],
  "3-4-2-1": [[50,90],[25,73],[50,77],[75,73],[13,50],[39,55],[61,55],[87,50],[34,32],[66,32],[50,13]],
  "3-5-2": [[50,90],[25,73],[50,77],[75,73],[12,49],[34,55],[50,45],[66,55],[88,49],[36,20],[64,20]],
};
const makeInitial = (): Slot[] => initialIds.map((playerId, index) => ({ playerId, x:templates["4-2-3-1"][index][0], y:templates["4-2-3-1"][index][1] }));
const STORAGE_KEY = "galatasaray-kadro-2026-27-v2";

export default function Home() {
  const [lineup, setLineup] = useState<Slot[]>(makeInitial);
  const [formation, setFormation] = useState<FormationKey>("4-2-3-1");
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<string>("45");
  const [captain, setCaptain] = useState("20");
  const [penalty, setPenalty] = useState("45");
  const [freeKick, setFreeKick] = useState("10");
  const [dragging, setDragging] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Tümü" | Group>("Tümü");
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    // Read browser-only persistence after hydration so the server and first client render match.
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.lineup) && parsed.lineup.length === 11 &&
          new Set(parsed.lineup.map((slot: Slot) => slot.playerId)).size === 11 &&
          parsed.lineup.every((slot: Slot) => playerMap.has(slot.playerId) &&
            Number.isFinite(slot.x) && Number.isFinite(slot.y) && slot.x >= 7 && slot.x <= 93 && slot.y >= 7 && slot.y <= 94)) {
          setLineup(parsed.lineup);
        }
        if (formationOrder.includes(parsed.formation) || parsed.formation === "Özel") setFormation(parsed.formation);
        if (playerMap.has(parsed.captain)) setCaptain(parsed.captain);
        if (playerMap.has(parsed.penalty)) setPenalty(parsed.penalty);
        if (playerMap.has(parsed.freeKick)) setFreeKick(parsed.freeKick);
      }
    } catch { localStorage.removeItem(STORAGE_KEY); }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lineup, formation, captain, penalty, freeKick }));
  }, [lineup, formation, captain, penalty, freeKick, hydrated]);

  const bench = useMemo(() => {
    const onPitch = new Set(lineup.map((slot) => slot.playerId));
    return players.filter((player) => !onPitch.has(player.id))
      .filter((player) => filter === "Tümü" || player.group === filter)
      .filter((player) => `${player.name} ${player.number}`.toLocaleLowerCase("tr").includes(search.toLocaleLowerCase("tr")));
  }, [lineup, filter, search]);

  const selectedPlayer = playerMap.get(detailId) ?? players[0];
  const flash = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 1700); };
  const applyFormation = (key: Exclude<FormationKey, "Özel">) => {
    setFormation(key);
    setLineup((current) => current.map((slot, index) => ({ ...slot, x:templates[key][index][0], y:templates[key][index][1] })));
    flash(`${key} dizilişi uygulandı`);
  };
  const replacePlayer = (playerId: string, slotIndex = selectedSlot) => {
    if (slotIndex === null) { setDetailId(playerId); return; }
    setLineup((current) => current.map((slot, index) => index === slotIndex ? { ...slot, playerId } : slot));
    setSelectedSlot(null); setDetailId(playerId); flash("Oyuncu değişikliği yapıldı");
  };
  const reset = () => {
    setLineup(makeInitial()); setFormation("4-2-3-1"); setCaptain("20"); setPenalty("45"); setFreeKick("10"); setSelectedSlot(null); flash("Varsayılan kadro geri yüklendi");
  };
  const saveNow = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lineup, formation, captain, penalty, freeKick })); flash("Kadro bu cihazda kaydedildi");
  };
  const onPitchMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = Math.max(7, Math.min(93, ((event.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(7, Math.min(94, ((event.clientY - rect.top) / rect.height) * 100));
    setLineup((current) => current.map((slot, index) => index === dragging ? { ...slot, x, y } : slot));
    setFormation("Özel");
  };
  const onBenchDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const playerId = event.dataTransfer.getData("playerId");
    if (!playerMap.has(playerId)) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    let nearest = 0; let distance = Infinity;
    lineup.forEach((slot, index) => { const next = Math.hypot(slot.x - x, slot.y - y); if (next < distance) { distance = next; nearest = index; } });
    replacePlayer(playerId, nearest); setFormation("Özel");
  };

  return (
    <main className="app-shell">
      {toast && <div className="toast" role="status">✓ {toast}</div>}
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true"><span>G</span><span>S</span></div>
        <div className="brand-copy"><p className="eyebrow">GALATASARAY · 2026/27</p><h1>Kadro Tahtası</h1></div>
        <div className="header-actions"><button className="ghost-button" onClick={reset} type="button">↺ <span>Sıfırla</span></button><button className="save-button" onClick={saveNow} type="button">✓ <span>Kadroyu kaydet</span></button></div>
      </header>

      <section className="summary-bar">
        <div><span className="live-dot" /> <strong>A Takım Kadrosu</strong><small>Doğrulandı: {new Date(`${roster.checkedAt}T12:00:00`).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</small></div>
        <p><b>{players.length}</b> oyuncu · <b>{lineup.length}</b> ilk 11 · <b>{players.length - lineup.length}</b> yedek</p>
      </section>

      <section className="workspace">
        <div className="pitch-panel">
          <div className="pitch-toolbar">
            <div><span className="section-kicker">SAHA</span><strong>İlk 11</strong></div>
            <div className="formation-tabs" aria-label="Diziliş seçimi">
              {formationOrder.map((item) => <button className={formation === item ? "active" : ""} onClick={() => applyFormation(item)} key={item} type="button">{item}</button>)}
              {formation === "Özel" && <button className="active custom" type="button">Özel</button>}
            </div>
          </div>
          <div className="pitch-help"><span>↕</span> Oyuncuları sürükle; yedekten oyuncuyu sahadaki ismin üzerine bırak.</div>
          <div className="pitch" onPointerMove={onPitchMove} onPointerUp={() => setDragging(null)} onPointerCancel={() => setDragging(null)} onDragOver={(event) => event.preventDefault()} onDrop={onBenchDrop}>
            <div className="field-outline" /><div className="halfway" /><div className="center-dot" /><div className="circle" /><div className="box box-top" /><div className="goal-box goal-top" /><div className="box box-bottom" /><div className="goal-box goal-bottom" />
            {lineup.map((slot, index) => {
              const player = playerMap.get(slot.playerId)!;
              return (
                <button
                  className={`player ${selectedSlot === index ? "selected" : ""} ${dragging === index ? "dragging" : ""}`}
                  key={`${index}-${player.id}`}
                  style={{ left:`${slot.x}%`, top:`${slot.y}%` }}
                  onPointerDown={(event) => { event.currentTarget.setPointerCapture(event.pointerId); setDragging(index); setSelectedSlot(index); setDetailId(player.id); }}
                  onClick={() => { setSelectedSlot(index); setDetailId(player.id); }}
                  type="button"
                  aria-label={`${player.name}, ${player.role}. Taşımak için sürükle.`}
                >
                  <span className="avatar-wrap"><Image src={`/players/${player.number}.jpg`} alt="" width={58} height={58} unoptimized draggable={false} />
                    {captain === player.id && <i className="captain-badge">K</i>}
                    {penalty === player.id && <i className="duty-badge penalty">P</i>}
                    {freeKick === player.id && <i className="duty-badge freekick">F</i>}
                  </span>
                  <span className="player-name"><b>{player.number}</b> {player.short}</span>
                  <span className="role-pill">{player.role}</span>
                </button>
              );
            })}
          </div>
          <div className="pitch-footer"><span className="mini-crest">GS</span><strong>GALATASARAY</strong><span className="formation-badge">{formation}</span></div>
        </div>

        <aside className="side-panel">
          <div className="side-heading"><div><p className="eyebrow">KADRO HAVUZU</p><h2>Yedek Kulübesi</h2></div><span>{bench.length}</span></div>
          {selectedSlot !== null && <div className="swap-notice"><b>{playerMap.get(lineup[selectedSlot].playerId)?.short}</b> seçildi. Yerine alacağın oyuncuya tıkla.</div>}
          <label className="search-box"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Oyuncu ara..." aria-label="Oyuncu ara" /></label>
          <div className="filters">
            {(["Tümü","Kaleci","Defans","Orta Saha","Forvet"] as const).map((item) => <button className={filter === item ? "active" : ""} onClick={() => setFilter(item)} key={item} type="button">{item === "Orta Saha" ? "Orta S." : item}</button>)}
          </div>
          <div className="bench-list">
            {bench.map((player) => (
              <button className="bench-player" key={player.id} onClick={() => replacePlayer(player.id)} draggable onDragStart={(event) => { event.dataTransfer.setData("playerId", player.id); event.dataTransfer.effectAllowed = "move"; }} type="button">
                <Image src={`/players/${player.number}.jpg`} alt="" width={47} height={47} unoptimized /><span className="shirt-number">{player.number}</span><span className="bench-copy"><b>{player.name}</b><small>{player.role} · {player.group}</small></span><span className="add-player">{selectedSlot !== null ? "↔" : "›"}</span>
              </button>
            ))}
            {bench.length === 0 && <p className="empty-state">Aramana uygun oyuncu bulunamadı.</p>}
          </div>

          <div className="detail-card">
            <div className="detail-player"><Image src={`/players/${selectedPlayer.number}.jpg`} alt="" width={56} height={61} unoptimized /><div><span>#{selectedPlayer.number}</span><h3>{selectedPlayer.name}</h3><p>{selectedPlayer.group} · {selectedPlayer.role}</p></div></div>
            <p className="detail-label">OYUNCU GÖREVLERİ</p>
            <div className="duty-buttons"><button className={captain === selectedPlayer.id ? "active" : ""} onClick={() => setCaptain(selectedPlayer.id)} type="button"><b>K</b>Kaptan</button><button className={penalty === selectedPlayer.id ? "active" : ""} onClick={() => setPenalty(selectedPlayer.id)} type="button"><b>P</b>Penaltı</button><button className={freeKick === selectedPlayer.id ? "active" : ""} onClick={() => setFreeKick(selectedPlayer.id)} type="button"><b>F</b>Frikik</button></div>
          </div>
        </aside>
      </section>

      <footer><p>Değişiklikler otomatik olarak yalnızca bu tarayıcıya kaydedilir.</p><a href={roster.source} target="_blank" rel="noreferrer">Kadro kaynağı: Galatasaray.org ↗</a></footer>
    </main>
  );
}
