# Plan: mobilanpassning, aviseringar och app-installation (PWA)

## Målbild
- Sajten ska fungera förstklassigt på mobil (layout, läsbarhet, touch-navigering, prestanda).
- Besökare ska kunna få relevanta aviseringar efter tydligt samtycke.
- Besökare ska kunna installera sajten som app (PWA) från mobil och desktop.

## Nuvarande nuläge (kort)
- Appen är en Vite/React SPA med inline-styles + enkel global CSS.
- Det finns ingen Web App Manifest-fil, ingen service worker och ingen push-infrastruktur.
- Navigering finns med knappar + piltangenter, men UX är inte explicit optimerad för touch/mobil.

---

## Fas 1 — Mobilanpassning (högst prioritet)

### 1.1 Layout och typografi
- Inför tydliga breakpoints (t.ex. `<=480`, `<=768`, `<=1024`).
- Konvertera kritiska 12-kolumners sektioner till single-column på mobil.
- Säkerställ minsta tapp-ytor enligt mobilstandard (minst ~44x44px).
- Justera textskalor/radlängd för små skärmar så att deck-innehåll förblir läsbart.

### 1.2 Mobil UX
- Lägg till swipe-stöd för slidebyte (vänster/höger) som komplement till knappar.
- Gör topbar sticky och förenkla knappgrupper på mobil (färre element per rad).
- Visa tydligare indikator för aktuell slide och total (redan finns, men behöver mobilplacering).

### 1.3 Prestanda och robusthet
- Mät Lighthouse Mobile (Performance/Accessibility/Best Practices).
- Säkerställ att PDF-exportknappen har mobilvänlig fallback-text vid lång körning.
- Minimera layout-shift på första rendering (specifika höjder/aspect-ratio där relevant).

### 1.4 Definition of Done (Fas 1)
- Lighthouse Mobile Performance minst 80+ på staging.
- Inga horisontella overflow-problem på iPhone/Android-standardbredder.
- Navigering fungerar via touch, knappar och tangentbord utan regressionsfel.

---

## Fas 2 — Installera som app (PWA)

### 2.1 Grundläggande PWA-komponenter
- Lägg till `manifest.webmanifest` med namn, kortnamn, ikonset, start_url och display mode (`standalone`).
- Lägg till app-ikoner (192x192 och 512x512) + maskable variant.
- Lägg till service worker för caching av app-shell och statiska assets.

### 2.2 Installationsflöde
- Lyssna på `beforeinstallprompt` och spara event för användarstyrd prompt.
- Visa diskret CTA (t.ex. “Installera app”) efter att användaren har interagerat med sajten.
- Hantera iOS-fall (ingen standard `beforeinstallprompt`) via hjälpinstruktion “Lägg till på hemskärmen”.

### 2.3 Offline-beteende
- Definiera offline fallback-sida med grundläggande information och senaste cachade deck.
- Versionera cache-strategi för kontrollerad uppdatering mellan releaser.

### 2.4 Definition of Done (Fas 2)
- Appen går att installera i Android Chrome och Desktop Chrome.
- iOS-användare får tydlig guide för “Add to Home Screen”.
- Basfunktioner laddar i offline-läge efter första besök.

---

## Fas 3 — Aviseringar (Web Push)

### 3.1 Samtycke och UX
- Implementera tvåstegssamtycke:
  1) intern pre-prompt (“Vill du få släppnotiser?”)
  2) browser permission prompt först efter aktivt val.
- Tydliggör vilken typ av notifieringar som skickas och hur ofta.
- Möjlighet att avregistrera/pausa aviseringar i UI.

### 3.2 Teknisk implementation
- Lägg till push-subscription via service worker (`PushManager`) och VAPID-nycklar.
- Spara subscriptions i backend/datastore (t.ex. Netlify Functions + databärare).
- Skapa admin-/release-endpoint för att skicka segmenterade pushnotiser.

### 3.3 Mätning och kvalitet
- Följ upp opt-in-rate, tillståndsstatus och leveransresultat.
- Skydda mot spam: frekvensgränser + tydlig innehållspolicy.
- Logga fel (permission denied, invalid subscription, endpoint-expired).

### 3.4 Definition of Done (Fas 3)
- Ny användare kan aktivera push med begripligt samtyckesflöde.
- Testnotis kan skickas till registrerad enhet i staging.
- Avregistrering fungerar och uppdaterar backend-status.

---

## Rekommenderad implementation i sprintar
- **Sprint 1:** Fas 1 (mobilanpassning + QA på utvalda enheter).
- **Sprint 2:** Fas 2 (manifest, SW, install-CTA, offline-fallback).
- **Sprint 3:** Fas 3 (push-infrastruktur, samtycke, mätning, adminflöde).

## Risker och beslutspunkter
- Push kräver backend/nyckelhantering och tydlig integritetstext.
- iOS-stöd för web push varierar mellan versioner — testmatris krävs.
- För aggressiv install/push-prompt kan sänka förtroende och konvertering.

## Leverabler
1. UX-skisser för mobilnavigation + install/push-entrypoints.
2. Teknisk design för SW/cache/manifest och push-backend.
3. Implementations-PR:er per fas med testprotokoll och rollback-plan.
