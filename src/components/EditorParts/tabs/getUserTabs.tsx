// editor-app/src/components/EditorParts/tabs/getUserTabs.tsx

import { EditorTab } from "../EditorTabsPanel";
import type { Field } from "../../../types/editor";
import ActiveFieldEditor from "../ActiveFieldEditor";
import { ReactNode } from "react";
import * as s from "../EditorTabsPanel.css";

export function getUserTabs({
  activeField,
  onChangeField,
  onDeleteField,
  onResetSpacing,
  showColorPicker,
  onShowColorPicker,
}: {
  activeField: Field | null;
  onChangeField: <K extends keyof Field>(id: string, key: K, value: Field[K]) => void;
  onDeleteField: (id: string) => void;
  onResetSpacing: () => void;
  showColorPicker: boolean;
  onShowColorPicker: (val: boolean) => void;
}): EditorTab[] {
  return [
    {
      key: "text",
      label: "Text",
      content: ((): ReactNode => (
        <div className={s.tabContent}>
          {activeField ? (
            <ActiveFieldEditor
              field={activeField}
              onChange={onChangeField}
              onDelete={onDeleteField}
              onResetSpacing={onResetSpacing}
              showColorPicker={showColorPicker}
              onShowColorPicker={onShowColorPicker}
            />
          ) : null}
        </div>
      ))(),
    },
  ];
}
