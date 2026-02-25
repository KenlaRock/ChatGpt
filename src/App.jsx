import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Upload,
  Target,
  Snowflake,
  Sparkles,
  Radio,
  Gauge,
  Link2,
  Layers,
  FileDown,
} from "lucide-react";
import { THEME, styles } from "./theme";
import { Card, Pill, Checklist, TimelineRow, SlideBody } from "./components/primitives";
import { useLocalImage } from "./hooks/useLocalImage";
import { exportSlidesToPdf } from "./lib/pdf";

/**
 * NOTE: This build intentionally avoids Tailwind + advanced color functions (oklch).
 * All colors are hex/rgba and all layout is plain CSS/inline styles for max compatibility.
 */
// Tests (simple runtime asserts)
function runSelfTests() {
  const themeStr = JSON.stringify(THEME);
  console.assert(!/oklch\(/i.test(themeStr), "THEME contains oklch() — should not happen.");
  console.assert(/^#/.test(THEME.bg), "THEME.bg should be hex.");
  console.assert(/rgba\(/.test(THEME.panel), "THEME.panel should be rgba().");
}

export default function App() {
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installReady, setInstallReady] = useState(false);
  const [notifState, setNotifState] = useState(() =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const img = useLocalImage();
  const hiddenRefs = useRef([]);
  const touchStartX = useRef(null);

  useEffect(() => {
    runSelfTests();
  }, []);

  const leftCol = useMemo(() => ({ gridColumn: isMobile ? "span 12" : "span 7" }), [isMobile]);
  const rightCol = useMemo(() => ({ gridColumn: isMobile ? "span 12" : "span 5" }), [isMobile]);

  const slides = useMemo(
    () => [
      {
        id: "hero",
        title: "North Star Rising — Releaseplan & Social Media-plan",
        kicker: "KALL SIGNAL / KALL PRECISION",
        subtitle:
          "En körbar deck som styr tonalitet, tempo och publicerings-tryck. Ingen förklaring. Bara signal.",
        body: (img) => (
          <div style={{ ...styles.grid12, marginTop: 24 }}>
            <div style={leftCol}>
              <Card style={{ padding: 24 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: "0.2em",
                        color: THEME.text4,
                      }}
                    >
                      NYCKELASSET
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 18,
                        fontWeight: 700,
                        color: THEME.text,
                      }}
                    >
                      Bifogad 3x3-panel
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 13,
                        color: THEME.text3,
                        lineHeight: 1.6,
                      }}
                    >
                      Ladda upp bilden så blir den ett centralt element i hela
                      presentationen.
                    </div>
                  </div>

                  <label style={{ ...styles.button }}>
                    <Upload size={16} color={THEME.text2} />
                    <span>Ladda upp bild</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => img.onPick(e.target.files?.[0])}
                    />
                  </label>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    display: "grid",
                    gap: 14,
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  }}
                >
                  <Pill icon={Target} title="Mål (hårt)">
                    Igenkänning + mystik. Förväntan. Max tryck första 48 timmar.
                  </Pill>
                  <Pill icon={Snowflake} title="Estetik (helig)">
                    Svart/vitt, stål, is, rök, ljuskontrast, symbolik. Minimal
                    accent.
                  </Pill>
                  <Pill icon={Gauge} title="Tempo">
                    Långsamt → explosivt. Tease bygger spänning. Release smäller.
                  </Pill>
                  <Pill icon={Radio} title="Persona">
                    Anonym styrka. Kall precision. Nordisk tyngd. Inga emojis.
                    Inga ursäkter.
                  </Pill>
                </div>

                <div
                  style={{
                    marginTop: 18,
                    borderRadius: 16,
                    border: `1px solid ${THEME.border}`,
                    background: THEME.panel2,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: "0.2em",
                      color: THEME.text4,
                    }}
                  >
                    MINDSET
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 16,
                      fontWeight: 700,
                      color: THEME.text,
                    }}
                  >
                    “Vi förklarar inte — vi visar.”
                  </div>
                </div>
              </Card>
            </div>

            <div style={rightCol}>
              <Card style={{ padding: 12 }}>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    overflow: "hidden",
                    borderRadius: 14,
                    border: `1px solid ${THEME.border}`,
                    background: THEME.panel2,
                  }}
                >
                  {img.dataUrl ? (
                    <img
                      src={img.dataUrl}
                      alt={img.fileName || "Key visual"}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 28,
                        textAlign: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: THEME.text3 }}>
                          Ingen bild laddad ännu.
                        </div>
                        <div
                          style={{ marginTop: 8, fontSize: 11, color: THEME.text4 }}
                        >
                          Klicka “Ladda upp bild” och välj den bifogade 3x3-panelen.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div
                  style={{
                    marginTop: 10,
                    padding: "0 6px 6px",
                    fontSize: 11,
                    color: THEME.text4,
                  }}
                >
                  Tips: Kör samma bild som grid-post, men även som beskärda utsnitt i reels/stories.
                </div>
              </Card>
            </div>
          </div>
        ),
      },

      {
        id: "rules",
        kicker: "REGLER SOM INTE FÅR BRYTAS",
        title: "Estetik, text och disciplin",
        subtitle:
          "Det här är ert “style police”-slide. Om ett inlägg inte följer detta: kasta det. Hellre få stenhårda posts än mycket brus.",
        body: () => (
          <div style={{ ...styles.grid12, marginTop: 24 }}>
            <div style={leftCol}>
              <Card style={{ padding: 24 }}>
                <div style={{ display: "grid", gap: 14 }}>
                  <Pill icon={Snowflake} title="Visuellt språk">
                    Nära monokrom bas (kallt stål/aska/is). Rök/volumetrics. Hård ljuskontrast. Symbolen är diegetisk.
                  </Pill>
                  <Pill icon={Sparkles} title="Textspråk">
                    Kort. Suggestivt. Imperativt. Punkt. Inga emojis. Inga förklaringar. Aldrig “nu släpper vi…”-snack.
                  </Pill>
                  <Pill icon={Gauge} title="Tempo & dramaturgi">
                    Vecka -3/-2: bygg signal. Vecka -1: namnge. Releasedag: överkör.
                  </Pill>
                  <Pill icon={Layers} title="Upprepning (med flit)">
                    Samma visuella språk tills det sätter sig. Variation = utsnitt, timing, ljudbit — inte ny identitet.
                  </Pill>
                </div>
              </Card>
            </div>
            <div style={rightCol}>
              <Card style={{ padding: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}>
                  COPY BANK (KORT & KALL)
                </div>
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  {[
                    "THE SIGNAL IS LIVE.",
                    "COLD PROTOCOL ACTIVE",
                    "TRANSMISSION RECEIVED",
                    "NO HEAT. NO MERCY.",
                    "YOU HEARD IT. NOW MOVE.",
                    "REPEAT.",
                    "SECOND WAVE",
                  ].map((t, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 12,
                        border: `1px solid ${THEME.border}`,
                        background: THEME.panel2,
                        padding: "10px 14px",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: 0.6,
                        color: THEME.text2,
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, fontSize: 11, color: THEME.text4 }}>
                  Stark åsikt: ni vinner på militär minimalism. Folk blir trygga av att ni låter som en maskin.
                </div>
              </Card>
            </div>
          </div>
        ),
      },

      {
        id: "timeline",
        kicker: "3 VECKOR RUNT RELEASEN",
        title: "Tidslinje som går att följa utan att tappa kyla",
        subtitle:
          "Strukturen nedan är designad för igenkänning, frekvensdisciplin och maximal conversion på dag 0–2.",
        body: () => (
          <div style={{ marginTop: 24, display: "grid", gap: 12 }}>
            <TimelineRow
              week="VECKA −3"
              purpose="Tease / Närvaro"
              items={[
                "2–3 inlägg: stillbild eller 5–7s mörk loop (rök/rörelse/ljus)",
                "Story: nedräkning utan kontext (bara datum/symbol)",
                "CTA: ingen — du vill ha nyfikenhet, inte friktion",
              ]}
              microcopy="NORTHSTAR RISING — INITIATED"
            />
            <TimelineRow
              week="VECKA −2"
              purpose="Identitet"
              items={[
                "3–4 inlägg: reveal av logotyp/emblem (kallt, rent)",
                "8–10s reel med instrumental snippet (utan titel)",
                "Stillbild från artwork (delbeskuren) för att tvinga folk att “fylla i”",
                "Story: poll “Cold / Colder” + loopad ljudsnutt",
              ]}
              microcopy="A NEW SIGNAL EMERGES — NORTHSTAR RISING"
            />
            <TimelineRow
              week="VECKA −1"
              purpose="Singelannonsering"
              items={[
                "4–5 inlägg: artwork reveal (hel bild)",
                "Titel + releasedatum (en rad)",
                "10–12s reel med refräng-drop",
                "Pre-save post (link in bio) — inga ursäkter, bara order",
                "Story: daglig nedräkning + hook-loop + pre-save",
              ]}
              microcopy="FROZEN IN CARBIDE — OUT [DATUM]"
            />
            <TimelineRow
              week="RELEASEDAG"
              purpose="Max tryck (48h)"
              items={[
                "Reel/video med starkaste delen (det ska kännas oundvikligt)",
                "Stillbild + tydlig länk",
                "Story x3: OUT NOW → Swipe/Link → Repost första reaktioner",
                "Pinned post: singelreel",
              ]}
              microcopy="OUT NOW"
            />
            <TimelineRow
              week="VECKA +1"
              purpose="Eftertryck"
              items={[
                "3–4 inlägg: lyric-video loop + visualizer-clip",
                "“Behind the sound” (abstrakt — inga pratiga selfies)",
                "Kommentar-screenshot från lyssnare",
              ]}
              microcopy="YOU HEARD THE SIGNAL. NOW SPREAD IT."
            />
          </div>
        ),
      },

      {
        id: "platform",
        kicker: "PLATTFORMAR",
        title: "Samma signal — olika förpackning",
        subtitle:
          "Ni är inte här för att ‘vara sociala’. Ni är här för att skicka en kall signal, om och om igen, tills folk lyssnar.",
        body: () => (
          <div style={{ ...styles.grid12, marginTop: 24 }}>
            <div style={leftCol}>
              <Card style={{ padding: 24 }}>
                <div style={{ display: "grid", gap: 14 }}>
                  <Pill icon={Radio} title="Instagram (huvudplattform)">
                    Reels + Stories. Pinna singelreelen. Stories = nedräkning, poll, reaktioner.
                  </Pill>
                  <Pill icon={Radio} title="Facebook">
                    Samma content men lägre frekvens. Hellre kvalitet än “närvaro”.
                  </Pill>
                  <Pill icon={Radio} title="TikTok (om ni kör)">
                    7–10s drops. Loop-vänliga breakdowns. Inga förklaringar. Bara kraft.
                  </Pill>
                  <Pill icon={Link2} title="CTA-hygien">
                    Vecka -3/-2: ingen CTA. Vecka -1: pre-save. Releasedag: OUT NOW + länk. Klart.
                  </Pill>
                </div>
              </Card>
            </div>
            <div style={rightCol}>
              <Card style={{ padding: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}>
                  FORMAT-MALLAR
                </div>
                <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
                  {[
                    [
                      "Reel 8–12s",
                      "0.0–1.0s: visuellt hook. 1–10s: musikdrop. 10–12s: logga + 1 rad text.",
                    ],
                    [
                      "Story (3-pack)",
                      "1) signal/visual. 2) datum/OUT NOW. 3) länk/repost reaktion.",
                    ],
                    [
                      "Stillbild",
                      "Hel bild (vecka -1 & release). Utsnitt (vecka -2). Alltid kort copy.",
                    ],
                  ].map(([h, b], i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 12,
                        border: `1px solid ${THEME.border}`,
                        background: THEME.panel2,
                        padding: 14,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text2 }}>
                        {h}
                      </div>
                      <div style={{ marginTop: 6, fontSize: 13, color: THEME.text3, lineHeight: 1.6 }}>
                        {b}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ),
      },

      {
        id: "ops",
        kicker: "EXECUTION",
        title: "Operativ checklista (så ni faktiskt gör det)",
        subtitle:
          "Det här är den tråkiga delen som gör att den coola delen fungerar. Gör detta en gång, så blir allt lätt.",
        body: () => (
          <div style={{ ...styles.grid12, marginTop: 24 }}>
            <div style={leftCol}>
              <Card style={{ padding: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}>
                  FÖRBERED 7 DAGAR INNAN VECKA −3
                </div>
                <div style={{ marginTop: 14 }}>
                  <Checklist
                    items={[
                      "Bygg en assetbank: 1 hel artwork, 6–12 utsnitt, 3–5 rök-loopar, 2–3 logga-only frames.",
                      "Export: 1080×1920 (stories), 1080×1350 (feed), 1080×1080 (grid), 1920×1080 (YouTube/press).",
                      "Sätt copybank i en Notion/Google Doc: 20 rader max. Inga emojis. Inga förklaringar.",
                      "Lägg allt i en schemaläggare (Meta Business Suite) så ni inte improviserar sönder identiteten.",
                      "Pinned post-plan: 1 reel (release) + 1 artwork (vecka -1).",
                    ]}
                  />
                </div>
              </Card>
            </div>
            <div style={rightCol}>
              <Card style={{ padding: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}>
                  48H KPI (HÅRD MÄTNING)
                </div>
                <div
                  style={{
                    marginTop: 14,
                    display: "grid",
                    gap: 10,
                    color: THEME.text3,
                    fontSize: 13,
                  }}
                >
                  {[
                    "Reel retention: sikta på att folk ser 70–90% (korta klipp vinner).",
                    "Saves + Shares: viktigare än likes. Det är ‘signal sprids’-mätaren.",
                    "Link clicks / pre-save: allt före release är friktionstest.",
                    "Kommentarer: svara kort, kallt, konsekvent. Aldrig förklarande romaner.",
                  ].map((t, i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 12,
                        border: `1px solid ${THEME.border}`,
                        background: THEME.panel2,
                        padding: "10px 14px",
                      }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 14, fontSize: 11, color: THEME.text4 }}>
                  Stark åsikt: om retentionen suger är det inte algoritmen — det är att er reel inte har en brutal öppning.
                </div>
              </Card>
            </div>
          </div>
        ),
      },

      {
        id: "final",
        kicker: "SLUTKOMMANDO",
        title: "Publicera som en maskin",
        subtitle:
          "Ni har ett starkt språk. Nu handlar det om repetition och tajming. Folk behöver höra signalen fler gånger än du tror — och de kommer tacka dig efteråt.",
        body: (img) => (
          <div style={{ ...styles.grid12, marginTop: 24 }}>
            <div style={leftCol}>
              <Card style={{ padding: 24 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}>
                  EN ENKEL REGLA
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 24,
                    fontWeight: 800,
                    letterSpacing: -0.3,
                    color: THEME.text,
                  }}
                >
                  Om det känns för repetitivt för dig — är det precis lagom för publiken.
                </div>

                <div style={{ marginTop: 18, display: "grid", gap: 12 }}>
                  {[
                    [
                      "Daglig micro-rutin (vecka -1 & release)",
                      "1) Story: datum/symbol. 2) Reel: 10–12s drop. 3) Kommentar: 1 kall rad. 4) Repost reaktioner.",
                    ],
                    ["Copy (default)", "Titel + datum. Eller: “TRANSMISSION RECEIVED.” Punkt."],
                  ].map(([h, b], i) => (
                    <div
                      key={i}
                      style={{
                        borderRadius: 16,
                        border: `1px solid ${THEME.border}`,
                        background: THEME.panel2,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text2 }}>
                        {h}
                      </div>
                      <div
                        style={{
                          marginTop: 6,
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: THEME.text3,
                        }}
                      >
                        {b}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div style={rightCol}>
              <Card style={{ padding: 12 }}>
                <div
                  style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    overflow: "hidden",
                    borderRadius: 14,
                    border: `1px solid ${THEME.border}`,
                    background: THEME.panel2,
                  }}
                >
                  {img.dataUrl ? (
                    <img
                      src={img.dataUrl}
                      alt={img.fileName || "Key visual"}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 28,
                        textAlign: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, color: THEME.text3 }}>Ladda upp nyckelbilden.</div>
                        <div style={{ marginTop: 8, fontSize: 11, color: THEME.text4 }}>
                          Den här sliden är byggd för att bära er grid/estetik.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ marginTop: 10, padding: "0 6px 6px", fontSize: 11, color: THEME.text4 }}>
                  Pro-tip: gör 9-post grid-release (den här) på vecka -1 eller dag 0, och klipp samtidigt ut 3 rutor som story-teasers.
                </div>
              </Card>
            </div>
          </div>
        ),
      },
    ],
    [leftCol, rightCol]
  );

  const clamp = (n) => Math.max(0, Math.min(slides.length - 1, n));
  const next = () => setIdx((v) => clamp(v + 1));
  const prev = () => setIdx((v) => clamp(v - 1));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onInstall = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setInstallReady(true);
    };
    window.addEventListener("beforeinstallprompt", onInstall);
    return () => window.removeEventListener("beforeinstallprompt", onInstall);
  }, []);

  const requestNotifications = async () => {
    if (!("Notification" in window)) {
      alert("Aviseringar stöds inte i den här webbläsaren.");
      return;
    }

    const permission = await Notification.requestPermission();
    setNotifState(permission);
  };

  const triggerInstall = async () => {
    if (!installPrompt) {
      alert("Installera via webbläsarens meny om knappen inte är tillgänglig.");
      return;
    }

    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setInstallReady(false);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches?.[0]?.clientX ?? null;
  };

  const handleTouchEnd = (e) => {
    const start = touchStartX.current;
    const end = e.changedTouches?.[0]?.clientX;
    if (start == null || end == null) return;
    const dx = end - start;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) next();
    if (dx > 0) prev();
    touchStartX.current = null;
  };

  const exportPdf = async () => {
    if (!img.dataUrl) {
      alert("Ladda upp nyckelbilden först — PDF:en ska bära den.");
      return;
    }
    setBusy(true);
    try {
      const nodes = hiddenRefs.current.filter(Boolean);
      await exportSlidesToPdf({
        nodes,
        fileName: img.fileName,
        bgColor: THEME.bg,
      });
    } catch (e) {
      console.error(e);
      alert("PDF-export misslyckades.\n\n" + (e?.message || ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={{ ...styles.container, padding: isMobile ? "16px 12px 28px" : styles.container.padding }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              ...styles.topbar,
              position: isMobile ? "sticky" : "static",
              top: 0,
              zIndex: 5,
              background: isMobile ? THEME.bg : "transparent",
              paddingBottom: isMobile ? 8 : 0,
            }}
          >
            <div style={styles.badge}>
              <div style={styles.badgeIcon}>
                <Radio size={20} color={THEME.text2} />
              </div>
              <div style={styles.badgeText}>
                <div style={{ fontSize: 13, color: THEME.text3 }}>Körbar deck</div>
                <div style={{ fontSize: 11, color: THEME.text4 }}>
                  Navigera med pilarna eller piltangenter.
                </div>
              </div>
            </div>

            <div style={{ ...styles.row, width: isMobile ? "100%" : "auto" }}>
              <button
                onClick={exportPdf}
                style={{ ...styles.button, ...(busy ? styles.buttonDisabled : {}) }}
                disabled={busy}
                title={img.dataUrl ? "Exportera hela presentationen till PDF" : "Ladda upp nyckelbilden först"}
              >
                <FileDown size={16} color={THEME.text2} />
                {busy ? "Exporterar…" : "Exportera PDF"}
              </button>

              <button
                onClick={prev}
                style={{ ...styles.button, ...(idx === 0 ? styles.buttonDisabled : {}) }}
                disabled={idx === 0}
              >
                <ChevronLeft size={16} color={THEME.text2} />
                Föregående
              </button>

              <button
                onClick={next}
                style={{ ...styles.button, ...(idx === slides.length - 1 ? styles.buttonDisabled : {}) }}
                disabled={idx === slides.length - 1}
              >
                Nästa
                <ChevronRight size={16} color={THEME.text2} />
              </button>

              <button
                onClick={triggerInstall}
                style={{ ...styles.button, ...(installReady ? {} : styles.buttonDisabled) }}
                disabled={!installReady}
                title={installReady ? "Installera appen" : "Installationsprompt är inte tillgänglig ännu"}
              >
                <Link2 size={16} color={THEME.text2} />
                Installera app
              </button>

              <button
                onClick={requestNotifications}
                style={{ ...styles.button, ...(notifState === "granted" ? styles.buttonDisabled : {}) }}
                disabled={notifState === "granted" || notifState === "unsupported"}
                title="Aktivera släppaviseringar"
              >
                <Radio size={16} color={THEME.text2} />
                {notifState === "granted" ? "Aviseringar aktiva" : "Aktivera aviseringar"}
              </button>
            </div>
          </div>

          <div style={{ ...styles.metaBar, flexWrap: isMobile ? "wrap" : "nowrap", padding: isMobile ? "10px 12px" : styles.metaBar.padding }}>
            <div style={{ fontSize: 13, color: THEME.text3 }}>
              Slide <span style={{ fontWeight: 800, color: THEME.text }}>{idx + 1}</span> / {slides.length}
            </div>
            <div style={{ fontSize: 11, color: THEME.text4 }}>Key image: {img.fileName || "(inte laddad)"}</div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={slides[idx].id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <SlideBody slide={slides[idx]} img={img} />
            </motion.div>
          </AnimatePresence>

          <div style={{ ...styles.footerTip, fontSize: isMobile ? 11 : styles.footerTip.fontSize }}>
            <span style={{ color: THEME.text4 }}>Snabbt användartips:</span> Exportera PDF när ni laddat upp nyckelbilden.
            PDF:en blir en säljande “one-deck” ni kan skicka till team, label, press eller hålla som intern handbok.
          </div>
        </div>
      </div>

      {/* OFFSCREEN render for PDF */}
      <div style={{ position: "fixed", left: -10000, top: 0, width: 1200 }} aria-hidden="true">
        {slides.map((s, i) => (
          <div key={s.id} ref={(el) => (hiddenRefs.current[i] = el)} style={{ background: THEME.bg, color: THEME.text }}>
            <div style={{ padding: 40 }}>
              <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}>NORTH STAR RISING</div>
                  <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, color: THEME.text2 }}>
                    Releaseplan & Social Media Deck
                  </div>
                </div>
                <div style={{ fontSize: 11, color: THEME.text4 }}>{new Date().toISOString().slice(0, 10)}</div>
              </div>

              <SlideBody slide={s} img={img} />

              <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", fontSize: 11, color: THEME.text4 }}>
                <div>Cold Protocol • Active</div>
                <div>
                  {i + 1}/{slides.length}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}