// editor-app/src/types/editor.ts

/** Текстовый слой */
export type Field = {
  id: string;
  label: string;
  text: string;
  font: string;
  color: string;
  align: "left" | "center" | "right";
  weight: "normal" | "bold";
  style: "normal" | "italic";
  size: number;
  x: number;
  y: number;
  letterSpacing?: number;
  lineHeight?: number;
  lock?: {
    text?: boolean;
    style?: boolean;
    position?: boolean;
  };
};

/** Lottie-анимация (единственный поддерживаемый тип анимации) */
export type LottieAnimationLayer = {
  id: string;
  type: "lottie";
  // что храним в Firestore:
  lottieSrc?: string;        // URL в Storage (templates/{id}/lottie/main.json)
  autoplay?: boolean;
  loop?: boolean;
  speed?: number;

  // runtime в редакторе (НЕ писать в Firestore):
  lottieData?: unknown;

  // трансформы
  x: number; y: number; width: number; height: number; rotation?: number;
  zIndex?: number;
};

/** Анимационные слои — сейчас только Lottie */
export type AnimationLayer = LottieAnimationLayer;

/** Опции фото-маски */
export type PhotoShape = "circle" | "rect" | "arch";

/** Фото-слой (маска + положение/размер) */
export type PhotoLayer = {
  hasPhoto: boolean;
  photoShape: PhotoShape;
  samplePhotoUrl?: string | null; // удобно сбрасывать в null
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number; // °, опционально
};

/** Унифицированный JSON дизайна (SPA <-> SSR) */
export type DesignJSON = {
  canvas: {
    width: number;
    height: number;
    version: 1; // фиксируем текущую версию схемы
  };
  background: {
    url: string | null;
  };
  layers: {
    fields: Field[];
    animations: AnimationLayer[];
    photo?: PhotoLayer; // опционально, если шаблон поддерживает фото
  };
};
/** Категория и подкатегории (для селектов в админке) */
export type Category = {
  id: string;
  title: string;
  subcategories: { id: string; title: string }[];
};