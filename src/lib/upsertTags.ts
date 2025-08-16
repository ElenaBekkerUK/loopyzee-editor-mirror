// editor-app/src/lib/upsertTags.ts

import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function upsertTags(tags: string[]) {
  const ops = tags.map(async (tag) => {
    const tagId = tag.toLowerCase().trim();

    if (!tagId) return;

    const ref = doc(db, "tags", tagId);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        title: tag,
        createdAt: serverTimestamp(),
        usageCount: 1,
      });
    } else {
      await updateDoc(ref, {
        usageCount: (snap.data().usageCount || 0) + 1,
      });
    }
  });

  await Promise.all(ops);
}
