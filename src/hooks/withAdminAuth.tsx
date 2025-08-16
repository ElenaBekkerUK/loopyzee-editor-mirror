// editor-app/src/hooks/withAdminAuth.tsx
import { ComponentType, JSX } from "react";
import { useAdminAuth } from "./useAdminAuth";

export function withAdminAuth<P extends JSX.IntrinsicAttributes>(
  WrappedComponent: ComponentType<P>,
  mode: string
): ComponentType<P> {
  return function AdminProtectedComponent(props: P) {
    const { authReady, isAdmin } = useAdminAuth();

    if (!authReady) {
      return (
        <p style={{ textAlign: "center", marginTop: 64 }}>
          🔐 Checking admin auth…
        </p>
      );
    }

    if (mode === "admin" && !isAdmin) {
      return (
        <p style={{ textAlign: "center", marginTop: 64, color: "#e11d48" }}>
          ❌ Access denied: not an admin
        </p>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
