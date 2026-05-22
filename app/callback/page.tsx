"use client";

import { useEffect } from "react";
import { exchangeCode } from "../spotify-auth";

function getBasePath(): string {
  const path = window.location.pathname;
  const callbackIdx = path.indexOf("/callback");
  return callbackIdx > 0 ? path.slice(0, callbackIdx) : "";
}

export default function CallbackPage() {
  useEffect(() => {
    const basePath = getBasePath();
    const home = basePath + "/";

    // Step 2: arriving on localhost with refresh token in hash — save and go home
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      const rt = decodeURIComponent(hash.slice("#token=".length));
      localStorage.setItem("cb_spotify_refresh", rt);
      window.location.href = home;
      return;
    }

    // Step 1: arriving on 127.0.0.1 with code from Spotify — exchange and redirect to localhost
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code || !state) {
      window.location.href = home;
      return;
    }

    exchangeCode(code, state)
      .then((data) => {
        if (data.localhostUrl) {
          // Dev only: hand off token from 127.0.0.1 to localhost via hash
          window.location.href = `${data.localhostUrl}/callback#token=${encodeURIComponent(data.refreshToken)}`;
        } else {
          // Production: save token directly and go home
          localStorage.setItem("cb_spotify_refresh", data.refreshToken);
          window.location.href = home;
        }
      })
      .catch((err) => {
        alert("Spotify login failed: " + err.message);
        window.location.href = home;
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
