# North Star Rising — Release Deck (React/Vite)

## What this is
A runnable, single-page presentation app with:
- Slide navigation (buttons + arrow keys)
- Key visual upload (your 3×3 grid image)
- PDF export (A4 landscape) of the full deck including the image
- No Tailwind, and no advanced CSS color functions (avoids `oklch()` issues)

## Run locally
```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build
```bash
npm run build
npm run preview
```

## Notes
- PDF export uses html2canvas + jsPDF.
- Upload your 3×3 image, then hit **Exportera PDF**.