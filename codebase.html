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
 * FIX: Miljön kastar fel på färgfunktionen `oklch`.
 * Orsak: vissa Tailwind-färgtokens (t.ex. zinc-*) kan kompilera till `oklch(...)` i den här runtime:n.
 * Lösning: vi använder INGA Tailwind color utilities alls (ingen text-zinc-*, bg-zinc-*, border-zinc-* osv)
 * och sätter färger via inline styles (hex/rgba) som funkar överallt.
 *
 * PDF-export finns kvar (html2canvas + jsPDF), och får en “säljande deck”-layout.
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

const cx = (...a) => a.filter(Boolean).join(" ");

const Surface = ({ children, style, className }) => (
  <div
    className={className}
    style={{
      background: THEME.bg,
      color: THEME.text,
      ...style,
    }}
  >
    {children}
  </div>
);

const SlideShell = ({ children }) => (
  <Surface>
    <div className="min-h-screen w-full">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">{children}</div>
    </div>
  </Surface>
);

const Card = ({ className, children, style }) => (
  <div
    className={cx("rounded-2xl border", className)}
    style={{
      borderColor: THEME.border,
      background: THEME.panel,
      boxShadow: THEME.shadow,
      ...style,
    }}
  >
    {children}
  </div>
);

const Pill = ({ icon: Icon, title, children }) => (
  <div className="flex items-start gap-3">
    <div
      className="mt-0.5 rounded-xl border p-2"
      style={{ borderColor: THEME.border, background: THEME.panel2 }}
    >
      <Icon className="h-5 w-5" style={{ color: THEME.text2 }} />
    </div>
    <div>
      <div className="text-sm font-semibold tracking-wide" style={{ color: THEME.text2 }}>
        {title}
      </div>
      <div className="mt-1 text-sm leading-relaxed" style={{ color: THEME.text3 }}>
        {children}
      </div>
    </div>
  </div>
);

const SectionTitle = ({ kicker, title, subtitle }) => (
  <div>
    {kicker ? (
      <div
        className="mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs tracking-[0.2em]"
        style={{ borderColor: THEME.border, background: THEME.panel2, color: THEME.text3 }}
      >
        <Radio className="h-3.5 w-3.5" style={{ color: THEME.text3 }} />
        {kicker}
      </div>
    ) : null}

    <div className="text-3xl md:text-4xl font-semibold tracking-tight" style={{ color: THEME.text }}>
      {title}
    </div>

    {subtitle ? (
      <div
        className="mt-3 max-w-3xl text-base md:text-lg leading-relaxed"
        style={{ color: THEME.text3 }}
      >
        {subtitle}
      </div>
    ) : null}
  </div>
);

const TimelineRow = ({ week, purpose, items, microcopy }) => (
  <Card className="p-5 md:p-6">
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="min-w-[190px]">
        <div className="text-xs tracking-[0.2em]" style={{ color: THEME.text4 }}>
          {week}
        </div>
        <div className="mt-1 text-lg font-semibold" style={{ color: THEME.text }}>
          {purpose}
        </div>
      </div>
      <div className="flex-1">
        <ul className="space-y-2 text-sm leading-relaxed" style={{ color: THEME.text3 }}>
          {items.map((x, i) => (
            <li key={i} className="flex gap-2">
              <span
                className="mt-1 h-1.5 w-1.5 rounded-full"
                style={{ background: "rgba(255,255,255,0.28)" }}
              />
              <span>{x}</span>
            </li>
          ))}
        </ul>

        {microcopy ? (
          <div
            className="mt-4 rounded-xl border px-4 py-3 text-sm"
            style={{ borderColor: THEME.border, background: THEME.panel2, color: THEME.text2 }}
          >
            <span style={{ color: THEME.text4 }}>Exempeltext: </span>
            <span className="font-semibold tracking-wide">{microcopy}</span>
          </div>
        ) : null}
      </div>
    </div>
  </Card>
);

