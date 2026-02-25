import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, FileDown, Link2, Pencil, Save, Upload, Plus, Trash2, ArrowUp, ArrowDown, CopyPlus, Settings2, Menu, X, SlidersHorizontal } from "lucide-react";
import { THEME, styles } from "./theme";
import { Card, SectionTitle } from "./components/primitives";
import { exportSlidesToPdf } from "./lib/pdf";
import { DEFAULT_DECK } from "./data/initialDeck";
import { clearDeckStorage, loadDeckFromStorage, saveDeckToStorage } from "./lib/deckStorage";
import { getTelemetrySnapshot } from "./lib/telemetry";
import { isSyncEnabled, pullDeckFromServer, pushDeckToServer } from "./lib/deckSync";
import { BlockRenderer } from "./components/BlockRenderer";
import { AppLogo } from "./components/AppLogo";

const makeId = () => (globalThis.crypto?.randomUUID?.() ? globalThis.crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);

const UI_PREFS_KEY = "nsr_ui_prefs_v1";

const DEFAULT_EXPORT_SETTINGS = {
  orientation: "landscape",
  format: "a4",
  quality: 2,
  includeDeckMeta: true,
  includeBackground: true,
};

const DEFAULT_UI_PREFS = {
  density: "cozy",
  showHints: true,
  showTelemetry: true,
};

const newBlockTemplate = {
  text: () => ({ id: makeId(), type: "text", props: { heading: "Ny rubrik", body: "Ny text" } }),
  checklist: () => ({ id: makeId(), type: "checklist", props: { heading: "Ny checklista", items: ["Punkt 1"] } }),
  quote: () => ({ id: makeId(), type: "quote", props: { text: "Ny quote", subtext: "Underrad" } }),
  image: () => ({ id: makeId(), type: "image", props: { heading: "Ny bild", imageId: null, caption: "Bildtext", fit: "contain" } }),
};

