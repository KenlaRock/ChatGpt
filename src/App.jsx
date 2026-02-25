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
  CheckCircle2,
  Gauge,
  Link2,
  Layers,
  FileDown,
} from "lucide-react";

/**
 * NOTE: This build intentionally avoids Tailwind + advanced color functions (oklch).
 * All colors are hex/rgba and all layout is plain CSS/inline styles for max compatibility.
 */

const THEME = {
  bg: "#050507",
  panel: "rgba(15, 15, 18, 0.55)",
  panel2: "rgba(10, 10, 12, 0.55)",
  border: "rgba(255, 255, 255, 0.10)",
  border2: "rgba(255, 255, 255, 0.14)",
  text: "#F4F4F5",
  text2: "#D4D4D8",
  text3: "#A1A1AA",
  text4: "#71717A",
  shadow: "0 20px 70px -30px rgba(0,0,0,0.85)",
};

const styles = {
  shell: {
    minHeight: "100vh",
    width: "100%",
    background: THEME.bg,
    color: THEME.text,
  },
  container: {
    maxWidth: 1152,
    margin: "0 auto",
    padding: "40px 24px 56px",
  },
  topbar: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  badgeIcon: {
    borderRadius: 16,
    border: `1px solid ${THEME.border}`,
    background: THEME.panel2,
    padding: 12,
  },
  badgeText: { display: "flex", flexDirection: "column", gap: 2 },
  row: { display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" },
  button: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    border: `1px solid ${THEME.border}`,
    background: THEME.panel2,
    color: THEME.text2,
    padding: "12px 16px",
    fontSize: 14,
    cursor: "pointer",
    userSelect: "none",
  },
  buttonDisabled: { opacity: 0.45, cursor: "not-allowed" },
  metaBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderRadius: 16,
    border: `1px solid ${THEME.border}`,
    background: THEME.panel2,
    padding: "12px 20px",
  },
  slideFrame: {
    borderRadius: 24,
    border: `1px solid ${THEME.border}`,
    padding: 28,
    backgroundImage:
      "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
  },
  footerTip: {
    color: THEME.text4,
    fontSize: 12,
    lineHeight: 1.6,
  },
  grid12: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 16,
  },
  card: {
    borderRadius: 16,
    border: `1px solid ${THEME.border}`,
    background: THEME.panel,
    boxShadow: THEME.shadow,
  },
};

const Card = ({ children, style }) => (
  <div style={{ ...styles.card, ...style }}>{children}</div>
);

const Pill = ({ icon: Icon, title, children }) => (
  <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
    <div
      style={{
        marginTop: 2,
        borderRadius: 12,
        border: `1px solid ${THEME.border}`,
        background: THEME.panel2,
        padding: 8,
      }}
    >
      <Icon size={20} color={THEME.text2} />
    </div>
    <div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: 0.4,
          color: THEME.text2,
        }}
      >
        {title}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 13,
          lineHeight: 1.55,
          color: THEME.text3,
        }}
      >
        {children}
      </div>
    </div>
  </div>
);

const SectionTitle = ({ kicker, title, subtitle }) => (
  <div>
    {kicker ? (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          borderRadius: 999,
          border: `1px solid ${THEME.border}`,
          background: THEME.panel2,
          padding: "6px 12px",
          fontSize: 11,
          letterSpacing: "0.2em",
          color: THEME.text3,
          marginBottom: 10,
        }}
      >
        <Radio size={14} color={THEME.text3} />
        {kicker}
      </div>
    ) : null}

    <div
      style={{
        fontSize: 34,
        fontWeight: 700,
        letterSpacing: -0.4,
        color: THEME.text,
      }}
    >
      {title}
    </div>

    {subtitle ? (
      <div
        style={{
          marginTop: 12,
          maxWidth: 880,
          fontSize: 16,
          lineHeight: 1.65,
          color: THEME.text3,
        }}
      >
        {subtitle}
      </div>
    ) : null}
  </div>
);

const Checklist = ({ items }) => (
  <div style={{ display: "grid", gap: 12 }}>
    {items.map((x, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          borderRadius: 16,
          border: `1px solid ${THEME.border}`,
          background: THEME.panel2,
          padding: 16,
        }}
      >
        <CheckCircle2 size={20} color={THEME.text2} style={{ marginTop: 2 }} />
        <div style={{ fontSize: 13, lineHeight: 1.6, color: THEME.text3 }}>
          {x}
        </div>
      </div>
    ))}
  </div>
);

