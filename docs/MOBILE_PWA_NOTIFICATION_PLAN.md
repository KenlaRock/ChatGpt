# Mobile Adaptation, PWA Install & Web-Push Roadmap

Date: 2026-02-25  
Owner: Frontend Platform

## 1) Purpose
This document defines a phased delivery plan for:
- Mobile-first layout and interaction improvements.
- Progressive Web App (PWA) installability (manifest + service worker).
- Web-push notification support with clear opt-in UX and safe rollout.

The plan is structured so each phase can ship independently with measurable Definition of Done (DoD).

## 2) Guiding principles
- **Progressive enhancement:** Core slide deck remains fully usable without install/push support.
- **Low-risk rollout:** Ship instrumentation and feature flags before broad enablement.
- **Accessibility first:** Touch targets, focus states, and permission copy must be understandable and keyboard/screen-reader friendly.
- **Operational clarity:** Every phase includes implementation, QA, and observability checkpoints.

---

## Phase 1 — Mobile layout & UX hardening

### Goals
- Ensure the deck is comfortable on phones/tablets in portrait orientation.
- Reduce accidental interactions and improve readability/touch usability.

### Implementation plan
1. **Responsive layout audit**
   - Inventory breakpoints in `src/styles.css` and component-level layout assumptions.
   - Define mobile breakpoints (e.g., <=480, <=768) and tablet behavior.
2. **Navigation and controls**
   - Increase hit area for previous/next buttons (minimum 44x44 CSS px).
   - Keep primary actions (next, previous, export, upload) in an always-visible mobile action bar.
   - Add haptic-friendly spacing between adjacent controls.
3. **Typography and spacing**
   - Scale heading/body sizes for narrow viewports.
   - Prevent content clipping with `min/max` widths and overflow rules.
4. **Media and upload UX**
   - Ensure uploaded key visual scales correctly and preserves aspect ratio on small screens.
   - Add helpful empty-state copy for mobile image upload.
5. **Interaction quality**
   - Validate swipe/touch scroll behavior does not conflict with slide navigation.
   - Preserve keyboard navigation and focus styles for external keyboards/accessibility tools.

### Definition of Done (DoD)
- Mobile viewport checks pass for 360x800, 390x844, and 768x1024.
- No horizontal scroll on core presentation screens.
- All primary controls are reachable, readable, and have consistent focus/active states.
- PDF export and image upload workflows complete successfully on mobile emulation.
- Documented responsive decisions are captured in README or a dedicated UX note.

---

## Phase 2 — PWA foundation (manifest + service worker)

### Goals
- Make the app installable and resilient with basic offline support.
- Establish safe cache/versioning behavior for static assets.

### Implementation plan
1. **Web App Manifest**
   - Add `public/manifest.webmanifest` with `name`, `short_name`, icons, theme/background colors, and `display: standalone`.
   - Include maskable icon variants for Android homescreen quality.
2. **Service worker strategy**
   - Integrate Vite-compatible service worker generation (e.g., `vite-plugin-pwa` or custom SW).
   - Cache app shell/static assets with revisioning.
   - Use network-first (with fallback) for dynamic content where applicable.
3. **Registration and update UX**
   - Register service worker in app bootstrap.
   - Add unobtrusive "Update available" toast when new SW version is ready.
4. **Install flow**
   - Handle `beforeinstallprompt` event and present custom install CTA.
   - Track install prompt shown/accepted/dismissed events.
5. **Security and platform constraints**
   - Confirm HTTPS-only behavior in production and localhost in dev.
   - Verify no sensitive data is cached unexpectedly.

### Definition of Done (DoD)
- Browser install prompt is available on supported platforms.
- Lighthouse PWA category reaches agreed baseline (target >= 90).
- App loads from cache in offline mode for previously visited shell routes.
- Service worker update path tested (new deployment shows update prompt and activates safely).
- Manifest and SW behavior documented in project docs.

---

## Phase 3 — Web-push notifications

### Goals
- Introduce permissioned, user-centric push notifications.
- Build backend integration path with subscription lifecycle management.

### Implementation plan
1. **Architecture decisions**
   - Select push provider path: native Web Push (VAPID) or managed provider.
   - Define notification event taxonomy (release reminders, publish alerts, etc.).
2. **Frontend subscription flow**
   - Add explicit in-app pre-permission screen explaining value and frequency.
   - Request browser notification permission only after user intent.
   - Create/store push subscription (`PushManager.subscribe`) and send to backend API.
3. **Backend/API requirements**
   - Add endpoint(s) for create/update/delete subscription records.
   - Store subscription metadata (endpoint, keys, user/session reference, consent timestamp).
   - Implement send pipeline with retry and invalid-subscription cleanup.
4. **User controls**
   - Add settings UI to opt out and revoke current subscription.
   - Reflect permission/subscription state accurately (granted/denied/default).
5. **Reliability and compliance**
   - Add delivery/open telemetry where supported.
   - Define rate limits and quiet hours policy.
   - Confirm legal/compliance requirements for user consent text.

### Definition of Done (DoD)
- User can opt in, receive a test push, and opt out from within the app.
- Expired/invalid subscriptions are pruned automatically.
- Notification sends are observable in logs/metrics with error categorization.
- Consent UX and copy approved by product/legal stakeholders.
- Runbook exists for key rotation, incident handling, and rollback.

---

## 4) Cross-phase rollout and governance

### Suggested sequence
1. Ship **Phase 1** (mobile UX) behind regular release flow.
2. Ship **Phase 2** (PWA installability) behind a feature flag if needed.
3. Pilot **Phase 3** (push) with internal/test cohort before general availability.

### Feature flags
- `mobile_ui_refresh`
- `pwa_install_flow`
- `web_push_notifications`

### Metrics to monitor
- Mobile bounce rate and time-on-slide.
- Install prompt show/accept rates.
- Push opt-in rate, delivery success rate, unsubscribe rate.

### Suggested timeline (example)
- Sprint 1: Phase 1 implementation + QA.
- Sprint 2: Phase 2 implementation + Lighthouse and offline QA.
- Sprint 3: Phase 3 backend/frontend integration + pilot.

## 5) Risks and mitigations
- **iOS PWA limitations:** Document platform differences and fallback UX.
- **Notification fatigue:** Start with low-frequency, high-value triggers only.
- **Cache staleness:** Version cache keys and implement explicit SW update prompts.
- **Permission denial:** Use pre-permission education and defer prompt until user intent.

## 6) Handoff checklist
- Engineering tasks created per phase with owners and estimates.
- QA test matrix includes Android Chrome, iOS Safari, desktop Chrome/Edge.
- Product copy for install/push prompts approved.
- Observability dashboards created before broad rollout.


## 7) Phone install solution (website -> app)
Once Phase 2 ships, use this implementation pattern:
1. Add a manifest (`manifest.webmanifest`) with app metadata + icons (including maskable icons).
2. Register service worker and verify HTTPS hosting in production.
3. Handle `beforeinstallprompt` and show a user-facing install button in the app shell.
4. After install, detect standalone mode and hide redundant install prompts.
5. iOS fallback: show contextual instructions: **Safari > Share > Add to Home Screen**.

### Acceptance checks for install flow
- Android Chrome: install prompt shown and app opens in standalone mode.
- iOS Safari: Add-to-Home-Screen instructions visible and tested.
- Desktop Chrome/Edge: install option available from omnibox/app menu.

