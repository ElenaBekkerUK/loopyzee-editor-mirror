// editor-app/src/components/EditorParts/LottieLayer.tsx
"use client";

import { Html } from "react-konva-utils";
import { Group, Transformer } from "react-konva";
import Konva from "konva";
import { useRef, useEffect } from "react";
import Lottie from "lottie-react";
import type { LottieAnimationLayer } from "../../types/editor";

type Props = {
  layer: LottieAnimationLayer;
  isSelected: boolean;
  onSelect: () => void;
  onChange: (attrs: Partial<LottieAnimationLayer>) => void;
};

export default function LottieLayer({ layer, isSelected, onSelect, onChange }: Props) {
  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && groupRef.current) {
      trRef.current.nodes([groupRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  if (!layer.lottieData) return null;

  return (
    <>
      <Group
        ref={groupRef}
        x={layer.x}
        y={layer.y}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) =>
          onChange({ x: e.target.x(), y: e.target.y() })
        }
        onTransformEnd={() => {
          const node = groupRef.current!;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          node.scaleX(1);
          node.scaleY(1);

          onChange({
            x: node.x(),
            y: node.y(),
            width: Math.max(10, layer.width * scaleX),
            height: Math.max(10, layer.height * scaleY),
          });
        }}
      >
        <Html>
          <div
            style={{
              width: layer.width,
              height: layer.height,
              pointerEvents: "none",
            }}
          >
            <Lottie
              animationData={layer.lottieData}
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </Html>
      </Group>

      {isSelected && <Transformer ref={trRef} />}
    </>
  );
}
