// editor-app/src/pages/preview.tsx

import { useEffect, useState } from "react";
import { Stage, Layer, Text as KonvaText, Image as KonvaImage } from "react-konva";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase"; // ← поправь путь, если нужно
import { Field } from "../types/editor"; // ← тоже проверь путь

const CANVAS_W = 600;
const CANVAS_H = 900;

export default function PreviewPage() {
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(true);

  const searchParams = new URLSearchParams(window.location.search);
  const draftId = searchParams.get("draft");

  useEffect(() => {
    if (!draftId) return;

    const fetchDraft = async () => {
      try {
        const ref = doc(db, "drafts", draftId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setBackgroundUrl(data.backgroundUrl);
          setFields(data.fields || []);
        } else {
          console.warn("Draft not found:", draftId);
        }
      } catch (err) {
        console.error("Failed to load draft", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDraft();
  }, [draftId]);

  useEffect(() => {
    if (!backgroundUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundUrl;
    img.onload = () => setBgImage(img);
  }, [backgroundUrl]);

  if (!draftId) {
    return <p>❌ draftId не передан</p>;
  }

  if (loading) {
    return <p>Загрузка превью…</p>;
  }

  return (
    <div style={{ width: CANVAS_W, height: CANVAS_H, margin: "0 auto" }}>
      <Stage width={CANVAS_W} height={CANVAS_H}>
        <Layer>
          {bgImage && (
            <KonvaImage
              image={bgImage}
              width={CANVAS_W}
              height={CANVAS_H}
              listening={false}
            />
          )}
          {fields.map((f) => (
            <KonvaText
              key={f.id}
              text={f.text}
              x={f.x}
              y={f.y}
              fontSize={f.size}
              fontFamily={f.font}
              fontStyle={`${f.style} ${f.weight}`}
              fill={f.color}
              align={f.align}
              lineHeight={f.lineHeight || 1}
              letterSpacing={f.letterSpacing || 0}
              listening={false}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
