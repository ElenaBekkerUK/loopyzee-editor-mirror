// editor-app/src/hooks/useTemplateUploader.ts
import { useCallback } from "react";
import { db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import type { Field, AnimationLayer, DesignJSON, PhotoLayer } from "../types/editor";
import { BASE_CANVAS } from "../constants/editor";
import { uploadToStorage } from "../firebase/uploadToStorage";
import { upsertTags } from "../lib/upsertTags";

/**
 * Создание нового шаблона:
 * - используем переданный templateId (очищаем от префикса "template/")
 * - при необходимости загружаем фон
 * - собираем designJSON (без runtime-поля lottieData)
 * - пишем один документ в Firestore: templates/{templateId}
 */
export function useTemplateUploader(
  templateId: string,
  fields: Field[],
  backgroundUrl: string,
  backgroundFile: File | null,
  setBackgroundFile: (file: File | null) => void,
  subcategoryId: string,
  title: string,
  tags: string[],
  animationLayers: AnimationLayer[] = [],
  categories: {
    id: string;
    title: string;
    subcategories: { id: string; title: string }[];
  }[] = [],
  photoLayer?: PhotoLayer | null
) {
  const handleCreateTemplate = useCallback(async () => {
    try {
      if (!templateId) {
        alert("templateId is required");
        return undefined;
      }

      // 🔧 убираем возможный префикс "template/"
      const cleanId = templateId.replace(/^template\//, "");

      // найти категорию и подкатегорию
      const category =
        categories.find((cat) => cat.subcategories?.some((s) => s.id === subcategoryId)) || null;
      const subcategory = category?.subcategories?.find((s) => s.id === subcategoryId) || null;

      if (!category || !subcategory) {
        alert("Select correct category & subcategory.");
        return undefined;
      }

      // фон
      let finalBgUrl: string | null = backgroundUrl || null;
      if (backgroundFile) {
        const { url } = await uploadToStorage(`templates/${cleanId}/assets`, backgroundFile);
        finalBgUrl = url || null;
      }

      // убираем только runtime-поле lottieData, остальные слои не трогаем
      const cleanedAnimations: AnimationLayer[] = (animationLayers || []).map((layer) => {
        if (layer?.type === "lottie") {
          const copy = { ...layer } as Partial<AnimationLayer> & { lottieData?: unknown };
          delete copy.lottieData;
          return copy as AnimationLayer;
        }
        return layer;
      });

      // JSON дизайна
      const designJSON: DesignJSON = {
        canvas: { width: BASE_CANVAS.width, height: BASE_CANVAS.height, version: 1 },
        background: { url: finalBgUrl },
        layers: {
          fields,
          animations: cleanedAnimations,
          ...(photoLayer?.hasPhoto ? { photo: photoLayer } : {}),
        },
      };

      const cleanTags = tags.map((t) => t.trim()).filter(Boolean);

      // одна запись в templates/{id}
      await setDoc(
        doc(db, "templates", cleanId),
        {
          id: cleanId,
          title: (title || "").trim() || "Untitled",
          categoryId: category.id,
          subcategoryId,
          tags: cleanTags,
          backgroundUrl: finalBgUrl,
          designJSON,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      if (cleanTags.length) {
        await upsertTags(cleanTags);
      }

      setBackgroundFile(null);
      return cleanId;
    } catch (err) {
      console.error("❌ Create template failed:", err);
      alert("Template creation failed. See console.");
      return undefined;
    }
  }, [
    templateId,
    fields,
    backgroundUrl,
    backgroundFile,
    setBackgroundFile,
    subcategoryId,
    title,
    tags,
    animationLayers,
    categories,
    photoLayer,
  ]);

  return { handleCreateTemplate };
}