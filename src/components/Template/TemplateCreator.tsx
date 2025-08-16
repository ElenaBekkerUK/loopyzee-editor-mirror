// src/components/Template/TemplateCreator.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import BaseEditor from "../EditorParts/BaseEditor";
import type { Field, AnimationLayer, Category, PhotoLayer } from "../../types/editor";
import { fonts, pastelColors, CANVAS_W, BOX_WIDTH, CANVAS_H } from "../../constants/editor";
import { useTemplateUploader } from "../../hooks/useTemplateUploader";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { Card } from "../ui/Card";
import { v4 as uuidv4 } from "uuid";

const DEFAULT_FIELDS: Field[] = [
  {
    id: "f1",
    label: "Title",
    text: "Emma & James",
    font: fonts[0],
    color: pastelColors[0],
    align: "center",
    weight: "normal",
    style: "normal",
    size: 44,
    x: CANVAS_W / 2 - BOX_WIDTH / 2,
    y: 110,
    letterSpacing: 0,
    lineHeight: 1,
    // если у тебя нет этого поля в типе Field, убери:
    // isEditable: true,
  },
];

const DEFAULT_PHOTO: PhotoLayer = {
  hasPhoto: false,
  photoShape: "circle",
  x: CANVAS_W / 2 - 120,
  y: CANVAS_H / 3 - 120,
  width: 240,
  height: 240,
  rotation: 0,
  samplePhotoUrl: null,
};

export default function TemplateCreator() {
  // стабильный id под Storage-пути и запись в templates/{id}
  const [templateId] = useState(() => uuidv4());

  // поля
  const [fields, setFields] = useState<Field[]>(DEFAULT_FIELDS);
  const [activeFieldId, setActiveFieldId] = useState<string | null>(null);
  const activeField = useMemo(
    () => fields.find((f) => f.id === activeFieldId) || null,
    [fields, activeFieldId]
  );

  // фон
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState("");

  // базовая мета
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [tagsString, setTagsString] = useState("");
  const tags = useMemo(
    () => tagsString.split(",").map((t) => t.trim()).filter(Boolean),
    [tagsString]
  );

  // категории
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "categories"));
        const cats: Category[] = snap.docs.map((d) => {
          const data = d.data() as Partial<Category> & {
            title?: string;
            subcategories?: { id: string; title: string }[];
          };
          return {
            id: d.id,
            title: data.title ?? "",
            subcategories: data.subcategories ?? [],
          };
        });
        setCategories(cats);
      } catch (err) {
        console.error("❌ Failed to load categories:", err);
      }
    })();
  }, []);
  const availableSubcategories = useMemo(
    () => categories.find((c) => c.id === categoryId)?.subcategories ?? [],
    [categories, categoryId]
  );

  // анимации — только Lottie
  const [animationLayers, _setAnimationLayers] = useState<AnimationLayer[]>([]);
  const setAnimationLayers: React.Dispatch<React.SetStateAction<AnimationLayer[]>> = (next) => {
    const keepLottie = (arr: AnimationLayer[]) => arr.filter((l) => l?.type === "lottie");
    _setAnimationLayers((prev) => {
      const nextVal =
        typeof next === "function" ? (next as (p: AnimationLayer[]) => AnimationLayer[])(prev) : next;
      return keepLottie(nextVal);
    });
  };

  // фото-слой
  const [photoLayer, setPhotoLayer] = useState<PhotoLayer>(DEFAULT_PHOTO);

  // ⬅️ ВАЖНО: новая сигнатура — первым аргументом templateId
  const { handleCreateTemplate } = useTemplateUploader(
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
    photoLayer
  );

  // создать → открыть SPA Editor
  const handleCreateAndOpen = async () => {
    if (!title.trim()) return alert("Please add a title");
    if (!categoryId || !subcategoryId) return alert("Select category & subcategory");
    if (!backgroundFile && !backgroundUrl) return alert("Upload a background image");

    const newId = await handleCreateTemplate();
    if (!newId) return;

    window.location.href = `https://editor.loopyzee.com/?mode=admin&redirect=/template/${newId}`;
  };

  // текстовое поле
  const handleAddField = (): string => {
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
      // isEditable: true,
    };
    setFields((prev) => [...prev, newField]);
    setActiveFieldId(newId);
    return newId;
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <Card className="flex flex-col gap-4 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="text-sm">
            <div className="mb-1 opacity-70">Title</div>
            <input
              className="w-full rounded border px-3 py-2"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Elegant Wedding Invitation"
            />
          </label>

          <label className="text-sm">
            <div className="mb-1 opacity-70">Category</div>
            <select
              className="w-full rounded border px-3 py-2"
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                setSubcategoryId("");
              }}
            >
              <option value="">— select —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <div className="mb-1 opacity-70">Subcategory</div>
            <select
              className="w-full rounded border px-3 py-2"
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value)}
              disabled={!categoryId}
            >
              <option value="">— select —</option>
              {availableSubcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="text-sm">
          <div className="mb-1 opacity-70">Tags (comma separated)</div>
          <input
            className="w-full rounded border px-3 py-2"
            value={tagsString}
            onChange={(e) => setTagsString(e.target.value)}
            placeholder="wedding, floral, pastel"
          />
        </label>
      </Card>

      <BaseEditor
        mode="admin"
        templateId={templateId}
        imageUrl={backgroundUrl}
        fields={fields}
        onChangeFields={(updated) => {
          setFields(updated);
          if (activeFieldId && !updated.some((f) => f.id === activeFieldId)) {
            setActiveFieldId(null);
          }
        }}
        onUploadBg={(file: File) => {
          setBackgroundFile(file);
          setBackgroundUrl(URL.createObjectURL(file));
        }}
        onClearBg={() => {
          setBackgroundFile(null);
          setBackgroundUrl("");
        }}
        activeFieldId={activeFieldId ?? undefined}
        setActiveFieldId={setActiveFieldId}
        activeField={activeField}
        categoryId={categoryId}
        subcategoryId={subcategoryId}
        categories={categories}
        availableSubcategories={availableSubcategories}
        onChangeCategoryId={setCategoryId}
        onChangeSubcategoryId={setSubcategoryId}
        showCategorySelect
        showSubcategorySelect={!!categoryId}
        onSaveClick={handleCreateAndOpen}
        showSaveButton
        title={title}
        setTitle={setTitle}
        tags={tags}
        setTags={(newTags) => setTagsString(newTags.join(", "))}
        animationLayers={animationLayers}
        setAnimationLayers={setAnimationLayers}
        photoLayer={photoLayer}
        setPhotoLayer={setPhotoLayer}
        onAddField={handleAddField}
      />
    </div>
  );
}