const TimelineRow = ({ week, purpose, items, microcopy }) => (
  <Card style={{ padding: 20 }}>
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
        justifyContent: "space-between",
      }}
    >
      <div style={{ minWidth: 190 }}>
        <div
          style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}
        >
          {week}
        </div>
        <div
          style={{
            marginTop: 6,
            fontSize: 18,
            fontWeight: 700,
            color: THEME.text,
          }}
        >
          {purpose}
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 260 }}>
        <ul
          style={{
            margin: 0,
            paddingLeft: 0,
            listStyle: "none",
            display: "grid",
            gap: 10,
          }}
        >
          {items.map((x, i) => (
            <li
              key={i}
              style={{
                display: "flex",
                gap: 10,
                color: THEME.text3,
                fontSize: 13,
              }}
            >
              <span
                style={{
                  marginTop: 7,
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.28)",
                  flex: "0 0 auto",
                }}
              />
              <span style={{ lineHeight: 1.6 }}>{x}</span>
            </li>
          ))}
        </ul>

        {microcopy ? (
          <div
            style={{
              marginTop: 14,
              borderRadius: 12,
              border: `1px solid ${THEME.border}`,
              background: THEME.panel2,
              padding: "10px 14px",
              fontSize: 13,
              color: THEME.text2,
            }}
          >
            <span style={{ color: THEME.text4 }}>Exempeltext: </span>
            <span style={{ fontWeight: 700, letterSpacing: 0.6 }}>
              {microcopy}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  </Card>
);

function useLocalImage() {
  const [dataUrl, setDataUrl] = useState(null);
  const [fileName, setFileName] = useState(null);

  const onPick = async (file) => {
    if (!file) return;
    const ok = /image\/(png|jpeg|jpg|webp)/.test(file.type);
    if (!ok) {
      alert("Välj en PNG/JPG/WebP.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setDataUrl(reader.result);
      setFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  return { dataUrl, fileName, onPick, clear: () => (setDataUrl(null), setFileName(null)) };
}

function SlideBody({ slide, img }) {
  return (
    <div style={styles.slideFrame}>
      <SectionTitle kicker={slide.kicker} title={slide.title} subtitle={slide.subtitle} />
      {slide.body(img)}
    </div>
  );
}

async function loadPdfDeps() {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  return { html2canvas, jsPDF };
}

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
  const img = useLocalImage();
  const hiddenRefs = useRef([]);

  useEffect(() => {
    runSelfTests();
  }, []);

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
            <div style={{ gridColumn: "span 7" }}>
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

            <div style={{ gridColumn: "span 5" }}>
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
            <div style={{ gridColumn: "span 7" }}>
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
            <div style={{ gridColumn: "span 5" }}>
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
            <div style={{ gridColumn: "span 7" }}>
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
            <div style={{ gridColumn: "span 5" }}>
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
            <div style={{ gridColumn: "span 7" }}>
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
            <div style={{ gridColumn: "span 5" }}>
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
            <div style={{ gridColumn: "span 7" }}>
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

            <div style={{ gridColumn: "span 5" }}>
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
    []
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

  const exportPdf = async () => {
    if (!img.dataUrl) {
      alert("Ladda upp nyckelbilden först — PDF:en ska bära den.");
      return;
    }
    setBusy(true);
    try {
      const { html2canvas, jsPDF } = await loadPdfDeps();

      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const margin = 28;
      const targetW = pageW - margin * 2;
      const targetH = pageH - margin * 2;

      const nodes = hiddenRefs.current.filter(Boolean);

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 50));

        // eslint-disable-next-line no-await-in-loop
        const canvas = await html2canvas(node, {
          backgroundColor: THEME.bg,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png", 1.0);
        const cW = canvas.width;
        const cH = canvas.height;

        const ratio = Math.min(targetW / cW, targetH / cH);
        const drawW = cW * ratio;
        const drawH = cH * ratio;
        const x = (pageW - drawW) / 2;
        const y = (pageH - drawH) / 2;

        if (i > 0) pdf.addPage();

        pdf.setDrawColor(40, 40, 40);
        pdf.setLineWidth(1);
        pdf.roundedRect(margin - 8, margin - 8, targetW + 16, targetH + 16, 12, 12);
        pdf.addImage(imgData, "PNG", x, y, drawW, drawH, undefined, "FAST");

        pdf.setTextColor(170);
        pdf.setFontSize(9);
        pdf.text(`${i + 1}/${nodes.length}  •  ${img.fileName || "key-visual"}`, pageW - margin, pageH - 12, {
          align: "right",
        });
      }

      pdf.save(`NorthStarRising_ReleaseDeck_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
      alert("PDF-export misslyckades.\n\n" + (e?.message || ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={styles.shell}>
      <div style={styles.container}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={styles.topbar}>
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

            <div style={styles.row}>
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
            </div>
          </div>

          <div style={styles.metaBar}>
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
            >
              <SlideBody slide={slides[idx]} img={img} />
            </motion.div>
          </AnimatePresence>

          <div style={styles.footerTip}>
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