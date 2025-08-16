// editor-app/src/components/Template/TemplateEditor.tsx
"use client";

import { useMemo, useRef, useState } from "react";
import BaseEditor, { BaseEditorHandle } from "../EditorParts/BaseEditor";
import { useTemplateEditor } from "../../hooks/useTemplateEditor";
import { useTemplateData } from "../../hooks/useTemplateData";
import type { AnimationLayer, Field } from "@/types/editor";
import { fonts, pastelColors, CANVAS_W, BOX_WIDTH } from "@/constants/editor";
import LottieUploadPanel from "./LottieUploadPanel";

import { getStorage, ref as sref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../firebase";

type Props = { templateId: string };

const TemplateEditor: React.FC<Props> = ({ templateId }) => {
  const {
    // дизайн
    fields,
    setFields,
    backgroundUrl,
    setBackgroundUrl,
    animationLayers,
    setAnimationLayers,

    // метаданные (в SPA не редактируем)
    categoryId,
    subcategoryId,
    title,
    tags,

    // фото-слой
    photoLayer,
    setPhotoLayer,
  } = useTemplateData(templateId);

  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const activeField = useMemo(
    () => fields.find((f) => f.id === activeFieldId) || null,
    [fields, activeFieldId]
  );

  const { handleUpdateTemplate } = useTemplateEditor(
    templateId,
    fields,
    backgroundUrl,
    backgroundFile,
    setBackgroundFile,
    // мета (храним в шаблоне, редактируем на SSR)
    categoryId,
    subcategoryId,
    title,
    tags,
    // анимация — только Lottie
    animationLayers,
    // фото-слой (если есть)
    photoLayer ?? null
  );

  // ref на BaseEditor для генерации превью
  const editorRef = useRef<BaseEditorHandle | null>(null);

  // удобные мутации слоёв
  const replaceOrAddLayer = (layer: AnimationLayer) => {
    setAnimationLayers((prev) => {
      const idx = prev.findIndex((l) => l.id === layer.id);
      if (idx >= 0) return prev.map((l, i) => (i === idx ? layer : l));
      return [...prev, layer];
    });
  };
  const removeLayer = (layerId?: string) => {
    setAnimationLayers((prev) =>
      layerId ? prev.filter((l) => l.id !== layerId) : prev.filter((l) => l.type !== "lottie")
    );
  };

  // объединённый save: сначала сохраняем дизайн, затем генерим превью и пишем thumbnailUrl
  const handleSaveWithPreview = async () => {
    const ok = await handleUpdateTemplate();
    if (!ok) return;

    try {
      // 1) PNG из канваса
      const blob = await editorRef.current?.makePreviewBlob(2);
      if (!blob) return;

      // 2) загрузка в Storage
      const storage = getStorage();
      const path = `previews/${templateId}/thumb.png`;
      const snap = await uploadBytes(sref(storage, path), blob, {
        contentType: "image/png",
        cacheControl: "public, max-age=31536000, immutable",
      });
      const url = await getDownloadURL(snap.ref);

      // 3) запись thumbnailUrl в Firestore
      await setDoc(
        doc(db, "templates", templateId),
        { thumbnailUrl: url, updatedAt: Date.now() },
        { merge: true }
      );

      alert("✅ Saved + preview updated");
    } catch (e) {
      console.error("Preview upload failed:", e);
      alert("Сохранено. Но превью не обновилось (см. консоль).");
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <BaseEditor
        ref={editorRef}
        mode="admin"
        templateId={templateId}
        imageUrl={backgroundUrl}
        fields={fields}
        onChangeFields={setFields}
        onUploadBg={(file: File) => {
          setBackgroundFile(file);
          setBackgroundUrl(URL.createObjectURL(file));
        }}
        onClearBg={() => {
          setBackgroundFile(null);
          setBackgroundUrl("");
        }}
        // метаданные редактируются только в SSR-админке
        showCategorySelect={false}
        showSubcategorySelect={false}
        onSaveClick={handleSaveWithPreview} // ← используем объединённый save
        showSaveButton
        animationLayers={animationLayers as AnimationLayer[]}
        setAnimationLayers={setAnimationLayers}
        activeField={activeField}
        activeFieldId={activeFieldId ?? undefined}
        setActiveFieldId={setActiveFieldId}
        onAddField={() => {
          const newId = `f${fields.length + 1}`;
          const newField: Field = {
            id: newId,
            label: "New Field",
            text: "",
            font: fonts[fields.length % fonts.length],
            color: pastelColors[fields.length % pastelColors.length],
            align: "center",
            weight: "normal",
            style: "normal",
            size: 28,
            x: CANVAS_W / 2 - BOX_WIDTH / 2,
            y: 220 + fields.length * 38,
            letterSpacing: 0,
            lineHeight: 1,
            lock: {},
          };
          setFields((prev) => [...prev, newField]);
          setActiveFieldId(newId);
          return newId;
        }}
        // фото-слой
        photoLayer={photoLayer ?? undefined}
        setPhotoLayer={setPhotoLayer}
      />

      {/* Панель Lottie — только для существующего шаблона */}
      <div className="grid md:grid-cols-[1fr,320px] gap-6">
        <div />
        <div className="space-y-4">
          <LottieUploadPanel
  templateId={templateId}
  currentLottieSrc={null} // или подставь реальный URL из шаблона, если он есть
  onAddOrReplaceLayer={replaceOrAddLayer}
  onRemoveLayer={removeLayer}
/>
          <div className="flex justify-end">
            <a
              className="underline text-sm opacity-80 hover:opacity-100"
              href={`https://www.loopyzee.com/admin/templates/${templateId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Edit metadata in Admin ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateEditor;