// editor-app/src/components/EditorParts/CanvasStage.tsx
"use client";

import React, {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Rect,
  Group,
  Transformer,
  Path,
} from "react-konva";
import useImage from "use-image";
import type { Field, AnimationLayer, PhotoLayer } from "../../types/editor";
import type Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import LottieLayer from "./LottieLayer"; // ⬅️ используем Конва-слой с Transformer
import { CANVAS_W, CANVAS_H, BOX_WIDTH } from "@/constants/editor";

/** ===== API для parent через ref ===== */
export type CanvasStageHandle = {
  /** Вернёт PNG превью текущего холста */
  toPNGBlob: (pixelRatio?: number) => Promise<Blob>;
};

type Props = {
  backgroundUrl: string;
  fields: Field[];
  activeFieldId?: string;
  onSelect: (id: string) => void;
  onDrag: (id: string, newY: number) => void;

  /** НОВОЕ: патчи для Lottie-слоёв (x,y,width,height,rotation,...) */
  onChangeLottie?: (id: string, patch: Partial<AnimationLayer>) => void;

  /** СТАРОЕ API (оставлено для обратной совместимости) */
  onDragLottie?: (
    id: string,
    newX: number,
    newY: number,
    newWidth?: number,
    newHeight?: number
  ) => void;

  mode: "admin" | "user";
  animationLayers?: AnimationLayer[];

  /** Фото-слой */
  photoLayer?: PhotoLayer;
  setPhotoLayer?: (next: PhotoLayer) => void; // без null
};

const CanvasStage = forwardRef<CanvasStageHandle, Props>(function CanvasStage(
  {
    backgroundUrl,
    fields,
    activeFieldId,
    onSelect,
    onDrag,
    onChangeLottie,
    onDragLottie,
    mode,
    animationLayers = [],
    photoLayer,
    setPhotoLayer,
  },
  ref
) {
  const [bgImage] = useImage(backgroundUrl || "");
  const [sampleImage] = useImage(photoLayer?.samplePhotoUrl || "");

  // ref на сам Stage, чтобы уметь делать toDataURL
  const stageRef = useRef<Konva.Stage | null>(null);

  /** ------ imperative API для родителя ------ */
  useImperativeHandle(ref, () => ({
    async toPNGBlob(pixelRatio = 2) {
      if (!stageRef.current) throw new Error("Stage is not ready");
      const dataUrl = stageRef.current.toDataURL({ pixelRatio });
      const r = await fetch(dataUrl);
      return await r.blob();
    },
  }));

  /** ===== LOTTIE selection (для Transformer) ===== */
  const [activeLottieId, setActiveLottieId] = useState<string | null>(null);

  /** ===== Photo-mask selection/transform ===== */
  const [photoSelected, setPhotoSelected] = useState(false);
  const photoGroupRef = useRef<Konva.Group>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // attach/detach transformer к фото-маске
  useEffect(() => {
    if (!transformerRef.current) return;
    if (photoSelected && photoGroupRef.current) {
      transformerRef.current.nodes([photoGroupRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    } else {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [photoSelected]);

  const handlePhotoDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (!setPhotoLayer || !photoLayer) return;
    const node = e.target;
    setPhotoLayer({
      ...photoLayer,
      x: node.x(),
      y: node.y(),
    });
  };

  const handlePhotoTransformEnd = () => {
    if (!setPhotoLayer || !photoLayer || !photoGroupRef.current) return;
    const node = photoGroupRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    const newWidth = Math.max(20, photoLayer.width * scaleX);
    const newHeight = Math.max(20, photoLayer.height * scaleY);

    setPhotoLayer({
      ...photoLayer,
      x: node.x(),
      y: node.y(),
      width: newWidth,
      height: newHeight,
      rotation: node.rotation() || 0,
    });

    node.scaleX(1);
    node.scaleY(1);
  };

  // clip function for mask shapes
  const clipFunc = useMemo(() => {
    if (!photoLayer) return undefined;

    if (photoLayer.photoShape === "circle") {
      return (ctx: Konva.Context) => {
        const r = Math.min(photoLayer.width, photoLayer.height) / 2;
        ctx.beginPath();
        ctx.arc(photoLayer.width / 2, photoLayer.height / 2, r, 0, Math.PI * 2, false);
        ctx.closePath();
      };
    }

    if (photoLayer.photoShape === "rect") {
      return (ctx: Konva.Context) => {
        const radius = 12; // мягкие углы
        const w = photoLayer.width;
        const h = photoLayer.height;
        const r = Math.min(radius, w / 2, h / 2);
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.arcTo(w, 0, w, h, r);
        ctx.arcTo(w, h, 0, h, r);
        ctx.arcTo(0, h, 0, 0, r);
        ctx.arcTo(0, 0, w, 0, r);
        ctx.closePath();
      };
    }

    // "arch": прямоугольник с полукругом сверху
    if (photoLayer.photoShape === "arch") {
      return (ctx: Konva.Context) => {
        const w = photoLayer.width;
        const h = photoLayer.height;
        const r = w / 2; // радиус арки = половина ширины
        const archHeight = Math.min(r, h * 0.6); // ограничим высоту арки

        ctx.beginPath();
        // верхняя арка
        ctx.arc(w / 2, archHeight, r, Math.PI, 0, false);
        // боковые и низ
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
      };
    }

    return undefined;
  }, [photoLayer]);

  const photoFrameStroke = "#B7A9FF";

  return (
    <Stage ref={stageRef} width={CANVAS_W} height={CANVAS_H}>
      <Layer>
        {/* background */}
        {bgImage && (
          <KonvaImage image={bgImage} x={0} y={0} width={CANVAS_W} height={CANVAS_H} />
        )}

        {/* ===== LOTTIE через Konva слой + Transformer ===== */}
        {animationLayers.map((layer) =>
          layer.type === "lottie" ? (
            <LottieLayer
              key={layer.id}
              layer={{
                ...layer,
                x: layer.x ?? 80,
                y: layer.y ?? 80,
                width: layer.width ?? 320,
                height: layer.height ?? 320,
                rotation: layer.rotation ?? 0,
              }}
              isSelected={mode === "admin" && activeLottieId === layer.id}
              onSelect={() => setActiveLottieId(layer.id)}
              onChange={(patch) => {
                if (onChangeLottie) {
                  onChangeLottie(layer.id, patch);
                } else if (onDragLottie) {
                  // fallback в старый API только для позиций/размеров
                  const nx = patch.x ?? layer.x ?? 0;
                  const ny = patch.y ?? layer.y ?? 0;
                  const nw = patch.width ?? layer.width;
                  const nh = patch.height ?? layer.height;
                  onDragLottie(layer.id, nx, ny, nw, nh);
                }
              }}
            />
          ) : null
        )}

        {/* ===== Photo mask ===== */}
        {photoLayer?.hasPhoto && (
          <>
            <Group
              ref={photoGroupRef}
              x={photoLayer.x}
              y={photoLayer.y}
              width={photoLayer.width}
              height={photoLayer.height}
              rotation={photoLayer.rotation || 0}
              draggable={mode === "admin"}
              onDragMove={handlePhotoDragMove}
              onClick={() => mode === "admin" && setPhotoSelected(true)}
              onTap={() => mode === "admin" && setPhotoSelected(true)}
              onTransformEnd={handlePhotoTransformEnd}
              onMouseEnter={(e) => {
                const container = e.target.getStage()?.container();
                if (container && mode === "admin") container.style.cursor = "move";
              }}
              onMouseLeave={(e) => {
                const container = e.target.getStage()?.container();
                if (container) container.style.cursor = "default";
              }}
              clipFunc={clipFunc}
            >
              {sampleImage ? (
                <KonvaImage
                  image={sampleImage}
                  x={0}
                  y={0}
                  width={photoLayer.width}
                  height={photoLayer.height}
                />
              ) : (
                <Rect x={0} y={0} width={photoLayer.width} height={photoLayer.height} fill={"#00000010"} />
              )}
            </Group>

            {/* рамка/обводка поверх клипа (для визуального контроля) */}
            <Group
              x={photoLayer.x}
              y={photoLayer.y}
              width={photoLayer.width}
              height={photoLayer.height}
              rotation={photoLayer.rotation || 0}
              listening={false}
            >
              {photoLayer.photoShape === "rect" ? (
                <Rect
                  x={0}
                  y={0}
                  width={photoLayer.width}
                  height={photoLayer.height}
                  stroke={photoFrameStroke}
                  strokeWidth={1.5}
                  dash={[4, 2]}
                  cornerRadius={12}
                />
              ) : photoLayer.photoShape === "circle" ? (
                <Path data={circlePath(photoLayer.width, photoLayer.height)} stroke={photoFrameStroke} strokeWidth={1.5} dash={[4, 2]} />
              ) : (
                <Path data={archPath(photoLayer.width, photoLayer.height)} stroke={photoFrameStroke} strokeWidth={1.5} dash={[4, 2]} />
              )}
            </Group>

            {mode === "admin" && (
              <Transformer
                ref={transformerRef}
                rotateEnabled
                enabledAnchors={[
                  "top-left",
                  "top-right",
                  "bottom-left",
                  "bottom-right",
                  "top-center",
                  "bottom-center",
                  "middle-left",
                  "middle-right",
                ]}
                boundBoxFunc={(oldBox, newBox) => {
                  const min = 32;
                  if (newBox.width < min || newBox.height < min) return oldBox;
                  return newBox;
                }}
              />
            )}
          </>
        )}

        {/* ===== Text fields ===== */}
        {fields.map((f) => {
          const x = (CANVAS_W - BOX_WIDTH) / 2;
          const lines = Math.max(1, (f.text?.split("\n").length ?? 1));
          const lh = f.lineHeight ?? 1;
          const highlightHeight = lines * f.size * lh + 8;

          return (
            <Fragment key={f.id}>
              <Text
                x={x}
                y={f.y}
                width={BOX_WIDTH}
                text={f.text}
                fontSize={f.size}
                fontFamily={f.font}
                fill={f.color}
                align={f.align}
                fontStyle={f.style ?? "normal"}
                fontWeight={f.weight ?? "normal"}
                letterSpacing={f.letterSpacing ?? 0}
                lineHeight={lh}
                draggable={mode === "admin"}
                onDragEnd={(e: KonvaEventObject<DragEvent>) => {
                  onDrag(f.id, e.target.y());
                }}
                onClick={() => {
                  onSelect(f.id);
                  setActiveLottieId(null); // снять выделение с lottie
                }}
                onTap={() => {
                  onSelect(f.id);
                  setActiveLottieId(null);
                }}
                onMouseEnter={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = mode === "admin" ? "move" : "default";
                }}
                onMouseLeave={(e) => {
                  const container = e.target.getStage()?.container();
                  if (container) container.style.cursor = "default";
                }}
              />
              {f.id === activeFieldId && (
                <Rect
                  x={x - 4}
                  y={f.y - 4}
                  width={BOX_WIDTH + 8}
                  height={highlightHeight}
                  stroke="#B7A9FF"
                  strokeWidth={1.5}
                  dash={[4, 2]}
                  cornerRadius={4}
                />
              )}
            </Fragment>
          );
        })}
      </Layer>
    </Stage>
  );
});

export default CanvasStage;

// helpers to draw outline paths (for frame stroke)
function circlePath(w: number, h: number) {
  const r = Math.min(w, h) / 2;
  const cx = w / 2;
  const cy = h / 2;
  return `
    M ${cx - r}, ${cy}
    a ${r},${r} 0 1,0 ${2 * r},0
    a ${r},${r} 0 1,0 ${-2 * r},0
  `;
}

function archPath(w: number, h: number) {
  const r = w / 2;
  const archH = Math.min(r, h * 0.6);
  return `
    M 0 ${h}
    L 0 ${archH}
    A ${r} ${r} 0 0 1 ${w} ${archH}
    L ${w} ${h}
    Z
  `;
}