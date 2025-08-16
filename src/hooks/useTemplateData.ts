// editor-app/src/hooks/useTemplateData.ts
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type {
  Field,
  AnimationLayer,
  LottieAnimationLayer,
  DesignJSON,
  PhotoLayer,
  PhotoShape,
} from "../types/editor";

/** Дефолтная рамка для фото (центр, квадрат) */
const DEFAULT_PHOTO_LAYER: PhotoLayer = {
  hasPhoto: false,
  photoShape: "rect",
  samplePhotoUrl: null,
  x: 200,
  y: 200,
  width: 240,
  height: 240,
  rotation: 0,
};

export function useTemplateData(templateId: string) {
  // дизайн
  const [fields, setFields] = useState<Field[]>([]);
  const [backgroundUrl, setBackgroundUrl] = useState("");
  const [animationLayers, setAnimationLayers] = useState<AnimationLayer[]>([]);
  const [photoLayer, setPhotoLayer] = useState<PhotoLayer>(DEFAULT_PHOTO_LAYER);

  // мета (в SPA не редактируем, но держим для SSR)
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!templateId) return;

    // 🔧 поддержка redirect-паттерна `template/<id>`
    const cleanId = templateId.replace(/^template\//, "");

    const loadTemplate = async () => {
      setLoading(true);
      setError(null);

      try {
        // Читаем только опубликованный документ (без templatesDraft)
        const ref = doc(db, "templates", cleanId);
        const snap = await getDoc(ref);
        if (!snap.exists()) throw new Error("Template not found");

        const data = snap.data() as Record<string, unknown>;

        // мета
        setCategoryId((data.categoryId as string) || "");
        setSubcategoryId((data.subcategoryId as string) || "");
        setTitle((data.title as string) || "");
        setTags(((data.tags as string[]) || []).filter(Boolean));

        // 1) Новый формат: designJSON целиком
        const dj = data.designJSON as DesignJSON | undefined;
        if (dj) {
          setBackgroundUrl(dj.background?.url || "");

          const rawAnimations = (dj.layers?.animations || []) as AnimationLayer[];
          const hydrated = await hydrateLottie(rawAnimations);

          setFields(dj.layers?.fields || []);
          setAnimationLayers(hydrated);

          const ph =
            dj.layers?.photo ??
            normalizePhotoFromLegacy({
              hasPhoto: (data.hasPhoto as boolean) ?? false,
              photoShape: (data.photoShape as PhotoShape | undefined) ?? undefined,
              samplePhotoUrl: (data.samplePhotoUrl as string | undefined) ?? undefined,
            });

          setPhotoLayer(ph ?? DEFAULT_PHOTO_LAYER);
          return;
        }

        // 2) Переходный «design»-объект или плоские поля (legacy)
        const design = (data.design ?? {}) as {
          backgroundUrl?: string;
          fields?: Field[];
          animationLayers?: AnimationLayer[];
          photo?: PhotoLayer;
        };

        const bgUrl = design.backgroundUrl || (data.backgroundUrl as string) || "";
        const fieldsRaw = (design.fields || (data.fields as Field[]) || []) as Field[];
        const animationsRaw = (design.animationLayers ||
          (data.animationLayers as AnimationLayer[]) ||
          []) as AnimationLayer[];
        const hydrated = await hydrateLottie(animationsRaw);

        setBackgroundUrl(bgUrl);
        setFields(fieldsRaw);
        setAnimationLayers(hydrated);

        const ph =
          design.photo ??
          normalizePhotoFromLegacy({
            hasPhoto: (data.hasPhoto as boolean) ?? false,
            photoShape: (data.photoShape as PhotoShape | undefined) ?? undefined,
            samplePhotoUrl: (data.samplePhotoUrl as string | undefined) ?? undefined,
          });
        setPhotoLayer(ph ?? DEFAULT_PHOTO_LAYER);
      } catch (err) {
        console.error("❌ useTemplateData error:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    void loadTemplate();
  }, [templateId]);

  return {
    // дизайн
    fields,
    setFields,
    backgroundUrl,
    setBackgroundUrl,
    animationLayers,
    setAnimationLayers,
    photoLayer,
    setPhotoLayer,

    // мета (для SSR)
    categoryId,
    setCategoryId,
    subcategoryId,
    setSubcategoryId,
    title,
    setTitle,
    tags,
    setTags,

    loading,
    error,
  };
}

// ——————————————————————————
// helpers
// ——————————————————————————

/** Поддержать и новое поле lottieSrc, и легаси lottieUrl без any/ts-ignore */
type WithLottieSrc = { type: "lottie"; lottieSrc?: string };
type WithLottieUrlLegacy = { type: "lottie"; lottieUrl?: string };
type MaybeLegacyLottie = AnimationLayer & Partial<WithLottieSrc & WithLottieUrlLegacy>;

function getLottieSrc(layer: MaybeLegacyLottie): string | undefined {
  if (layer.type !== "lottie") return undefined;
  return layer.lottieSrc ?? layer.lottieUrl;
}

function withLottieData(
  layer: AnimationLayer,
  data: Record<string, unknown>,
  src: string
): LottieAnimationLayer {
  const base: LottieAnimationLayer = {
    ...(layer as LottieAnimationLayer),
    lottieData: data,
  };
  // нормализуем URL в рантайме как lottieSrc
  (base as LottieAnimationLayer & WithLottieSrc).lottieSrc = src;
  return base;
}

async function hydrateLottie(layers: AnimationLayer[]): Promise<AnimationLayer[]> {
  return Promise.all(
    layers.map(async (layer) => {
      if (layer.type !== "lottie") return layer;

      const src = getLottieSrc(layer as MaybeLegacyLottie);
      if (!src) return layer;

      try {
        const res = await fetch(src);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as Record<string, unknown>;
        return withLottieData(layer, json, src);
      } catch (err) {
        console.warn("⚠️ Failed to load Lottie data for:", src, err);
        return layer;
      }
    })
  );
}

/** Сборка photoLayer из старых плоских полей, если они встречаются */
function normalizePhotoFromLegacy(input: {
  hasPhoto?: boolean;
  photoShape?: PhotoShape;
  samplePhotoUrl?: string;
}): PhotoLayer | null {
  const has = !!input.hasPhoto;
  if (!has) return { ...DEFAULT_PHOTO_LAYER, hasPhoto: false };

  const shape: PhotoShape = input.photoShape ?? "rect";
  const sample = input.samplePhotoUrl?.trim() || null;

  return {
    ...DEFAULT_PHOTO_LAYER,
    hasPhoto: true,
    photoShape: shape,
    samplePhotoUrl: sample,
  };
}