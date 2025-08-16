import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// editor-app/src/pages/preview.tsx
import { useEffect, useState } from "react";
import { Stage, Layer, Text as KonvaText, Image as KonvaImage } from "react-konva";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase"; // ← поправь путь, если нужно
const CANVAS_W = 600;
const CANVAS_H = 900;
export default function PreviewPage() {
    const [bgImage, setBgImage] = useState(null);
    const [backgroundUrl, setBackgroundUrl] = useState("");
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const searchParams = new URLSearchParams(window.location.search);
    const draftId = searchParams.get("draft");
    useEffect(() => {
        if (!draftId)
            return;
        const fetchDraft = async () => {
            try {
                const ref = doc(db, "drafts", draftId);
                const snap = await getDoc(ref);
                if (snap.exists()) {
                    const data = snap.data();
                    setBackgroundUrl(data.backgroundUrl);
                    setFields(data.fields || []);
                }
                else {
                    console.warn("Draft not found:", draftId);
                }
            }
            catch (err) {
                console.error("Failed to load draft", err);
            }
            finally {
                setLoading(false);
            }
        };
        fetchDraft();
    }, [draftId]);
    useEffect(() => {
        if (!backgroundUrl)
            return;
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = backgroundUrl;
        img.onload = () => setBgImage(img);
    }, [backgroundUrl]);
    if (!draftId) {
        return _jsx("p", { children: "\u274C draftId \u043D\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u043D" });
    }
    if (loading) {
        return _jsx("p", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0440\u0435\u0432\u044C\u044E\u2026" });
    }
    return (_jsx("div", { style: { width: CANVAS_W, height: CANVAS_H, margin: "0 auto" }, children: _jsx(Stage, { width: CANVAS_W, height: CANVAS_H, children: _jsxs(Layer, { children: [bgImage && (_jsx(KonvaImage, { image: bgImage, width: CANVAS_W, height: CANVAS_H, listening: false })), fields.map((f) => (_jsx(KonvaText, { text: f.text, x: f.x, y: f.y, fontSize: f.size, fontFamily: f.font, fontStyle: `${f.style} ${f.weight}`, fill: f.color, align: f.align, lineHeight: f.lineHeight || 1, letterSpacing: f.letterSpacing || 0, listening: false }, f.id)))] }) }) }));
}
