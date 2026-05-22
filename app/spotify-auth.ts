const SCOPES = [
  "user-read-playback-state",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "playlist-read-private",
  "playlist-read-collaborative",
].join(" ");

function getRedirectUri(): string {
  if (window.location.hostname === "localhost") {
    return `http://127.0.0.1:${window.location.port}/callback`;
  }
  const { origin, pathname } = window.location;
  const base = pathname.replace(/\/+$/, "");
  return origin + base + "/callback";
}

function generateRandomString(length: number): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values, (v) => chars[v % chars.length]).join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(plain));
}

function base64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function startPkceLogin(clientId: string) {
  const verifier = generateRandomString(64);
  const challenge = base64url(await sha256(verifier));
  const redirectUri = getRedirectUri();

  const state = btoa(JSON.stringify({ verifier, clientId, redirectUri }));

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: SCOPES,
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCode(
  code: string,
  stateParam: string,
): Promise<{ refreshToken: string; localhostUrl: string | null }> {
  const { verifier, clientId, redirectUri } = JSON.parse(atob(stateParam));

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  const data = await res.json();
  if (!res.ok)
    throw new Error(`Token exchange failed: ${data.error_description || data.error || res.status}`);

  const localhostUrl =
    window.location.hostname === "127.0.0.1" ? `http://localhost:${window.location.port}` : null;

  return { refreshToken: data.refresh_token, localhostUrl };
}

export async function refreshAccessToken(
  clientId: string,
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const data = await res.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || refreshToken,
    expiresIn: data.expires_in,
  };
}
