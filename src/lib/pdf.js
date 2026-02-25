export async function loadPdfDeps() {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  return { html2canvas, jsPDF };
}

const DEFAULT_OPTIONS = {
  orientation: "landscape",
  format: "a4",
  quality: 2,
  includeDeckMeta: true,
  includeBackground: true,
};

export async function exportSlidesToPdf({ nodes, fileName, bgColor, options = {}, onProgress = () => {} }) {
  const { html2canvas, jsPDF } = await loadPdfDeps();
  const cfg = { ...DEFAULT_OPTIONS, ...options };

  const pdf = new jsPDF({ orientation: cfg.orientation, unit: "pt", format: cfg.format });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const margin = 26;
  const safeTop = cfg.includeDeckMeta ? 42 : 24;
  const safeBottom = cfg.includeDeckMeta ? 30 : 24;
  const targetW = pageW - margin * 2;
  const targetH = pageH - safeTop - safeBottom;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    onProgress(Math.round((i / Math.max(nodes.length, 1)) * 100));
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 50));

    // eslint-disable-next-line no-await-in-loop
    const canvas = await html2canvas(node, {
      backgroundColor: cfg.includeBackground ? bgColor : "#ffffff",
      scale: Math.max(1, Math.min(3, Number(cfg.quality) || 2)),
      useCORS: true,
      allowTaint: true,
      logging: false,
    });

    if (i > 0) pdf.addPage();

    const imgData = canvas.toDataURL("image/png", 1.0);
    const cW = canvas.width;
    const cH = canvas.height;

    const ratio = Math.min(targetW / cW, targetH / cH);
    const drawW = cW * ratio;
    const drawH = cH * ratio;
    const x = (pageW - drawW) / 2;
    const y = safeTop + (targetH - drawH) / 2;

    if (cfg.includeBackground) {
      pdf.setFillColor(10, 10, 12);
      pdf.rect(0, 0, pageW, pageH, "F");

      pdf.setDrawColor(70, 70, 80);
      pdf.setLineWidth(1);
      pdf.roundedRect(margin - 8, safeTop - 8, targetW + 16, targetH + 16, 12, 12);
    }

    pdf.addImage(imgData, "PNG", x, y, drawW, drawH, undefined, "MEDIUM");

    if (cfg.includeDeckMeta) {
      pdf.setFontSize(9);
      pdf.setTextColor(cfg.includeBackground ? 190 : 70);
      pdf.text(fileName || "Release Deck", margin, 20);

      pdf.setTextColor(cfg.includeBackground ? 170 : 95);
      pdf.text(`${i + 1}/${nodes.length} • ${new Date().toISOString().slice(0, 10)}`, pageW - margin, pageH - 12, {
        align: "right",
      });
    }
  }

  onProgress(100);

  pdf.save(`NorthStarRising_ReleaseDeck_${new Date().toISOString().slice(0, 10)}.pdf`);
}
