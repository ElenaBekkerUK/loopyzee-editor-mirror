// editor-app/src/components/Template/LottieUploadPanel.tsx
"use client";

import { useRef, useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import type { AnimationLayer } from "@/types/editor";
import { Button } from "../ui/Button";
import { Loader2, Trash2 } from "lucide-react";

type Props = {
  templateId: string;
  // добавить/заменить Lottie-слой в локальном стейте редактора
  onAddOrReplaceLayer: (layer: AnimationLayer) => void;
  // удалить слой из локального стейта; если мульти-слои — передай id
  onRemoveLayer?: (layerId?: string) => void;
  // если у тебя уже есть активный lottie-слой — его id (для корректного remove)
  currentLayerId?: string;
  // текущее значение lottieSrc (из Firestore) — чтобы показать кнопку Remove
  currentLottieSrc?: string | null;
};

export default function LottieUploadPanel({
  templateId,
  onAddOrReplaceLayer,
  onRemoveLayer,
  currentLayerId,
  currentLottieSrc,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleUpload(file: File) {
    const storage = getStorage();
    const storageRef = ref(storage, `templates/${templateId}/lottie/main.json`);
    const snap = await uploadBytes(storageRef, file, { contentType: "application/json" });
    const url = await getDownloadURL(snap.ref);

    // JSON для предпросмотра
    const text = await file.text();
    const jsonData = JSON.parse(text);

    // фиксируем в Firestore — ПОЛЕ lottieSrc!
    await setDoc(
      doc(db, "templates", templateId),
      { hasLottie: true, lottieSrc: url, lottieType: "json", updatedAt: Date.now() },
      { merge: true }
    );

    // обновляем локальный слой на канвасе
    onAddOrReplaceLayer({
      id: currentLayerId || crypto.randomUUID(),
      type: "lottie",
      lottieSrc: url,       // персистентное поле
      lottieData: jsonData, // только рантайм
      autoplay: true,
      loop: true,
      speed: 1,
      x: 40,
      y: 40,
      width: 300,
      height: 300,
      zIndex: 100,
    });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      alert("Выберите Lottie .json");
      e.currentTarget.value = "";
      return;
    }
    setBusy(true);
    try {
      await handleUpload(file);
    } catch (err) {
      console.error("Upload Lottie failed:", err);
      alert("Не удалось загрузить Lottie");
    } finally {
      setBusy(false);
      e.currentTarget.value = "";
    }
  }

  async function handleRemove() {
    if (!confirm("Удалить Lottie-анимацию из шаблона?")) return;
    setBusy(true);
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `templates/${templateId}/lottie/main.json`);
      try {
        await deleteObject(storageRef);
      } catch {
        // если файла нет — ок
      }

      await setDoc(
        doc(db, "templates", templateId),
        { hasLottie: false, lottieSrc: null, lottieType: null, updatedAt: Date.now() },
        { merge: true }
      );

      onRemoveLayer?.(currentLayerId);
    } catch (err) {
      console.error("Remove Lottie failed:", err);
      alert("Не удалось удалить Lottie");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Lottie (optional)</label>

      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        hidden
        onChange={handleFileChange}
      />

      <div className="flex gap-2">
        <Button onClick={() => fileInputRef.current?.click()} disabled={busy} className="flex-1">
          {busy ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : "+ Upload Lottie JSON"}
        </Button>

        {currentLottieSrc ? (
          <Button
            type="button"
            variant="secondary"
            onClick={handleRemove}
            disabled={busy}
            title="Remove Lottie"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        Файл будет сохранён в <code>templates/{templateId}/lottie/main.json</code>.
      </p>
    </div>
  );
}