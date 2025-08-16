// editor-app/src/firebase/uploadToStorage.ts
import { getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuid } from "uuid";

export async function uploadToStorage(
  folder: string, // передаём: `templates/${templateId}/assets`
  file: File
): Promise<{ url: string; raw: Record<string, unknown> }> {
  if (!file) throw new Error("Файл не передан");

  const app = getApp();
  const storage = getStorage(app);

  const extension = (file.name.split(".").pop() || "bin").toLowerCase();
  const filename = `${uuid()}.${extension}`;
  const fullPath = `${folder}/${filename}`;
  const fileRef = ref(storage, fullPath);

  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  // Только для .json пробуем распарсить содержимое
  let raw: Record<string, unknown> = {};
  if (extension === "json") {
    try {
      const rawText = await file.text();
      raw = JSON.parse(rawText);
    } catch {
      // ignore parse errors
    }
  }

  return { url, raw };
}
