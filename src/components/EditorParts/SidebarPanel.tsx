// editor-app/src/components/EditorParts/SidebarPanel.tsx
import { useEffect, useState, memo, useCallback } from "react";
import BackgroundUploader from "./BackgroundUploader";
import EditorTabsPanel from "./EditorTabsPanel";
import * as s from "./BaseEditor.css";
import type { Field, AnimationLayer } from "../../types/editor";
import { getAdminTabs } from "./tabs/getAdminTabs";
import { getUserTabs } from "./tabs/getUserTabs";

type Category = {
  id: string;
  title: string;
  subcategories?: { id: string; title: string }[];
};

type Props = {
  mode: "admin" | "user";
  templateId: string;

  showSaveButton?: boolean;
  onSaveClick?: () => void;

  // Метаданные (могут быть скрыты на TemplateEditor — showCategorySelect=false)
  showCategorySelect?: boolean;
  showSubcategorySelect?: boolean;
  categoryId: string;
  subcategoryId?: string;
  onChangeSubcategoryId?: (id: string) => void;
  categories: Category[];
  availableSubcategories?: { id: string; title: string }[];
  onChangeCategoryId?: (id: string) => void;
  title?: string;
  setTitle?: (t: string) => void;
  tags: string[];
  setTags?: (t: string[]) => void;

  // Работа с текстовыми полями
  activeField: Field | null;
  onChangeField: <K extends keyof Field>(id: string, key: K, value: Field[K]) => void;
  onDeleteField: (id: string) => void;
  onResetSpacing: () => void;
  onAddField: () => string;

  // Фон
  onBgChange?: (file: File) => void;
  onBgReset?: () => void;

  // 🎨 Цветоподбор — ТОЛЬКО для текста
  showColorPicker: boolean;
  onToggleColorPicker: (val: boolean) => void;

  // 🎞️ Анимации — только Lottie
  animationLayers: AnimationLayer[];
  setAnimationLayers: React.Dispatch<React.SetStateAction<AnimationLayer[]>>;

  // (опция) нужно, если хочешь активировать добавленное поле сразу
  setActiveFieldId?: (id: string) => void;
};

function SidebarPanel({
  mode,
  templateId,
  showSaveButton,
  onSaveClick,
  showCategorySelect,
  showSubcategorySelect,
  categoryId,
  subcategoryId,
  onChangeSubcategoryId,
  categories,
  availableSubcategories,
  onChangeCategoryId,
  title,
  setTitle,
  tags,
  setTags,
  activeField,
  onChangeField,
  onDeleteField,
  onResetSpacing,
  onAddField,
  onBgChange,
  onBgReset,
  showColorPicker,
  onToggleColorPicker,
  animationLayers,
  setAnimationLayers,
  setActiveFieldId,
}: Props) {
  const [currentTab, setCurrentTab] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "admin" && categoryId && categories.length > 0) {
      const found = categories.find((c) => c.id === categoryId);
      if (!found) {
        console.warn("⚠️ categoryId не найден в списке категорий:", categoryId);
      }
    }
  }, [mode, categoryId, categories]);

  const handleDeleteAnimationLayer = useCallback(
    (index: number) => {
      setAnimationLayers((prev) => prev.filter((_, i) => i !== index));
    },
    [setAnimationLayers]
  );

  const tabs =
    mode === "admin"
      ? getAdminTabs({
          // важно прокинуть templateId → LottieUploadPanel
          templateId,
          title,
          setTitle,
          tags,
          setTags: setTags ?? (() => {}),
          showCategorySelect,
          showSubcategorySelect,
          categoryId,
          subcategoryId,
          availableSubcategories,
          categories,
          onChangeCategoryId,
          onChangeSubcategoryId,
          // поля
          activeField,
          onChangeField,
          onDeleteField,
          onResetSpacing,
          showColorPicker,
          onShowColorPicker: onToggleColorPicker,
          onAddField,
          setActiveFieldId,
          // lottie
          animationLayers,
          setAnimationLayers,
          handleDeleteAnimationLayer,
        })
      : getUserTabs({
          activeField,
          onChangeField,
          onDeleteField,
          onResetSpacing,
          showColorPicker,
          onShowColorPicker: onToggleColorPicker,
        });

  useEffect(() => {
    if (tabs.length > 0 && (!currentTab || !tabs.some((t) => t.key === currentTab))) {
      setCurrentTab(tabs[0].key);
    }
  }, [tabs, currentTab]);

  return (
    <aside className={s.sidebar}>
      <div style={{ textAlign: "center", fontFamily: "Caveat", fontSize: 34 }}>
        Loopyzee {mode === "admin" ? "(Admin)" : ""}
      </div>

      {mode === "admin" && (
        <button
          className={s.backButton}
          onClick={() => window.open("https://www.loopyzee.com/admin", "_self")}
        >
          ← Back to Admin
        </button>
      )}

      <EditorTabsPanel currentTab={currentTab ?? ""} onTabChange={setCurrentTab} tabs={tabs} />

      {mode === "admin" && onBgChange && onBgReset && (
        <BackgroundUploader onChange={onBgChange} onReset={onBgReset} />
      )}

      {showSaveButton && (
        <div className={s.saveSticky}>
          {mode === "admin" ? (
            <button onClick={onSaveClick} className={s.backButton}>
              Save Template
            </button>
          ) : (
            <button onClick={onSaveClick} className={s.saveUserBtn}>
              Сохранить приглашение ✨
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

export default memo(SidebarPanel);