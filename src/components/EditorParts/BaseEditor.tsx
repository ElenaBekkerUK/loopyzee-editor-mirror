// editor-app/src/components/EditorParts/BaseEditor.tsx
"use client";

import React, { useCallback, useState, forwardRef, useImperativeHandle, useRef } from "react";
import CanvasStage, { CanvasStageHandle } from "./CanvasStage";
import SidebarPanel from "./SidebarPanel";
import * as s from "./BaseEditor.css";
import { Field, AnimationLayer, Category, PhotoLayer } from "../../types/editor";
import { CANVAS_W, CANVAS_H } from "../../constants/editor";
import type { Dispatch, SetStateAction } from "react";

export type BaseEditorHandle = {
  /** Вернёт PNG превью текущего холста */
  makePreviewBlob: (pixelRatio?: number) => Promise<Blob>;
};

type Props = {
  mode: "admin" | "user";
  templateId: string;
  imageUrl: string;
  fields: Field[];
  onChangeFields: (fields: Field[]) => void;
  onUploadBg?: (file: File) => void;
  onClearBg?: () => void;
  categoryId?: string;
  subcategoryId?: string;
  categories?: Category[];
  availableSubcategories?: { id: string; title: string }[];
  onChangeCategoryId?: (id: string) => void;
  onChangeSubcategoryId?: (id: string) => void;
  showCategorySelect?: boolean;
  showSubcategorySelect?: boolean;
  onSaveClick?: () => void;
  showSaveButton?: boolean;
  title?: string;
  setTitle?: (t: string) => void;
  tags?: string[];
  setTags?: (tags: string[]) => void;
  animationLayers: AnimationLayer[];
  setAnimationLayers: Dispatch<SetStateAction<AnimationLayer[]>>;
  activeField: Field | null;
  activeFieldId?: string;
  setActiveFieldId: (id: string | null) => void;
  onAddField: () => string;
  photoLayer?: PhotoLayer;
  setPhotoLayer?: (next: PhotoLayer) => void;
};

const BaseEditor = forwardRef<BaseEditorHandle, Props>(function BaseEditor(
  {
    mode,
    templateId,
    imageUrl,
    fields,
    onChangeFields,
    onUploadBg,
    onClearBg,
    categoryId,
    subcategoryId,
    categories = [],
    availableSubcategories = [],
    onChangeCategoryId,
    onChangeSubcategoryId,
    showCategorySelect,
    showSubcategorySelect,
    onSaveClick,
    showSaveButton,
    title,
    setTitle,
    tags = [],
    setTags,
    animationLayers,
    setAnimationLayers,
    activeField,
    activeFieldId,
    setActiveFieldId,
    onAddField,
    photoLayer,
    setPhotoLayer,
  },
  ref
) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  // ref на CanvasStage
  const canvasRef = useRef<CanvasStageHandle | null>(null);

  useImperativeHandle(ref, () => ({
    async makePreviewBlob(pixelRatio = 2) {
      if (!canvasRef.current) throw new Error("Canvas not ready");
      return await canvasRef.current.toPNGBlob(pixelRatio);
    },
  }));

  const handleDragField = useCallback(
    (id: string, newY: number) => {
      const updated = fields.map((f) => (f.id === id ? { ...f, y: newY } : f));
      onChangeFields(updated);
    },
    [fields, onChangeFields]
  );

  const handleDragLottie = useCallback(
    (id: string, newX: number, newY: number, newW?: number, newH?: number) => {
      setAnimationLayers((prev) =>
        prev.map((layer) =>
          layer.type === "lottie" && layer.id === id
            ? { ...layer, x: newX, y: newY, width: newW ?? layer.width, height: newH ?? layer.height }
            : layer
        )
      );
    },
    [setAnimationLayers]
  );

  return (
    <div className={s.editorWrap}>
      <div className={s.stageWrap} style={{ width: CANVAS_W, height: CANVAS_H }}>
        <CanvasStage
          ref={canvasRef}               
          backgroundUrl={imageUrl}
          fields={fields}
          activeFieldId={activeFieldId ?? activeField?.id}
          onSelect={setActiveFieldId}
          onDrag={handleDragField}
          onDragLottie={handleDragLottie}
          mode={mode}
          animationLayers={animationLayers}
          photoLayer={photoLayer}
          setPhotoLayer={setPhotoLayer}
        />
      </div>

      <SidebarPanel
        mode={mode}
        templateId={templateId}
        showSaveButton={showSaveButton}
        onSaveClick={onSaveClick}
        showCategorySelect={mode === "admin" ? showCategorySelect : false}
        showSubcategorySelect={mode === "admin" ? showSubcategorySelect : false}
        categoryId={categoryId ?? ""}
        subcategoryId={subcategoryId}
        categories={categories}
        availableSubcategories={availableSubcategories}
        onChangeCategoryId={mode === "admin" ? onChangeCategoryId : undefined}
        onChangeSubcategoryId={mode === "admin" ? onChangeSubcategoryId : undefined}
        title={title}
        setTitle={setTitle}
        tags={tags}
        setTags={setTags ?? (() => {})}
        activeField={activeField}
        onChangeField={(id, key, value) => {
          const updated = fields.map((f) => (f.id === id ? { ...f, [key]: value } : f));
          onChangeFields(updated);
        }}
        onDeleteField={(id) => {
          const updated = fields.filter((f) => f.id !== id);
          onChangeFields(updated);
          if (activeFieldId === id) setActiveFieldId(null);
        }}
        onResetSpacing={() => {
          if (!activeFieldId) return;
          const updated = fields.map((f) =>
            f.id === activeFieldId ? { ...f, letterSpacing: 0, lineHeight: 1 } : f
          );
          onChangeFields(updated);
        }}
        onAddField={onAddField}
        onBgChange={mode === "admin" ? onUploadBg : undefined}
        onBgReset={mode === "admin" ? onClearBg : undefined}
        showColorPicker={showColorPicker}
        onToggleColorPicker={setShowColorPicker}
        animationLayers={animationLayers}
        setAnimationLayers={setAnimationLayers}
        setActiveFieldId={(id: string) => setActiveFieldId(id)}
      />
    </div>
  );
});

export default BaseEditor;