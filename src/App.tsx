// editor-app/src/App.tsx

import { useMemo } from "react";
import { getEditorRouteInfo } from "./utils/route";
import { withAdminAuth } from "./hooks/withAdminAuth";

import TemplateEditor from "./components/Template/TemplateEditor";
import TemplateCreator from "./components/Template/TemplateCreator";


export default function App() {
  const { mode, templateId, isNew } = getEditorRouteInfo();

  const ProtectedEditor = useMemo(
    () => withAdminAuth(() => <TemplateEditor templateId={templateId} />, mode),
    [templateId, mode]
  );

  const ProtectedCreator = useMemo(
    () => withAdminAuth(TemplateCreator, mode),
    [mode]
  );

  if (!mode) return <p>Missing mode</p>;
  if (isNew && mode !== "admin") return <p>Invalid template ID</p>;

  if (isNew && mode === "admin") {
    return <ProtectedCreator />;
  }

  if (mode === "admin") {
    return <ProtectedEditor />;
  }

  

  return <p>Unknown mode</p>;
}
