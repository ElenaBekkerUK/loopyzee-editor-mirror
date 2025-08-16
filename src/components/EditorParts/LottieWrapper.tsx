// editor-app/src/components/EditorParts/LottieWrapper.tsx

import { Html } from "react-konva-utils";
import { Rnd } from "react-rnd";
import Lottie from "lottie-react";
import type { LottieAnimationLayer } from "@/types/editor";

type LottieWrapperProps = {
  layer: LottieAnimationLayer;
  mode: "admin" | "user";
  onDragLottie?: (
    id: string,
    x: number,
    y: number,
    width?: number,
    height?: number
  ) => void;
};

export function LottieWrapper({ layer, mode, onDragLottie }: LottieWrapperProps) {
  return (
    <Html key={`lottie-${layer.id}`}>
      <Rnd
        position={{ x: layer.x, y: layer.y }}
        size={{ width: layer.width, height: layer.height }}
        onDragStop={(e, d) => {
          onDragLottie?.(layer.id, d.x, d.y);
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const newWidth = parseInt(ref.style.width, 10);
          const newHeight = parseInt(ref.style.height, 10);
          onDragLottie?.(layer.id, position.x, position.y, newWidth, newHeight);
        }}
        disableDragging={mode !== "admin"}
        enableResizing={mode === "admin"}
        style={{
          zIndex: layer.zIndex,
          pointerEvents: mode === "admin" ? "auto" : "none",
          cursor: mode === "admin" ? "move" : "default",
          border: mode === "admin" ? "1px dashed red" : "none",
          position: "absolute",
        }}
      >
        <Lottie
          animationData={layer.lottieData}
          loop
          autoplay
          style={{ width: "100%", height: "100%" }}
        />
      </Rnd>
    </Html>
  );
}
