// editor-app/src/components/Template/PreviewCanvas.tsx
import { Stage, Layer, Image as KonvaImage, Group } from "react-konva";
import useImage from "use-image";
import { CANVAS_W, CANVAS_H } from "@/constants/editor"; // ✅ берём из констант
import type { PhotoShape } from "@/types/editor";         // ✅ общий тип

type Props = {
  photoShape: PhotoShape;
  samplePhotoUrl: string;
};

export default function PreviewCanvas({ photoShape, samplePhotoUrl }: Props) {
  const [image] = useImage(samplePhotoUrl);
  if (!samplePhotoUrl) return null;

  const size = 160;
  const x = (CANVAS_W - size) / 2;
  const y = (CANVAS_H - size) / 2;

  return (
    <div className="max-w-xs w-full mx-auto text-center bg-gray-50 border border-gray-200 rounded-xl shadow-sm p-4">
      <div className="text-sm text-gray-500 mb-2">Превью маски</div>
      <Stage width={CANVAS_W} height={CANVAS_H}>
        <Layer>
          <Group
            clipFunc={(ctx) => {
              if (photoShape === "circle") {
                ctx.arc(CANVAS_W / 2, CANVAS_H / 2, size / 2, 0, Math.PI * 2);
              } else if (photoShape === "rect") {
                ctx.rect(x, y, size, size);
              } else if (photoShape === "arch") {
                const r = size / 2;
                ctx.moveTo(x, y + size);
                ctx.arc(x + r, y + r, r, Math.PI, 0);
                ctx.lineTo(x + size, y + size);
                ctx.closePath();
              }
            }}
          >
            {image && <KonvaImage image={image} x={x} y={y} width={size} height={size} />}
          </Group>
        </Layer>
      </Stage>
    </div>
  );
}