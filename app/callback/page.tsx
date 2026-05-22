"use client";

import { useEffect } from "react";
import { exchangeCode } from "../spotify-auth";

export default function CallbackPage() {
  useEffect(() => {
    // Step 2: arriving on localhost with refresh token in hash — save and go home
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      const rt = decodeURIComponent(hash.slice("#token=".length));
      localStorage.setItem("cb_spotify_refresh", rt);
      window.location.href = "/";
      return;
    }

    // Step 1: arriving on 127.0.0.1 with code from Spotify — exchange and redirect to localhost
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code || !state) {
      window.location.href = "/";
      return;
    }

    exchangeCode(code, state)
      .then((data) => {
        const target = data.localhostUrl ? `${data.localhostUrl}/callback` : "";
        window.location.href = `${target}#token=${encodeURIComponent(data.refreshToken)}`;
      })
      .catch((err) => {
        alert("Spotify login failed: " + err.message);
        window.location.href = "/";
      });
  }, []);

  return (
    <div className="cb__setup">
      <div className="cb__setup-card" style={{ textAlign: "center" }}>
        <p>Connecting to Spotify...</p>
      </div>
    </div>
  );
}
