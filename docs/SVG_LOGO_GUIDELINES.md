# SVG Logotype Guidelines

This document captures practical recommendations for using the provided SVG logo in the app.

## Recommended use cases

- **Primary brand mark**: app header badge, onboarding cards, splash/loading views.
- **Secondary/support mark**: slide watermarks, section separators, export cover pages.
- **Platform identity**: PWA icons, manifest icons, pinned-tab style assets.
- **Document output**: PDF cover/footer watermark to keep exports branded.

## Size recommendations

- **Header badge**: `32–40px` width on desktop, `26–32px` on compact/mobile.
- **Toolbar/action affordances**: keep logo under `24px` to avoid visual competition with controls.
- **Watermark**: `30–50%` of card/slide width, with very low opacity.
- **App icon artboard fit**:
  - 192 icon: keep visible mark area inside ~`164x164` safe zone.
  - 512 icon: keep visible mark area inside ~`440x440` safe zone.

## Color recommendations

- The source logo is treated as a **single-color mark** for consistency.
- On dark backgrounds, prefer a light logo tone (current implementation uses inverted source + low opacity for watermark).
- For accessibility and contrast:
  - avoid decorative watermark opacity above `0.08`;
  - keep interactive/logo text combinations at minimum WCAG AA contrast.

## Placement recommendations

- **Header**: left-aligned in the badge block.
- **Watermark**: bottom-right (or top-right), pushed away from dense text regions.
- **Icons**: center-aligned on the app icon canvas with generous corner breathing room.
- Avoid placing decorative logos behind compact text paragraphs or controls.

## Optimization opportunities

1. **SVGO pass**
   - Run a non-destructive SVGO pass to remove metadata and minify path formatting.
2. **Variant assets**
   - Add `logo-light.svg` and `logo-dark.svg` to avoid runtime CSS filter usage.
3. **Tokenized sizing**
   - Standardize via size tokens (e.g. `logo.xs/sm/md/lg`) to avoid one-off dimensions.
4. **Export-specific variant**
   - Add a PDF watermark variant with tuned stroke/opacity for print legibility.
5. **Performance hygiene**
   - Keep one canonical source (`public/logo.svg`) and derive all usage variants from it.

## Current implementation summary

- canonical source asset at `public/logo.svg`;
- shared React renderer in `src/components/AppLogo.jsx`;
- header and slide watermark placement in `src/App.jsx`;
- PWA icon adaptations in `public/icons/icon-192.svg` and `public/icons/icon-512.svg`.
