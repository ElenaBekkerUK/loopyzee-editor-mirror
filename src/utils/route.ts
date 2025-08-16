//editor-app/src/utils/route.ts
export type EditorMode = "admin" | "user";

export function getEditorRouteInfo(): {
  templateId: string;
  isNew: boolean;
  mode: EditorMode | "";
} {
  const params = new URLSearchParams(window.location.search);

  const rawMode = params.get("mode");
  const redirect = params.get("redirect") ?? "";

  const mode: EditorMode | "" =
    rawMode === "admin" || rawMode === "user" ? rawMode : "";

  const templateId = redirect.startsWith("/") ? redirect.slice(1) : redirect;
  const isNew = !templateId || templateId.length < 6;

  return { templateId, isNew, mode };
}
