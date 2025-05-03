import { generateCodeChallenge, generateCodeVerifier } from "./pkce";

export async function startOAuthFlow() {
  const clientId = import.meta.env.VITE_CLIENT_ID;
  const authorizeEndpoint = import.meta.env.VITE_AUTH_URL + "/authorize";
  const redirectUri = "http://localhost:8080/";
  const scope = "email";

  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  sessionStorage.setItem("pkce_code_verifier", codeVerifier);

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "response_type",
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });

  window.location.href = `${authorizeEndpoint}?${params.toString()}`;
}
