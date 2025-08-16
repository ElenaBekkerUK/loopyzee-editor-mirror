// editor-app/src/components/EditorParts/tabs/getAdminTabs.tsx
import { EditorTab } from "../EditorTabsPanel";
import LottieUploadPanel from "../../Template/LottieUploadPanel";
import TagInput from "../../ui/TagInput";
import ActiveFieldEditor from "../ActiveFieldEditor";
import type { AnimationLayer, Field } from "../../../types/editor";

import { Input } from "../../ui/Input";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Select } from "../../ui/Select";

export function getAdminTabs({
  templateId,
  title,
  setTitle,
  tags,
  setTags,
  showCategorySelect,
  showSubcategorySelect,
  categoryId,
  subcategoryId,
  availableSubcategories,
  categories,
  onChangeCategoryId,
  onChangeSubcategoryId,
  animationLayers,
  setAnimationLayers,
  handleDeleteAnimationLayer,
  activeField,
  onChangeField,
  onDeleteField,
  onResetSpacing,
  showColorPicker,
  onShowColorPicker,
  onAddField,
  setActiveFieldId,
}: {
  /** нужен для LottieUploadPanel; может быть пустым при создании */
  templateId?: string;
  title?: string;
  setTitle?: (t: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  showCategorySelect?: boolean;
  showSubcategorySelect?: boolean;
  categoryId: string;
  subcategoryId?: string;
  availableSubcategories?: { id: string; title: string }[];
  categories: { id: string; title: string }[];
  onChangeCategoryId?: (id: string) => void;
  onChangeSubcategoryId?: (id: string) => void;

  animationLayers: AnimationLayer[];
  setAnimationLayers: (
    layers: AnimationLayer[] | ((prev: AnimationLayer[]) => AnimationLayer[])
  ) => void;

  /** НУЖЕН! — вызывался из SidebarPanel */
  handleDeleteAnimationLayer: (index: number) => void;

  activeField: Field | null;
  onChangeField: <K extends keyof Field>(id: string, key: K, value: Field[K]) => void;
  onDeleteField: (id: string) => void;
  onResetSpacing: () => void;
  showColorPicker: boolean;
  onShowColorPicker: (val: boolean) => void;
  onAddField: () => string;
  setActiveFieldId?: (id: string) => void;
}): EditorTab[] {
  return [
    {
      key: "template",
      label: "Template",
      content: (
        <div className="space-y-4">
          {title !== undefined && setTitle && (
            <div className="space-y-1">
              <span className="text-sm font-medium text-muted">Template Title:</span>
              <Input
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="Template title..."
              />
            </div>
          )}
          <div className="space-y-1">
            <span className="text-sm font-medium text-muted">Tags:</span>
            <TagInput value={tags} onChange={setTags} />
          </div>
        </div>
      ),
    },
    {
      key: "category",
      label: "Category",
      content: (
        <div className="space-y-4">
          {showCategorySelect && (
            <>
              <div className="space-y-1">
                <span className="text-sm font-medium text-muted">Category:</span>
                <Select
                  value={categoryId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    onChangeCategoryId?.(e.target.value)
                  }
                  disabled={categories.length === 0}
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </Select>
              </div>

              {showSubcategorySelect && (availableSubcategories?.length ?? 0) > 0 && (
                <div className="space-y-1">
                  <span className="text-sm font-medium text-muted">Subcategory:</span>
                  <Select
                    value={subcategoryId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      onChangeSubcategoryId?.(e.target.value)
                    }
                  >
                    <option value="">-- Select Subcategory --</option>
                    {availableSubcategories!.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.title}
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </>
          )}
        </div>
      ),
    },
    {
      key: "field",
      label: "Field",
      content: (
        <Card>
          <div className="space-y-4">
            {activeField ? (
              <ActiveFieldEditor
                field={activeField}
                onChange={onChangeField}
                onDelete={onDeleteField}
                onResetSpacing={onResetSpacing}
                showColorPicker={showColorPicker}
                onShowColorPicker={onShowColorPicker}
              />
            ) : (
              <p className="text-sm italic text-muted">Select a text field on the canvas to edit.</p>
            )}

            <Button
              variant="secondary"
              className="h-8 px-3 text-sm"
              onClick={() => {
                const id = onAddField();
                setActiveFieldId?.(id);
              }}
            >
              + Add Field
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: "animations",
      label: "Animations",
      content: (
        <Card>
          <div className="space-y-4">
            {/* Только если есть templateId — показываем загрузчик Lottie */}
            {templateId ? (
              <LottieUploadPanel
                templateId={templateId}
                onAddOrReplaceLayer={(layer) => {
                  setAnimationLayers((prev) => {
                    const i = prev.findIndex((l) => l.id === layer.id);
                    if (i >= 0) return prev.map((l, idx) => (idx === i ? layer : l));
                    return [...prev, layer];
                  });
                }}
                onRemoveLayer={(layerId) => {
                  setAnimationLayers((prev) =>
                    layerId ? prev.filter((l) => l.id !== layerId) : prev.filter((l) => l.type !== "lottie")
                  );
                }}
                // currentLayerId / currentLottieSrc — опционально, можно не передавать
              />
            ) : (
              <p className="text-xs text-muted">
                Save template first to enable Lottie upload (id is required).
              </p>
            )}

            {animationLayers.filter((l) => l.type === "lottie").length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold">Lottie Layers</h3>
                {animationLayers.map((layer, index) =>
                  layer.type === "lottie" ? (
                    <div
                      key={layer.id || `lottie-${index}`}
                      className="flex items-center justify-between"
                    >
                      <span>Layer {index + 1}</span>
                      <Button
                        variant="ghost"
                        className="h-8 px-3 text-sm"
                        onClick={() => handleDeleteAnimationLayer(index)}
                      >
                        Delete
                      </Button>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        </Card>
      ),
    },
  ];
}