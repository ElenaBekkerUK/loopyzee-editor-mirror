//editor-app/src/api/useSession.ts

import { useQuery } from "@tanstack/react-query";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "../firebase"; // твой инициализированный auth

export function useSession() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const res = await fetch("https://loopyzee.com/api/me", {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Session not found");

      const data = await res.json();

      // Авторизация в Firebase
      await signInWithCustomToken(auth, data.firebaseToken);

      return data; // { uid, email, isAdmin, firebaseToken }
    },
    staleTime: 1000 * 60 * 5, // 5 минут
  });
}
