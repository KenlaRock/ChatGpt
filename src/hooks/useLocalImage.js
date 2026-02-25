import { useState } from "react";

export function useLocalImage() {
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

  const clear = () => {
    setDataUrl(null);
    setFileName(null);
  };

  return { dataUrl, fileName, onPick, clear };
}
