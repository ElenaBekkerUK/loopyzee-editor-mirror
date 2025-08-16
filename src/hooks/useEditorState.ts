// src/hooks/useEditorState.ts
import { useCallback, useEffect, useMemo, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "../firebase";
import { Field, AnimationLayer, Category, PhotoLayer } from "../types/editor";
import { fonts, pastelColors, CANVAS_W, BOX_WIDTH } from "../constants/editor";
import { useTemplateUploader } from "./useTemplateUploader";
import { useTemplateEditor } from "./useTemplateEditor";

// @NOTE: этот хук поддерживает только Lottie-анимации и новую схему designJSON

export function useEditorState(
  mode: "admin" | "user",
  initialBgUrl = "",
  initialCategoryId = "",
  initialCategories: Category[] = [],
  initializeDefaults = true
) {
  // design
  const [fields, setFields] = useState<Field[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState(initialBgUrl);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [animationLayers, setAnimationLayers] = useState<AnimationLayer[]>([]);

  // photo layer (optional)
  const [photoLayer, setPhotoLayer] = useState<PhotoLayer | null>(null);

  // metadata (kept in draft; edited on SSR)
  const [categoryId, setCategoryId] = useState(initialCategoryId);
  const [subcategoryId, setSubcategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [templateId, setTemplateId] = useState<string>(""); // ← строка, без null/undefined
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // ui
  const [showColorPicker, setShowColorPicker] = useState(false);

  // load categories if needed
  useEffect(() => {
    if (mode !== "admin" || initialCategories.length) return;
    getDocs(collection(db, "categories")).then((snap) => {
      setCategories(
        snap.docs.map((doc) => {
          const data = doc.data() as {
            title?: string;
            subcategories?: { id: string; title: string }[];
          };
          return {
            id: doc.id,
            title: data.title ?? "",
            subcategories: data.subcategories ?? [],
          };
        })
      );
    });
  }, [mode, initialCategories.length]);

  useEffect(() => {
    if (mode === "admin" && initialCategoryId) setCategoryId(initialCategoryId);
  }, [mode, initialCategoryId]);

  // default first field
  useEffect(() => {
    if (mode !== "admin" || !initializeDefaults || fields.length) return;
    const f: Field = {
      id: "f1",
      label: "Title",
      text: "Your Text",
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
      // isEditable: true,
    };
    setFields([f]);
    setActiveId("f1");
  }, [mode, initializeDefaults, fields.length]);

  // field helpers
  const pushFields = (f: Field[]) => setFields(f);

  const onFieldChange = useCallback(
    <K extends keyof Field>(id: string, key: K, value: Field[K]) => {
      const updated = fields.map((f) => (f.id === id ? { ...f, [key]: value } : f));
      pushFields(updated);
    },
    [fields]
  );

  const onAddField = () => {
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
    pushFields([...fields, newField]);
    setActiveId(newId);
    return newId;
  };

  const onDeleteField = (id: string) => {
    if (fields.length <= 1) return;
    const next = fields.filter((f) => f.id !== id);
    pushFields(next);
    setActiveId(next[0]?.id ?? null);
    setShowColorPicker(false);
  };

  const onResetSpacing = () => {
    if (!activeId) return;
    pushFields(
      fields.map((f) =>
        f.id === activeId ? { ...f, letterSpacing: 0, lineHeight: 1 } : f
      )
    );
  };

  const onDragField = (id: string, newY: number) => {
    pushFields(fields.map((f) => (f.id === id ? { ...f, y: newY } : f)));
  };

  const onDragLottie = (
    id: string,
    newX: number,
    newY: number,
    newW?: number,
    newH?: number
  ) => {
    setAnimationLayers((prev) =>
      prev.map((layer) =>
        layer.type === "lottie" && layer.id === id
          ? {
              ...layer,
              x: newX,
              y: newY,
              width: newW ?? layer.width,
              height: newH ?? layer.height,
            }
          : layer
      )
    );
  };

  // background
  const handleBgChange = (file: File) => {
    setBackgroundUrl(URL.createObjectURL(file));
    setBackgroundFile(file);
  };
  const handleBgReset = () => {
    setBackgroundUrl("");
    setBackgroundFile(null);
  };

  const activeField = useMemo(
    () => fields.find((f) => f.id === activeId) ?? null,
    [fields, activeId]
  );

  // create & update (новые сигнатуры)
  const { handleCreateTemplate } = useTemplateUploader(
    templateId,           // ← просто строка
    fields,
    backgroundUrl,
    backgroundFile,
    setBackgroundFile,
    subcategoryId,
    title,
    tags,
    animationLayers,
    categories,
    photoLayer ?? null
  );

  const { handleUpdateTemplate } = useTemplateEditor(
    templateId,           // ← тоже строка (может быть "")
    fields,
    backgroundUrl,
    backgroundFile,
    setBackgroundFile,
    categoryId,
    subcategoryId,
    title,
    tags,
    animationLayers,
    photoLayer ?? null
  );

  return {
    // design
    fields,
    setFields,
    activeId,
    setActiveId,
    activeField,
    onSelectField: setActiveId,
    onFieldChange,
    onAddField,
    onDeleteField,
    onResetSpacing,
    onDragField,
    onDragLottie,
    backgroundUrl,
    backgroundFile,
    setBackgroundFile,
    handleBgChange,
    handleBgReset,
    animationLayers,
    setAnimationLayers,
    photoLayer,
    setPhotoLayer,

    // meta
    categoryId,
    setCategoryId,
    subcategoryId,
    setSubcategoryId,
    categories,
    setCategories,
    templateId,
    setTemplateId,
    title,
    setTitle,
    tags,
    setTags,

    // actions
    handleCreateTemplate,
    handleUpdateTemplate,

    // ui
    showColorPicker,
    setShowColorPicker,
  };
}