// editor-app/src/hooks/useInvitationUploader.ts

import { useCallback } from "react";
import { db, storage, auth } from "../firebase";
import {
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import type { Field, AnimationLayer, LottieAnimationLayer } from "../types/editor";

export function useInvitationUploader(
  fields: Field[],
  backgroundUrl: string,
  backgroundFile: File | null,
  setBackgroundFile: (f: File | null) => void,
  title: string,
  animationLayers: AnimationLayer[],
  invitationId?: string
) {
  const handleCreateOrUpdateInvitation = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      alert("❌ Только авторизованные пользователи могут сохранять приглашения.");
      return;
    }

    let finalBgUrl = backgroundUrl;

    if (backgroundFile) {
      const [base, ext] = [
        backgroundFile.name.split(".").slice(0, -1).join("."),
        backgroundFile.name.split(".").pop(),
      ];
      const fileName = `${base}-${Date.now()}.${ext}`;
      const storageRef = ref(storage, `user-backgrounds/${user.uid}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, backgroundFile);
      finalBgUrl = await getDownloadURL(snapshot.ref);
    }

    const cleanedLayers = animationLayers.map((layer) => {
  if (layer.type === "lottie" && "lottieData" in layer) {
    const copy = { ...layer } as Partial<LottieAnimationLayer>;
    delete copy.lottieData;
    return copy;
  }
  return layer;
});


    const finalId = invitationId ?? uuidv4();
    const isUpdate = Boolean(invitationId);

    const invitationData = {
      title: title.trim() || "Untitled",
      fields,
      backgroundUrl: finalBgUrl || null,
      animationLayers: cleanedLayers,
      ...(isUpdate ? {} : { createdAt: serverTimestamp() }),
      userId: user.uid,
    };

    const userRef = doc(db, `users/${user.uid}/invitations`, finalId);
    const publicRef = doc(db, "user_invitations", finalId);

    try {
      await Promise.all([
        isUpdate ? updateDoc(userRef, invitationData) : setDoc(userRef, invitationData),
        setDoc(publicRef, {
          userId: user.uid,
          title: invitationData.title,
          createdAt: serverTimestamp(),
        }),
      ]);

      setBackgroundFile(null);
      alert(isUpdate ? "✅ Приглашение обновлено!" : "✅ Приглашение успешно сохранено!");
      return finalId;
    } catch (err) {
      console.error("🔥 Ошибка при сохранении приглашения:", err);
      alert("❌ Не удалось сохранить. См. консоль.");
    }
  }, [fields, backgroundUrl, backgroundFile, setBackgroundFile, title, animationLayers, invitationId]);

  return { handleCreateOrUpdateInvitation };
}
