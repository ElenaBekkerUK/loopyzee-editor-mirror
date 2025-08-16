// editor-app/src/lib/backgroundApi.ts
import { getDownloadURL, listAll, ref, uploadBytes } from "firebase/storage";
import { storage } from "@/firebase";

const dir = "animation-backgrounds";

export async function listAnimationBackgrounds(): Promise<string[]> {
  const folderRef = ref(storage, dir);
  const result = await listAll(folderRef);
  return Promise.all(result.items.map((item) => getDownloadURL(item)));
}

export async function uploadAnimationBackground(file: File): Promise<string> {
  const id = `${Date.now()}-${file.name}`;
  const fileRef = ref(storage, `${dir}/${id}`);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
