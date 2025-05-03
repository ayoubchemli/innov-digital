import { useEffect, useState } from "react";
import { handleOAuthCallback } from "@/utils/handleCallback";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      if (window.location.pathname === "/") {
        try {
          const data = await handleOAuthCallback();
          setToken(data.access_token);
        } catch (error) {
          console.error("Error handling OAuth callback:", error);
        }
      }
    }
    fetchToken();
  }, []);

  return { token };
}
