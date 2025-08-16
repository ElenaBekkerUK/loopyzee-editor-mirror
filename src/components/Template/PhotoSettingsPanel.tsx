// editor-app/src/components/Template/PhotoSettingsPanel.tsx
"use client";

import { useRef, useState } from "react";
import { vars } from "@/styles/theme.css";
import { db } from "../../firebase";
import { doc, updateDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { uploadToStorage } from "../../firebase/uploadToStorage";
import type { PhotoShape } from "../../types/editor"; // ⬅️ общий тип

type Props = {
  /** Нужен для пути в Storage и записи черновика */
  templateId: string;

  hasPhoto: boolean;
  setHasPhoto: (val: boolean) => void;

  photoShape: PhotoShape;
  setPhotoShape: (shape: PhotoShape) => void;

  samplePhotoUrl: string;
  setSamplePhotoUrl: (url: string) => void;
};

export default function PhotoSettingsPanel({
  templateId,
  hasPhoto,
  setHasPhoto,
  photoShape,
  setPhotoShape,
  samplePhotoUrl,
  setSamplePhotoUrl,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function persistDraft(patch: Record<string, unknown>) {
    const ref = doc(db, "templatesDraft", templateId);
    try {
      await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
    } catch {
      await setDoc(ref, { ...patch, updatedAt: serverTimestamp() }, { merge: true });
    }
  }

  async function handleUpload(file: File) {
    setBusy(true);
    setErr(null);
    try {
      const { url } = await uploadToStorage(`templates/${templateId}/assets`, file);
      setSamplePhotoUrl(url);
      await persistDraft({ samplePhotoUrl: url });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function handleRemove() {
    setBusy(true);
    setErr(null);
    try {
      setSamplePhotoUrl("");
      await persistDraft({ samplePhotoUrl: "" });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Remove failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="flex flex-col gap-4 border p-6"
      style={{
        borderRadius: vars.radius.lg,
        backgroundColor: vars.color.bg,
        borderColor: vars.color.border,
      }}
    >
      {/* Toggle */}
      <label className="flex items-center gap-2 text-sm font-medium" style={{ color: vars.color.text }}>
        <input
          type="checkbox"
          checked={hasPhoto}
          onChange={async (e) => {
            const v = e.target.checked;
            setHasPhoto(v);
            await persistDraft({ hasPhoto: v });
          }}
        />
        Allow user photo
      </label>

      {/* Shape + Sample upload (visible only when enabled) */}
      {hasPhoto && (
        <>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-sm" style={{ color: vars.color.text }}>
              Mask shape:
            </label>
            <div className="flex gap-4">
              {(["circle", "rect", "arch"] as PhotoShape[]).map((shape) => (
                <label key={shape} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="photoShape"
                    value={shape}
                    checked={photoShape === shape}
                    onChange={async () => {
                      setPhotoShape(shape);
                      await persistDraft({ photoShape: shape });
                    }}
                  />
                  {shape}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-3 py-2 border rounded"
              style={{ borderColor: vars.color.border }}
              onClick={() => inputRef.current?.click()}
              disabled={busy}
            >
              {busy ? "Uploading…" : "Upload sample photo"}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
                e.currentTarget.value = "";
              }}
            />
            {samplePhotoUrl && (
              <>
                <img
                  src={samplePhotoUrl}
                  alt="Sample"
                  className="rounded border max-h-16 object-contain"
                />
                <button
                  type="button"
                  className="px-2 py-1 text-sm border rounded"
                  style={{ borderColor: vars.color.border }}
                  onClick={() => void handleRemove()}
                  disabled={busy}
                >
                  Remove
                </button>
              </>
            )}
          </div>
        </>
      )}

      {err && <p className="text-sm" style={{ color: vars.color.danger }}>{err}</p>}
      <p className="text-xs opacity-70">
        Tip: Position & size the photo mask on the canvas; user image will snap into the same frame.
      </p>
    </div>
  );
}