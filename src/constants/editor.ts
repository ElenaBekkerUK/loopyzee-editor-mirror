// src/constants/editor.ts

// 📐 Базовый канвас для вертикального 5×7 (в превью-единицах)
export const BASE_CANVAS = { width: 420, height: 588, version: 1 }; // 5×7 строго

// Размеры для Stage в редакторе
export const CANVAS_W = BASE_CANVAS.width;
export const CANVAS_H = BASE_CANVAS.height;

// 📦 Контент-бокс для текста (оставляем ~76% ширины, чтобы был отступ)
export const BOX_WIDTH = Math.round(CANVAS_W * 0.76);
export const BOX_PAD = 8;

// 🎨 Палитра по умолчанию
export const pastelColors = [
  "#48435c",
  "#333333",
  "#6c6c81",
];

// 🎨 Шрифты по умолчанию
export const fonts = [
  "Affection",
  "Willowshine",
  "Montserrat",
  "Caveat",
  "Playfair Display",
  "Cormorant Garamond",
];

// 📐 Для полноразмерного экспорта (1500×2100) и масштабирования превью
export const BASE_CANVAS_PX = { width: 1500, height: 2100 };
export const PREVIEW_SCALE = CANVAS_W / BASE_CANVAS_PX.width;

// Получение размеров для обрезки по контейнеру
export function getCoverSize(
  imgWidth: number,
  imgHeight: number,
  containerWidth: number,
  containerHeight: number
) {
  const scale = Math.max(containerWidth / imgWidth, containerHeight / imgHeight);
  const width = imgWidth * scale;
  const height = imgHeight * scale;
  const x = (containerWidth - width) / 2;
  const y = (containerHeight - height) / 2;
  return { width, height, x, y };
}

// Конвертация жирности/курсива в fontStyle для Konva
export function getKonvaFontStyle(
  weight: "normal" | "bold",
  style: "normal" | "italic"
): "normal" | "bold" | "italic" | "bold italic" {
  if (weight === "bold" && style === "italic") return "bold italic";
  if (weight === "bold") return "bold";
  if (style === "italic") return "italic";
  return "normal";
}
