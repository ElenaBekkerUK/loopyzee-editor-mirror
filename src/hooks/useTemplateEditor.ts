// editor-app/src/hooks/useTemplateEditor.ts
// Обновление дизайна (fields, background, lottie, photoLayer) в templates/{id}

import { useCallback } from "react";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import type { Field, AnimationLayer, DesignJSON, PhotoLayer } from "../types/editor";
import { uploadToStorage } from "../firebase/uploadToStorage";
import { BASE_CANVAS } from "@/constants/editor";

/** Вспомогательный тип для снятия runtime-поля у Lottie */
type LottieWithRuntime = Extract<AnimationLayer, { type: "lottie" }> & {
  lottieData?: unknown;
};

function stripRuntime(layer: AnimationLayer): AnimationLayer {
  if (layer.type === "lottie") {
    const { lottieData, ...rest } = layer as LottieWithRuntime;
    void lottieData;
    return rest;
  }
  return layer;
}

export function useTemplateEditor(
  templateId: string,
  fields: Field[],
  backgroundUrl: string,
  backgroundFile: File | null,
  setBackgroundFile: (file: File | null) => void,
  categoryId: string,
  subcategoryId: string,
  title: string,
  tags: string[],
  animationLayers: AnimationLayer[],
  photoLayer?: PhotoLayer | null
) {
  const handleUpdateTemplate = useCallback(async () => {
    if (!templateId || templateId.length < 6) {
      alert("Некорректный ID шаблона.");
      return false;
    }

    // 🔧 убираем префикс "template/"
    const cleanId = templateId.replace(/^template\//, "");

    let finalBgUrl: string | null = backgroundUrl || null;

    try {
      // 1) Загрузка фона, если выбран локальный файл
      if (backgroundFile) {
        const { url } = await uploadToStorage(
          `templates/${cleanId}/assets`,
          backgroundFile
        );
        finalBgUrl = url;
      }

      // 2) Санитизация слоёв
      const sanitizedLayers: AnimationLayer[] = (animationLayers || []).map(stripRuntime);

      const hasLottie = sanitizedLayers.some((l) => l.type === "lottie");
      const hasPhotos = !!photoLayer?.hasPhoto;

      // 3) Единый JSON дизайна
      const designJSON: DesignJSON = {
        canvas: {
          width: BASE_CANVAS.width,
          height: BASE_CANVAS.height,
          version: BASE_CANVAS.version as 1,
        },
        background: { url: finalBgUrl },
        layers: {
          fields,
          animations: sanitizedLayers,
          ...(photoLayer?.hasPhoto ? { photo: photoLayer } : {}),
        },
      };

      // 4) Пишем в templates/{id}
      const tplRef = doc(db, "templates", cleanId);
      const payload = {
        title: (title || "").trim() || "Untitled",
        categoryId: categoryId || null,
        subcategoryId: subcategoryId || null,
        tags: (tags || []).map((t) => t.trim()).filter(Boolean),

        backgroundUrl: finalBgUrl,
        hasBackground: !!finalBgUrl,
        hasLottie,
        hasPhotos,

        designJSON,
        updatedAt: serverTimestamp(),
      } as const;

      await setDoc(tplRef, payload, { merge: true });

      if (backgroundFile) setBackgroundFile(null);

      alert("✅ Changes saved!");
      return true;
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("Не удалось сохранить изменения. См. консоль.");
      return false;
    }
  }, [
    templateId,
    fields,
    backgroundUrl,
    backgroundFile,
    setBackgroundFile,
    categoryId,
    subcategoryId,
    title,
    tags,
    animationLayers,
    photoLayer,
  ]);

  return { handleUpdateTemplate };
}