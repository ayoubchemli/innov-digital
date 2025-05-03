export async function handleOAuthCallback() {
  const code = new URLSearchParams(window.location.search).get("code");
  const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
  const redirectUri = "http://localhost:8080/";
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const tokenEndpoint = import.meta.env.VITE_AUTH_URL + "/oauth/token";

  if (!code || !codeVerifier) throw new Error("Missing code or verifier");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    code_verifier: codeVerifier,
  });

  const res = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) throw new Error("Token exchange failed");

  return res.json();
}
