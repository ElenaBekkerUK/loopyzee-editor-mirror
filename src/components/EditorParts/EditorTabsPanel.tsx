// editor-app/src/components/EditorParts/EditorTabsPanel.tsx

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import * as s from "./EditorTabsPanel.css";
import { ReactNode } from "react";

export type EditorTab = {
  key: string;
  label: string;
  content: ReactNode;
};

type Props = {
  tabs: EditorTab[];
  currentTab: string;
  onTabChange: (key: string) => void;
};

export default function EditorTabsPanel({ tabs, currentTab, onTabChange }: Props) {
  return (
    <Tabs value={currentTab} onValueChange={onTabChange} className={s.root}>
      <TabsList className={s.tabs}>
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.key}
            value={tab.key}
            className={cn(s.tab.default, currentTab === tab.key && s.tab.active)}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent
          key={tab.key}
          value={tab.key}
          className={s.section}
         
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