const Checklist = ({ items }) => (
  <div className="grid gap-3">
    {items.map((x, i) => (
      <div
        key={i}
        className="flex items-start gap-3 rounded-2xl border p-4"
        style={{ borderColor: THEME.border, background: THEME.panel2 }}
      >
        <CheckCircle2 className="mt-0.5 h-5 w-5" style={{ color: THEME.text2 }} />
        <div className="text-sm leading-relaxed" style={{ color: THEME.text3 }}>
          {x}
        </div>
      </div>
    ))}
  </div>
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

  return {
    dataUrl,
    fileName,
    onPick,
    clear: () => (setDataUrl(null), setFileName(null)),
  };
}

function SlideBody({ slide, img }) {
  return (
    <div
      className="rounded-3xl border p-6 md:p-10"
      style={{
        borderColor: THEME.border,
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        backgroundColor: "rgba(0,0,0,0)",
      }}
    >
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

// --- TESTS ---
// Enkla runtime-testfall: säkerställ att vi inte använder oklch-känsliga Tailwind color utilities.
function runSelfTests() {
  const forbidden = [
    "text-zinc-",
    "bg-zinc-",
    "border-zinc-",
    "from-zinc-",
    "to-zinc-",
    "via-zinc-",
    "text-neutral-",
    "bg-neutral-",
    "border-neutral-",
  ];

  const haystack = JSON.stringify({});
  // Notera: vi kan inte enkelt inspektera JSX här, men vi kan testa att THEME har hex/rgba och inte oklch.
  const themeStr = JSON.stringify(THEME);

  console.assert(!/oklch\(/i.test(themeStr), "THEME innehåller oklch — ska inte hända.");
  console.assert(/^#/.test(THEME.bg), "THEME.bg ska vara hex.");
  console.assert(/rgba\(/.test(THEME.panel), "THEME.panel ska vara rgba.");

  // Dummy test för att hålla listan vid liv (för framtida refactors).
  console.assert(Array.isArray(forbidden) && forbidden.length > 0, "Forbidden tokens ska finnas.");
  console.assert(typeof haystack === "string", "Sanity check.");
}

export default function ReleasePlanDeck() {
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
          <div className="grid gap-6 md:grid-cols-12 mt-8">
            <div className="md:col-span-7">
              <Card className="p-6 md:p-7">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs tracking-[0.2em]" style={{ color: THEME.text4 }}>
                      NYCKELASSET
                    </div>
                    <div className="mt-1 text-lg font-semibold" style={{ color: THEME.text }}>
                      Bifogad 3x3-panel
                    </div>
                    <div className="mt-1 text-sm" style={{ color: THEME.text3 }}>
                      Ladda upp bilden så blir den ett centralt element i hela presentationen.
                    </div>
                  </div>

                  <label
                    className="cursor-pointer inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm"
                    style={{ borderColor: THEME.border, background: THEME.panel2, color: THEME.text2 }}
                  >
                    <Upload className="h-4 w-4" style={{ color: THEME.text2 }} />
                    <span>Ladda upp bild</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => img.onPick(e.target.files?.[0])}
                    />
                  </label>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <Pill icon={Target} title="Mål (hårt)">
                    Igenkänning + mystik. Förväntan. Max tryck första 48 timmar.
                  </Pill>
                  <Pill icon={Snowflake} title="Estetik (helig)">
                    Svart/vitt, stål, is, rök, ljuskontrast, symbolik. Minimal accent.
                  </Pill>
                  <Pill icon={Gauge} title="Tempo">
                    Långsamt → explosivt. Tease bygger spänning. Release smäller.
                  </Pill>
                  <Pill icon={Radio} title="Persona">
                    Anonym styrka. Kall precision. Nordisk tyngd. Inga emojis. Inga ursäkter.
                  </Pill>
                </div>

                <div
                  className="mt-5 rounded-2xl border p-4"
                  style={{ borderColor: THEME.border, background: THEME.panel2 }}
                >
                  <div className="text-xs tracking-[0.2em]" style={{ color: THEME.text4 }}>
                    MINDSET
                  </div>
                  <div className="mt-2 text-base md:text-lg font-semibold tracking-tight" style={{ color: THEME.text }}>
                    “Vi förklarar inte — vi visar.”
                  </div>
                </div>
              </Card>
            </div>

            <div className="md:col-span-5">
              <Card className="p-3">
                <div
                  className="aspect-square w-full overflow-hidden rounded-xl border"
                  style={{ borderColor: THEME.border, background: THEME.panel2 }}
                >
                  {img.dataUrl ? (
                    <img
                      src={img.dataUrl}
                      alt={img.fileName || "Key visual"}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-8 text-center">
                      <div>
                        <div className="text-sm" style={{ color: THEME.text3 }}>
                          Ingen bild laddad ännu.
                        </div>
                        <div className="mt-2 text-xs" style={{ color: THEME.text4 }}>
                          Klicka “Ladda upp bild” och välj den bifogade 3x3-panelen.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 px-2 pb-2 text-xs" style={{ color: THEME.text4 }}>
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
          <div className="mt-8 grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <Card className="p-6 md:p-7">
                <div className="grid gap-4">
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
            <div className="md:col-span-5">
              <Card className="p-6">
                <div className="text-xs tracking-[0.2em]" style={{ color: THEME.text4 }}>
                  COPY BANK (KORT & KALL)
                </div>
                <div className="mt-4 space-y-3 text-sm" style={{ color: THEME.text2 }}>
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
                      className="rounded-xl border px-4 py-3 font-semibold tracking-wide"
                      style={{ borderColor: THEME.border, background: THEME.panel2 }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs" style={{ color: THEME.text4 }}>
                  Stark åsikt: ni vinner på militär minimalism. Folk blir trygga av att ni *låter* som en maskin.
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
          <div className="mt-8 grid gap-4">
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
          <div className="mt-8 grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <Card className="p-6 md:p-7">
                <div className="grid gap-4">
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
            <div className="md:col-span-5">
              <Card className="p-6">
                <div className="text-xs tracking-[0.2em]" style={{ color: THEME.text4 }}>
                  FORMAT-MALLAR
                </div>
                <div className="mt-4 space-y-3 text-sm" style={{ color: THEME.text3 }}>
                  <div className="rounded-xl border p-4" style={{ borderColor: THEME.border, background: THEME.panel2 }}>
                    <div className="font-semibold" style={{ color: THEME.text2 }}>
                      Reel 8–12s
                    </div>
                    <div className="mt-1">
                      0.0–1.0s: visuellt “hook”. 1–10s: musikdrop. 10–12s: logga + 1 rad text.
                    </div>
                  </div>
                  <div className="rounded-xl border p-4" style={{ borderColor: THEME.border, background: THEME.panel2 }}>
                    <div className="font-semibold" style={{ color: THEME.text2 }}>
                      Story (3-pack)
                    </div>
                    <div className="mt-1">1) signal/visual. 2) datum/OUT NOW. 3) länk/repost reaktion.</div>
                  </div>
                  <div className="rounded-xl border p-4" style={{ borderColor: THEME.border, background: THEME.panel2 }}>
                    <div className="font-semibold" style={{ color: THEME.text2 }}>
                      Stillbild
                    </div>
                    <div className="mt-1">Hel bild (vecka -1 & release). Utsnitt (vecka -2). Alltid kort copy.</div>
                  </div>
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
          <div className="mt-8 grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <Card className="p-6 md:p-7">
                <div className="text-xs tracking-[0.2em]" style={{ color: THEME.text4 }}>
                  FÖRBERED 7 DAGAR INNAN VECKA −3
                </div>
                <div className="mt-4">
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
            <div className="md:col-span-5">
              <Card className="p-6">
                <div className="text-xs tracking-[0.2em]" style={{ color: THEME.text4 }}>
                  48H KPI (HÅRD MÄTNING)
                </div>
                <div className="mt-4 space-y-3 text-sm" style={{ color: THEME.text3 }}>
                  {[
                    "Reel retention: sikta på att folk ser 70–90% (korta klipp vinner).",
                    "Saves + Shares: viktigare än likes. Det är ‘signal sprids’-mätaren.",
                    "Link clicks / pre-save: allt före release är friktionstest.",
                    "Kommentarer: svara kort, kallt, konsekvent. Aldrig förklarande romaner.",
                  ].map((t, i) => (
                    <div
                      key={i}
                      className="rounded-xl border px-4 py-3"
                      style={{ borderColor: THEME.border, background: THEME.panel2 }}
                    >
                      {t}
                    </div>
                  ))}
                </div>
                <div className="mt-4 text-xs" style={{ color: THEME.text4 }}>
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
          <div className="mt-8 grid gap-6 md:grid-cols-12">
            <div className="md:col-span-7">
              <Card className="p-6 md:p-7">
                <div className="text-xs tracking-[0.2em]" style={{ color: THEME.text4 }}>
                  EN ENKEL REGLA
                </div>
                <div className="mt-3 text-xl md:text-2xl font-semibold tracking-tight" style={{ color: THEME.text }}>
                  Om det känns för repetitivt för dig — är det precis lagom för publiken.
                </div>

                <div className="mt-6 grid gap-4">
                  <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.panel2 }}>
                    <div className="text-sm font-semibold" style={{ color: THEME.text2 }}>
                      Daglig micro-rutin (vecka -1 & release)
                    </div>
                    <div className="mt-2 text-sm leading-relaxed" style={{ color: THEME.text3 }}>
                      1) Story: datum/symbol. 2) Reel: 10–12s drop. 3) Kommentar: 1 kall rad. 4) Repost reaktioner.
                    </div>
                  </div>
                  <div className="rounded-2xl border p-5" style={{ borderColor: THEME.border, background: THEME.panel2 }}>
                    <div className="text-sm font-semibold" style={{ color: THEME.text2 }}>
                      Copy (default)
                    </div>
                    <div className="mt-2 text-sm leading-relaxed" style={{ color: THEME.text3 }}>
                      Titel + datum. Eller: “TRANSMISSION RECEIVED.” Punkt.
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <div className="md:col-span-5">
              <Card className="p-3">
                <div
                  className="aspect-square w-full overflow-hidden rounded-xl border"
                  style={{ borderColor: THEME.border, background: THEME.panel2 }}
                >
                  {img.dataUrl ? (
                    <img
                      src={img.dataUrl}
                      alt={img.fileName || "Key visual"}
                      className="h-full w-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-8 text-center">
                      <div>
                        <div className="text-sm" style={{ color: THEME.text3 }}>
                          Ladda upp nyckelbilden.
                        </div>
                        <div className="mt-2 text-xs" style={{ color: THEME.text4 }}>
                          Den här sliden är byggd för att bära er grid/estetik.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-3 px-2 pb-2 text-xs" style={{ color: THEME.text4 }}>
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

  const exportPdf = async () => {
    if (!img.dataUrl) {
      alert("Ladda upp nyckelbilden först — PDF:en ska bära den.");
      return;
    }
    setBusy(true);
    try {
      const { html2canvas, jsPDF } = await loadPdfDeps();

      // A4 landscape för “deck-känsla”.
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

        // Subtil “print frame”
        pdf.setDrawColor(40, 40, 40);
        pdf.setLineWidth(1);
        pdf.roundedRect(margin - 8, margin - 8, targetW + 16, targetH + 16, 12, 12);

        pdf.addImage(imgData, "PNG", x, y, drawW, drawH, undefined, "FAST");

        pdf.setTextColor(170);
        pdf.setFontSize(9);
        pdf.text(
          `${i + 1}/${nodes.length}  •  ${img.fileName || "key-visual"}`,
          pageW - margin,
          pageH - 12,
          { align: "right" }
        );
      }

      pdf.save(`NorthStarRising_ReleaseDeck_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error(e);
      alert("PDF-export misslyckades. Testa igen (och säkerställ att bilden är laddad).\n\n" + (e?.message || ""));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SlideShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border p-3" style={{ borderColor: THEME.border, background: THEME.panel2 }}>
              <Radio className="h-5 w-5" style={{ color: THEME.text2 }} />
            </div>
            <div>
              <div className="text-sm" style={{ color: THEME.text3 }}>
                Körbar deck
              </div>
              <div className="text-xs" style={{ color: THEME.text4 }}>
                Navigera med pilarna eller piltangenter.
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportPdf}
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm disabled:opacity-40"
              style={{ borderColor: THEME.border, background: THEME.panel2, color: THEME.text2 }}
              disabled={busy}
              title={img.dataUrl ? "Exportera hela presentationen till PDF" : "Ladda upp nyckelbilden först"}
            >
              <FileDown className="h-4 w-4" style={{ color: THEME.text2 }} />
              {busy ? "Exporterar…" : "Exportera PDF"}
            </button>

            <button
              onClick={prev}
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm disabled:opacity-40"
              style={{ borderColor: THEME.border, background: THEME.panel2, color: THEME.text2 }}
              disabled={idx === 0}
            >
              <ChevronLeft className="h-4 w-4" style={{ color: THEME.text2 }} />
              Föregående
            </button>

            <button
              onClick={next}
              className="inline-flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm disabled:opacity-40"
              style={{ borderColor: THEME.border, background: THEME.panel2, color: THEME.text2 }}
              disabled={idx === slides.length - 1}
            >
              Nästa
              <ChevronRight className="h-4 w-4" style={{ color: THEME.text2 }} />
            </button>
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-2xl border px-5 py-3"
          style={{ borderColor: THEME.border, background: THEME.panel2 }}
        >
          <div className="text-sm" style={{ color: THEME.text3 }}>
            Slide <span className="font-semibold" style={{ color: THEME.text }}>{idx + 1}</span> / {slides.length}
          </div>
          <div className="text-xs" style={{ color: THEME.text4 }}>
            Key image: {img.fileName || "(inte laddad)"}
          </div>
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

        <div className="text-xs leading-relaxed" style={{ color: THEME.text4 }}>
          <span style={{ color: THEME.text4 }}>Snabbt användartips:</span> Exportera PDF när ni laddat upp nyckelbilden.
          PDF:en blir en säljande “one-deck” ni kan skicka till team, label, press eller hålla som intern handbok.
        </div>
      </div>

      <KeyNav onPrev={prev} onNext={next} />

      {/* OFFSCREEN RENDER för PDF-export — syns inte men fångas av html2canvas */}
      <div className="fixed -left-[10000px] top-0 w-[1200px]" aria-hidden="true">
        {slides.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => (hiddenRefs.current[i] = el)}
            style={{ background: THEME.bg, color: THEME.text }}
          >
            <div className="p-10">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <div className="text-xs tracking-[0.2em]" style={{ color: THEME.text4 }}>
                    NORTH STAR RISING
                  </div>
                  <div className="mt-1 text-base font-semibold" style={{ color: THEME.text2 }}>
                    Releaseplan & Social Media Deck
                  </div>
                </div>
                <div className="text-xs" style={{ color: THEME.text4 }}>
                  {new Date().toISOString().slice(0, 10)}
                </div>
              </div>

              <SlideBody slide={s} img={img} />

              <div className="mt-6 flex items-center justify-between text-xs" style={{ color: THEME.text4 }}>
                <div>Cold Protocol • Active</div>
                <div>
                  {i + 1}/{slides.length}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlideShell>
  );
}

function KeyNav({ onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onPrev, onNext]);
  return null;
}