export default function App() {
  const [idx, setIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isCompact, setIsCompact] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= 900 : false));
  const [isPhone, setIsPhone] = useState(() => (typeof window !== "undefined" ? window.innerWidth <= 680 : false));
  const [isEditing, setIsEditing] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileEditor, setShowMobileEditor] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [saveState, setSaveState] = useState("sparad");
  const [saveProgress, setSaveProgress] = useState(0);
  const [saveStorage, setSaveStorage] = useState("local");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [syncState, setSyncState] = useState(isSyncEnabled() ? "synk väntar" : "lokal endast");
  const [deck, setDeck] = useState(DEFAULT_DECK);
  const [media, setMedia] = useState(() => DEFAULT_DECK.media || []);
  const hiddenRefs = useRef([]);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [exportSettings, setExportSettings] = useState(DEFAULT_EXPORT_SETTINGS);
  const [uiPrefs, setUiPrefs] = useState(DEFAULT_UI_PREFS);
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);

  const denseMode = uiPrefs.density === "compact";

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(UI_PREFS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.uiPrefs) {
        setUiPrefs((current) => ({ ...current, ...parsed.uiPrefs }));
      }
      if (parsed?.exportSettings) {
        setExportSettings((current) => ({ ...current, ...parsed.exportSettings }));
      }
    } catch (error) {
      console.warn("Could not parse UI preferences", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      UI_PREFS_KEY,
      JSON.stringify({
        uiPrefs,
        exportSettings,
      }),
    );
  }, [uiPrefs, exportSettings]);

  useEffect(() => {
    const boot = async () => {
      const persisted = await loadDeckFromStorage();
      if (persisted) {
        setDeck(persisted);
        setMedia(persisted.media || []);
      }

      if (isSyncEnabled()) {
        const remote = await pullDeckFromServer((persisted || DEFAULT_DECK).id || "active");
        if (remote.ok && remote.deck) {
          setDeck(remote.deck);
          setMedia(remote.deck.media || []);
          setSyncState("synkad (server)");
        } else if (remote.reason === "not_found") {
          setSyncState("ingen server-deck");
        } else {
          setSyncState("synk offline/fel");
        }
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const onResize = () => {
      setIsCompact(window.innerWidth <= 900);
      setIsPhone(window.innerWidth <= 680);
    };
    const onBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    };

    const standalone = window.matchMedia?.("(display-mode: standalone)")?.matches || window.navigator?.standalone === true;
    setIsStandalone(Boolean(standalone));

    window.addEventListener("resize", onResize);
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (!isPhone) {
      setShowMobileMenu(false);
      setShowMobileEditor(false);
    }
  }, [isPhone]);

  useEffect(() => {
    const toSave = { ...deck, media };
    setSaveState("sparar");
    setSaveProgress(5);
    const t = setTimeout(async () => {
      try {
        const result = await saveDeckToStorage(toSave, {
          onProgress: (progress) => setSaveProgress(progress),
        });
        setSaveStorage(result?.storage || "local");

        if (isSyncEnabled()) {
          const syncResult = await pushDeckToServer(toSave);
          if (syncResult.ok) {
            setSyncState("synkad (server)");
          } else if (syncResult.reason === "conflict") {
            setSyncState(`konflikt löst (${syncResult.winner})`);
            if (syncResult.deck) {
              setDeck(syncResult.deck);
              setMedia(syncResult.deck.media || []);
            }
          } else {
            setSyncState("synk offline/fel");
          }
        }

        setSaveState("sparad");
      } catch (error) {
        console.error(error);
        setSaveState("fel");
      } finally {
        setTimeout(() => setSaveProgress(0), 600);
      }
    }, 280);
    return () => clearTimeout(t);
  }, [deck, media]);

  const slides = deck.slides;
  const activeSlide = slides[idx];

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

  const updateSlide = (slideId, updater) => {
    setDeck((current) => ({
      ...current,
      slides: current.slides.map((slide) => (slide.id === slideId ? updater(slide) : slide)),
    }));
  };

  const updateBlock = (slideId, blockId, updater) => {
    updateSlide(slideId, (slide) => ({
      ...slide,
      blocks: slide.blocks.map((block) => (block.id === blockId ? updater(block) : block)),
    }));
  };

  const addBlock = (slideId, type) => {
    const factory = newBlockTemplate[type] || newBlockTemplate.text;
    const block = factory();
    if (!block.id) block.id = makeId();
    updateSlide(slideId, (slide) => ({ ...slide, blocks: [...slide.blocks, block] }));
  };

  const deleteBlock = (slideId, blockId) => {
    updateSlide(slideId, (slide) => ({ ...slide, blocks: slide.blocks.filter((block) => block.id !== blockId) }));
  };

  const duplicateSlide = (slideId) => {
    setDeck((current) => {
      const at = current.slides.findIndex((slide) => slide.id === slideId);
      if (at < 0) return current;
      const source = current.slides[at];
      const duplicated = {
        ...source,
        id: makeId(),
        title: `${source.title} (kopia)`,
        blocks: source.blocks.map((block) => ({ ...block, id: makeId() })),
      };
      const slidesNext = [...current.slides];
      slidesNext.splice(at + 1, 0, duplicated);
      setIdx(at + 1);
      return {
        ...current,
        version: (Number.parseInt(current.version || "1", 10) + 1).toString(),
        slides: slidesNext,
      };
    });
  };

  const moveBlock = (slideId, blockId, dir) => {
    updateSlide(slideId, (slide) => {
      const at = slide.blocks.findIndex((block) => block.id === blockId);
      const to = at + dir;
      if (at < 0 || to < 0 || to >= slide.blocks.length) return slide;
      const copy = [...slide.blocks];
      [copy[at], copy[to]] = [copy[to], copy[at]];
      return { ...slide, blocks: copy };
    });
  };

  const onPickMedia = (file) => {
    if (!file) return;
    if (!/image\/(png|jpeg|jpg|webp)/.test(file.type)) {
      alert("Välj en PNG/JPG/WebP.");
      return;
    }

    setUploadStatus("reading");
    setUploadProgress(0);
    setUploadMessage(`Läser in ${file.name}...`);

    const reader = new FileReader();
    reader.onprogress = (event) => {
      if (!event.lengthComputable) return;
      setUploadProgress(Math.round((event.loaded / event.total) * 100));
    };
    reader.onerror = () => {
      setUploadStatus("error");
      setUploadMessage("Kunde inte läsa filen. Försök igen.");
    };
    reader.onload = () => {
      setMedia((current) => [
        ...current,
        {
          id: makeId(),
          fileName: file.name,
          dataUrl: reader.result,
          alt: file.name,
        },
      ]);
      setUploadStatus("done");
      setUploadProgress(100);
      setUploadMessage(`${file.name} uppladdad`);
    };
    reader.onloadstart = () => setUploadStatus("reading");
    reader.onabort = () => {
      setUploadStatus("error");
      setUploadMessage("Uppladdningen avbröts.");
    };
    reader.onloadend = () => {
      setTimeout(() => {
        setUploadStatus("idle");
        setUploadProgress(0);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const exportPdf = async () => {
    setBusy(true);
    setExportProgress(2);
    try {
      const nodes = hiddenRefs.current.filter(Boolean);
      await exportSlidesToPdf({
        nodes,
        fileName: deck.name,
        bgColor: THEME.bg,
        options: exportSettings,
        onProgress: (progress) => setExportProgress(progress),
      });
    } catch (error) {
      console.error(error);
      alert("PDF-export misslyckades.\n\n" + (error?.message || ""));
    } finally {
      setBusy(false);
      setTimeout(() => setExportProgress(0), 800);
    }
  };

  const installApp = async () => {
    if (!installPromptEvent) return;
    installPromptEvent.prompt();
    await installPromptEvent.userChoice;
    setInstallPromptEvent(null);
  };

  const saveIndicator = saveState === "sparar" ? "Sparar…" : saveState === "fel" ? "Sparfel" : "Sparat";
  const saveStorageLabel = saveStorage === "indexeddb" ? "IndexedDB (stora bilder)" : "LocalStorage";

  const mediaCountLabel = useMemo(() => `${media.length} bild${media.length === 1 ? "" : "er"} i biblioteket`, [media.length]);
  const telemetry = useMemo(() => getTelemetrySnapshot(), [saveState, saveStorage, syncState]);
  const showEditorPanel = isEditing && (!isPhone || showMobileEditor);

  return (
    <div style={styles.shell}>
      <div style={{ ...styles.container, padding: isPhone ? "16px 12px 120px" : isCompact ? "24px 16px 40px" : styles.container.padding }}>
        <div style={{ display: "flex", flexDirection: "column", gap: denseMode ? 14 : 20 }}>
          <div style={{ ...styles.topbar, alignItems: isCompact ? "flex-start" : "center", gap: isPhone ? 10 : 16 }}>
            <div style={{ ...styles.badge, flex: isPhone ? 1 : "initial", minWidth: 0 }}>
              <div style={{ ...styles.badgeIcon, padding: isPhone ? 10 : 12 }}>
                <AppLogo alt="App-logotyp" width={isPhone ? 30 : 36} height={20} invertForDarkBg opacity={0.9} />
              </div>
              <div style={{ ...styles.badgeText, minWidth: 0 }}>
                <div style={{ fontSize: isPhone ? 12 : 13, color: THEME.text3, fontWeight: 700 }}>Datadriven strategiapp</div>
                <div style={{ fontSize: 11, color: THEME.text4 }}>{isPhone ? "Snabb mobilvy med fokusläge." : "Visning/redigering + lokal autosave."}</div>
              </div>
            </div>

            {isPhone ? (
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>
                <button onClick={() => setIsEditing((v) => !v)} style={{ ...miniBtn, padding: "9px 10px", borderRadius: 12 }} aria-label="Växla redigering">
                  <Pencil size={15} />
                </button>
                <button onClick={() => setShowMobileMenu((v) => !v)} style={{ ...miniBtn, padding: "9px 10px", borderRadius: 12 }} aria-label="Meny">
                  {showMobileMenu ? <X size={15} /> : <Menu size={15} />}
                </button>
              </div>
            ) : (
              <div style={{ ...styles.toolbar, width: isCompact ? "100%" : "auto" }}>
                <button onClick={() => setIsEditing((v) => !v)} style={{ ...styles.button, ...(isCompact ? { minHeight: 46 } : {}) }}>
                  <Pencil size={16} color={THEME.text2} />
                  {isEditing ? "Visningsläge" : "Redigeringsläge"}
                </button>
                <button onClick={() => setShowSettings((v) => !v)} style={styles.button}>
                  <Settings2 size={16} color={THEME.text2} />
                  {showSettings ? "Dölj inställningar" : "Inställningar"}
                </button>
                <button onClick={exportPdf} style={{ ...styles.button, ...(busy ? styles.buttonDisabled : {}) }} disabled={busy}>
                  <FileDown size={16} color={THEME.text2} />
                  {busy ? "Exporterar…" : "Exportera PDF"}
                </button>
                <button onClick={prev} style={{ ...styles.button, ...(idx === 0 ? styles.buttonDisabled : {}) }} disabled={idx === 0}>
                  <ChevronLeft size={16} color={THEME.text2} /> Föregående
                </button>
                <button onClick={next} style={{ ...styles.button, ...(idx === slides.length - 1 ? styles.buttonDisabled : {}) }} disabled={idx === slides.length - 1}>
                  Nästa <ChevronRight size={16} color={THEME.text2} />
                </button>
                {!isStandalone && installPromptEvent ? (
                  <button onClick={installApp} style={styles.button}>
                    <Link2 size={16} color={THEME.text2} /> Installera app
                  </button>
                ) : null}
              </div>
            )}
          </div>

          {isPhone && showMobileMenu ? (
            <Card style={{ padding: 10 }}>
              <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                <button onClick={() => setShowSettings((v) => !v)} style={{ ...miniBtn, justifyContent: "center", padding: "10px 12px" }}>
                  <SlidersHorizontal size={15} /> {showSettings ? "Dölj" : "Inställn."}
                </button>
                <button onClick={exportPdf} style={{ ...miniBtn, justifyContent: "center", ...(busy ? styles.buttonDisabled : {}), padding: "10px 12px" }} disabled={busy}>
                  <FileDown size={15} /> PDF
                </button>
                <button onClick={prev} style={{ ...miniBtn, justifyContent: "center", ...(idx === 0 ? styles.buttonDisabled : {}), padding: "10px 12px" }} disabled={idx === 0}>
                  <ChevronLeft size={15} /> Föreg.
                </button>
                <button onClick={next} style={{ ...miniBtn, justifyContent: "center", ...(idx === slides.length - 1 ? styles.buttonDisabled : {}), padding: "10px 12px" }} disabled={idx === slides.length - 1}>
                  Nästa <ChevronRight size={15} />
                </button>
                {!isStandalone && installPromptEvent ? (
                  <button onClick={installApp} style={{ ...miniBtn, justifyContent: "center", padding: "10px 12px", gridColumn: "1 / -1" }}>
                    <Link2 size={15} /> Installera app
                  </button>
                ) : null}
              </div>
            </Card>
          ) : null}

          {!isStandalone && isIOS ? (
            <Card style={{ padding: 12 }}>
              <div style={{ fontSize: 12, color: THEME.text3 }}>
                iPhone/iPad: öppna i Safari och välj <strong>Dela → Lägg till på hemskärmen</strong> för att installera appen.
              </div>
            </Card>
          ) : null}

          <div style={{ ...styles.metaBar, ...(isPhone ? { gridTemplateColumns: "repeat(2, minmax(0, 1fr))", padding: "10px 12px", gap: 8 } : isCompact ? { gridTemplateColumns: "1fr" } : {}) }}>
            <div style={{ fontSize: 12, color: THEME.text3 }}>Slide <strong style={{ color: THEME.text }}>{idx + 1}</strong> / {slides.length}</div>
            <div style={{ fontSize: 11, color: THEME.text4, textAlign: isPhone ? "right" : "left" }}>{mediaCountLabel}</div>
            <div style={{ fontSize: 11, color: THEME.text4, display: "inline-flex", alignItems: "center", gap: 6 }}>
              <Save size={13} /> {saveIndicator}
            </div>
            <div style={{ fontSize: 11, color: THEME.text4, textAlign: isPhone ? "right" : "left" }}>Sync: {syncState}</div>
          </div>

          {(saveState === "sparar" || saveProgress > 0) ? (
            <div style={progressWrapStyle}>
              <div style={progressHeaderStyle}>
                <span>Sparar innehåll ({saveStorageLabel})</span>
                <span>{saveProgress}%</span>
              </div>
              <div style={uploadTrackStyle}>
                <div style={{ ...uploadFillStyle, width: `${saveProgress}%`, background: "#22c55e" }} />
              </div>
            </div>
          ) : null}

          {(busy || exportProgress > 0) ? (
            <div style={progressWrapStyle}>
              <div style={progressHeaderStyle}>
                <span>Exporterar PDF</span>
                <span>{exportProgress}%</span>
              </div>
              <div style={uploadTrackStyle}>
                <div style={{ ...uploadFillStyle, width: `${exportProgress}%`, background: "#60a5fa" }} />
              </div>
            </div>
          ) : null}

          {showSettings ? (
            <Card style={{ padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text2 }}>Kvalitet & export</div>
              <div style={{ marginTop: 10, display: "grid", gap: 8, gridTemplateColumns: isCompact ? "1fr" : "repeat(2, minmax(0, 1fr))" }}>
                <label style={settingsLabelStyle}>
                  PDF-orientering
                  <select
                    value={exportSettings.orientation}
                    onChange={(e) => setExportSettings((current) => ({ ...current, orientation: e.target.value }))}
                    style={inputStyle}
                  >
                    <option value="landscape">Liggande</option>
                    <option value="portrait">Stående</option>
                  </select>
                </label>
                <label style={settingsLabelStyle}>
                  Upplösning
                  <select
                    value={String(exportSettings.quality)}
                    onChange={(e) => setExportSettings((current) => ({ ...current, quality: Number(e.target.value) }))}
                    style={inputStyle}
                  >
                    <option value="1">Normal (snabb)</option>
                    <option value="2">Hög (balanserad)</option>
                    <option value="3">Max (större fil)</option>
                  </select>
                </label>
                <label style={toggleStyle}>
                  <input
                    type="checkbox"
                    checked={uiPrefs.density === "compact"}
                    onChange={(e) => setUiPrefs((current) => ({ ...current, density: e.target.checked ? "compact" : "cozy" }))}
                  />
                  Kompakt layout
                </label>
                <label style={toggleStyle}>
                  <input
                    type="checkbox"
                    checked={uiPrefs.showHints}
                    onChange={(e) => setUiPrefs((current) => ({ ...current, showHints: e.target.checked }))}
                  />
                  Visa hjälptips
                </label>
                <label style={toggleStyle}>
                  <input
                    type="checkbox"
                    checked={uiPrefs.showTelemetry}
                    onChange={(e) => setUiPrefs((current) => ({ ...current, showTelemetry: e.target.checked }))}
                  />
                  Visa drift/telemetri
                </label>
                <label style={toggleStyle}>
                  <input
                    type="checkbox"
                    checked={exportSettings.includeDeckMeta}
                    onChange={(e) => setExportSettings((current) => ({ ...current, includeDeckMeta: e.target.checked }))}
                  />
                  Inkludera metarader i PDF
                </label>
              </div>
            </Card>
          ) : null}

          <div style={{ display: "grid", gap: 16, gridTemplateColumns: isEditing && !isCompact ? "2fr 1fr" : "1fr" }}>
            <AnimatePresence mode="wait">
              <motion.div key={activeSlide.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div style={{ ...styles.slideFrame, padding: isCompact ? 16 : styles.slideFrame.padding, position: "relative", overflow: "hidden" }}>
                  <AppLogo
                    decorative
                    width={isCompact ? 220 : 300}
                    height="auto"
                    invertForDarkBg
                    opacity={0.055}
                    style={{
                      position: "absolute",
                      right: isCompact ? -20 : -30,
                      bottom: isCompact ? -10 : -16,
                      maxWidth: "50%",
                      pointerEvents: "none",
                    }}
                  />
                  <SectionTitle kicker={activeSlide.kicker} title={activeSlide.title} subtitle={activeSlide.subtitle} compact={isCompact} />
                  <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
                    {activeSlide.blocks.map((block) => (
                      <BlockRenderer key={block.id} block={block} media={media} />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {showEditorPanel ? (
              <Card style={{ padding: 16, height: "fit-content" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: THEME.text2 }}>Editorpanel</div>
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <input value={activeSlide.kicker} onChange={(e) => updateSlide(activeSlide.id, (s) => ({ ...s, kicker: e.target.value }))} style={inputStyle} placeholder="Kicker" />
                  <textarea value={activeSlide.title} onChange={(e) => updateSlide(activeSlide.id, (s) => ({ ...s, title: e.target.value }))} style={{ ...inputStyle, minHeight: 64 }} />
                  <textarea value={activeSlide.subtitle} onChange={(e) => updateSlide(activeSlide.id, (s) => ({ ...s, subtitle: e.target.value }))} style={{ ...inputStyle, minHeight: 82 }} />
                </div>

                <div style={{ marginTop: 14, display: "grid", gap: denseMode ? 8 : 10 }}>
                  {activeSlide.blocks.map((block) => (
                    <Card key={block.id} style={{ padding: 10 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <div style={{ fontSize: 12, color: THEME.text2 }}>{block.type}</div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button style={miniBtn} onClick={() => moveBlock(activeSlide.id, block.id, -1)} title="Flytta upp"><ArrowUp size={14} /></button>
                          <button style={miniBtn} onClick={() => moveBlock(activeSlide.id, block.id, 1)} title="Flytta ned"><ArrowDown size={14} /></button>
                          <button style={miniBtn} onClick={() => deleteBlock(activeSlide.id, block.id)} title="Ta bort"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <BlockFields block={block} media={media} onChange={(nextBlock) => updateBlock(activeSlide.id, block.id, () => nextBlock)} />
                    </Card>
                  ))}
                </div>


                {uiPrefs.showTelemetry ? (
                  <Card style={{ marginTop: 12, padding: 10 }}>
                    <div style={{ fontSize: 12, color: THEME.text2, fontWeight: 700 }}>Drift/telemetri (lokal)</div>
                    <div style={{ marginTop: 6, fontSize: 11, color: THEME.text4 }}>
                      local saves: {telemetry.counters?.storage_save_local_success || 0} •
                      indexeddb fallback: {telemetry.counters?.storage_save_indexeddb_fallback || 0} •
                      sync ok: {telemetry.counters?.sync_push_success || 0} •
                      sync konflikt: {telemetry.counters?.sync_conflict || 0}
                    </div>
                  </Card>
                ) : null}
                <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {Object.keys(newBlockTemplate).map((type) => (
                      <button key={type} style={miniBtn} onClick={() => addBlock(activeSlide.id, type)}>
                        <Plus size={14} /> {type}
                      </button>
                    ))}
                  </div>
                  <label style={{ ...styles.button, justifyContent: "center" }}>
                    <Upload size={14} color={THEME.text2} /> Ladda upp bild
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onPickMedia(e.target.files?.[0])} />
                  </label>
                  <button style={{ ...miniBtn, justifyContent: "center" }} onClick={() => duplicateSlide(activeSlide.id)}>
                    <CopyPlus size={14} /> Duplicera slide
                  </button>
                  {uploadStatus !== "idle" ? (
                    <div style={uploadWrapStyle}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, fontSize: 11, color: THEME.text3 }}>
                        <span>{uploadMessage || "Laddar upp bild"}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div style={uploadTrackStyle}>
                        <div style={{ ...uploadFillStyle, width: `${uploadProgress}%`, background: uploadStatus === "error" ? "#ef4444" : "#22c55e" }} />
                      </div>
                    </div>
                  ) : null}
                  <button
                    style={{ ...miniBtn, justifyContent: "center" }}
                    onClick={async () => {
                      setDeck(DEFAULT_DECK);
                      setMedia([]);
                      await clearDeckStorage();
                    }}
                  >
                    Återställ till standard
                  </button>
                </div>
              </Card>
            ) : null}
          </div>

          {uiPrefs.showHints ? <div style={styles.footerTip}>Tips: lägg till/ta bort block i redigeringsläge. Ändringar sparas lokalt automatiskt.</div> : null}
        </div>
      </div>


          {isPhone ? (
            <div style={{ position: "fixed", left: 10, right: 10, bottom: 10, zIndex: 50 }}>
              <Card style={{ padding: 8, borderRadius: 18, backdropFilter: "blur(10px)", background: "rgba(10,10,12,0.88)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 6 }}>
                  <button onClick={prev} style={{ ...miniBtn, justifyContent: "center", padding: "9px 6px", ...(idx === 0 ? styles.buttonDisabled : {}) }} disabled={idx === 0}><ChevronLeft size={15} /></button>
                  <button onClick={next} style={{ ...miniBtn, justifyContent: "center", padding: "9px 6px", ...(idx === slides.length - 1 ? styles.buttonDisabled : {}) }} disabled={idx === slides.length - 1}><ChevronRight size={15} /></button>
                  <button onClick={() => setIsEditing((v) => !v)} style={{ ...miniBtn, justifyContent: "center", padding: "9px 6px" }}><Pencil size={15} /></button>
                  <button onClick={() => setShowMobileEditor((v) => !v)} style={{ ...miniBtn, justifyContent: "center", padding: "9px 6px", ...(isEditing ? {} : styles.buttonDisabled) }} disabled={!isEditing}><Settings2 size={15} /></button>
                  <button onClick={() => setShowMobileMenu((v) => !v)} style={{ ...miniBtn, justifyContent: "center", padding: "9px 6px" }}>{showMobileMenu ? <X size={15} /> : <Menu size={15} />}</button>
                </div>
              </Card>
            </div>
          ) : null}

      <div style={{ position: "fixed", left: -10000, top: 0, width: 1200 }} aria-hidden="true">
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            ref={(el) => (hiddenRefs.current[i] = el)}
            style={{ background: exportSettings.includeBackground ? THEME.bg : "#ffffff", color: THEME.text }}
          >
            <div style={{ padding: 40, borderRadius: 24, border: `1px solid ${THEME.border}`, background: "linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0))" }}>
              {exportSettings.includeDeckMeta ? (
              <div style={{ marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 11, letterSpacing: "0.2em", color: THEME.text4 }}>{deck.name}</div>
                  <div style={{ marginTop: 6, fontSize: 14, fontWeight: 800, color: THEME.text2 }}>Version {deck.version}</div>
                </div>
                <div style={{ fontSize: 11, color: THEME.text4 }}>{new Date().toISOString().slice(0, 10)}</div>
              </div>
            ) : null}

              <SectionTitle kicker={slide.kicker} title={slide.title} subtitle={slide.subtitle} />
              <div style={{ marginTop: 20, display: "grid", gap: 12 }}>
                {slide.blocks.map((block) => (
                  <BlockRenderer key={block.id} block={block} media={media} />
                ))}
              </div>

              {exportSettings.includeDeckMeta ? (
                <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", fontSize: 11, color: THEME.text4 }}>
                  <div>Cold Protocol • Active</div>
                  <div>{i + 1}/{slides.length}</div>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BlockFields({ block, onChange, media }) {
  const setProps = (key, value) => onChange({ ...block, props: { ...block.props, [key]: value } });

  if (block.type === "text") {
    return (
      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        <input value={block.props.heading || ""} onChange={(e) => setProps("heading", e.target.value)} style={inputStyle} placeholder="Rubrik" />
        <textarea value={block.props.body || ""} onChange={(e) => setProps("body", e.target.value)} style={{ ...inputStyle, minHeight: 72 }} placeholder="Text" />
      </div>
    );
  }

  if (block.type === "quote") {
    return (
      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        <textarea value={block.props.text || ""} onChange={(e) => setProps("text", e.target.value)} style={{ ...inputStyle, minHeight: 72 }} placeholder="Quote" />
        <input value={block.props.subtext || ""} onChange={(e) => setProps("subtext", e.target.value)} style={inputStyle} placeholder="Subtext" />
      </div>
    );
  }

  if (block.type === "checklist") {
    return (
      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        <input value={block.props.heading || ""} onChange={(e) => setProps("heading", e.target.value)} style={inputStyle} placeholder="Rubrik" />
        <textarea
          value={(block.props.items || []).join("\n")}
          onChange={(e) => setProps("items", e.target.value.split("\n").filter(Boolean))}
          style={{ ...inputStyle, minHeight: 80 }}
          placeholder="En rad per punkt"
        />
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        <input value={block.props.heading || ""} onChange={(e) => setProps("heading", e.target.value)} style={inputStyle} placeholder="Rubrik" />
        <select value={block.props.imageId || ""} onChange={(e) => setProps("imageId", e.target.value || null)} style={inputStyle}>
          <option value="">Ingen bild vald</option>
          {media.map((item) => (
            <option key={item.id} value={item.id}>{item.fileName}</option>
          ))}
        </select>
        <select value={block.props.fit || "contain"} onChange={(e) => setProps("fit", e.target.value)} style={inputStyle}>
          <option value="contain">Anpassa hela bilden (contain)</option>
          <option value="cover">Fyll ytan (cover)</option>
        </select>
        <input value={block.props.caption || ""} onChange={(e) => setProps("caption", e.target.value)} style={inputStyle} placeholder="Bildtext" />
      </div>
    );
  }

  if (block.type === "timeline") {
    return (
      <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
        <input value={block.props.week || ""} onChange={(e) => setProps("week", e.target.value)} style={inputStyle} placeholder="Vecka" />
        <input value={block.props.purpose || ""} onChange={(e) => setProps("purpose", e.target.value)} style={inputStyle} placeholder="Syfte" />
        <textarea value={(block.props.items || []).join("\n")} onChange={(e) => setProps("items", e.target.value.split("\n").filter(Boolean))} style={{ ...inputStyle, minHeight: 80 }} />
        <input value={block.props.microcopy || ""} onChange={(e) => setProps("microcopy", e.target.value)} style={inputStyle} placeholder="Microcopy" />
      </div>
    );
  }

  return null;
}

const uploadWrapStyle = {
  borderRadius: 10,
  border: `1px solid ${THEME.border}`,
  background: THEME.panel2,
  padding: "8px 10px",
  display: "grid",
  gap: 6,
};

const progressWrapStyle = {
  borderRadius: 10,
  border: `1px solid ${THEME.border}`,
  background: THEME.panel2,
  padding: "8px 10px",
  display: "grid",
  gap: 6,
};

const progressHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 10,
  fontSize: 11,
  color: THEME.text3,
};

const uploadTrackStyle = {
  height: 8,
  borderRadius: 999,
  overflow: "hidden",
  background: "rgba(255,255,255,0.08)",
};

const uploadFillStyle = {
  height: "100%",
  borderRadius: 999,
  transition: "width 160ms ease",
};

const inputStyle = {
  borderRadius: 10,
  border: `1px solid ${THEME.border}`,
  background: THEME.panel2,
  color: THEME.text2,
  fontSize: 12,
  padding: "8px 10px",
  width: "100%",
};

const miniBtn = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  borderRadius: 10,
  border: `1px solid ${THEME.border}`,
  background: THEME.panel2,
  color: THEME.text2,
  fontSize: 12,
  padding: "6px 10px",
  cursor: "pointer",
};

const settingsLabelStyle = {
  display: "grid",
  gap: 6,
  fontSize: 11,
  color: THEME.text3,
};

const toggleStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontSize: 12,
  color: THEME.text2,
};
