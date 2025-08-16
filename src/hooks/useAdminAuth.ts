// editor-app/src/hooks/useAdminAuth.ts
import { useEffect, useState } from "react";
import {
  getAuth,
  onIdTokenChanged,
  getIdTokenResult,
  signInWithCustomToken,
} from "firebase/auth";

export function useAdminAuth() {
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        setAuthReady(true);
        return;
      }

      try {
        const token = await getIdTokenResult(user, true);
        console.log("🔐 Token claims:", token.claims); // <--- 👈 лог сюда
        const isAdminClaim = token.claims?.isAdmin === true;
        setIsAdmin(isAdminClaim);
      } catch (error) {
        console.error("Failed to get token claims:", error);
        setIsAdmin(false);
      } finally {
        setAuthReady(true);
      }
    });

    const handleMessage = async (event: MessageEvent) => {
      if (
        event.origin !== "https://www.loopyzee.com" ||
        event.data?.type !== "loopyzee-admin-auth"
      ) return;

      const token = event.data.token;
      if (!token) return;

      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const result = await currentUser.getIdTokenResult();
          if (result?.claims?.isAdmin === true) {
            console.log("⏩ Уже залогинен как админ — пропускаем signInWithCustomToken");
            return;
          }
        } catch (e) {
          console.warn("⚠️ Не удалось проверить токен текущего пользователя", e);
        }
      }

      try {
        await signInWithCustomToken(auth, token);
        await auth.currentUser?.getIdToken(true);
        console.log("✅ Signed in with customToken and refreshed token");
      } catch (err) {
        console.error("❌ Failed to sign in with token:", err);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      unsubscribe();
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return { authReady, isAdmin };
}
