export async function loadPdfDeps() {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);
  return { html2canvas, jsPDF };
}

export async function exportSlidesToPdf({ nodes, fileName, bgColor }) {
  const { html2canvas, jsPDF } = await loadPdfDeps();

  const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();

  const margin = 28;
  const targetW = pageW - margin * 2;
  const targetH = pageH - margin * 2;

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 50));

    // eslint-disable-next-line no-await-in-loop
    const canvas = await html2canvas(node, {
      backgroundColor: bgColor,
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
    pdf.text(`${i + 1}/${nodes.length}  •  ${fileName || "key-visual"}`, pageW - margin, pageH - 12, {
      align: "right",
    });
  }

  pdf.save(`NorthStarRising_ReleaseDeck_${new Date().toISOString().slice(0, 10)}.pdf`);
}
