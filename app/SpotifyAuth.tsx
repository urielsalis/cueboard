"use client";

import { useState } from "react";
import type { PlayerState } from "./useSpotifyPlayer";
import { getClientId } from "./storage";
import { startPkceLogin } from "./spotify-auth";
import { SetupInstructions } from "./SetupInstructions";

interface SpotifyAuthProps {
  token: string | null;
  playerState: PlayerState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function SpotifyAuth({ token, playerState, onConnect, onDisconnect }: SpotifyAuthProps) {
  const [showHelp, setShowHelp] = useState(false);

  const handleLogin = () => {
    const clientId = getClientId();
    if (!clientId) return;
    startPkceLogin(clientId);
  };

  if (!token) {
    return (
      <>
        <div className="cb__status-bar">
          <div className="cb__status-info">
            <div className="cb__status-dot cb__status-dot--off" />
            <span>Not connected</span>
          </div>
        </div>
        <div className="cb__login">
          <div className="cb__login-icon">🎵</div>
          <div className="cb__login-title">Connect Spotify</div>
          <div className="cb__login-desc">Log in to control playback on your device</div>
          <button className="cb__login-btn" onClick={onConnect}>
            Try Connect
          </button>
          <button className="cb__login-btn" style={{ marginTop: 8 }} onClick={handleLogin}>
            Log in with Spotify
          </button>
          <button className="cb__help-toggle" onClick={() => setShowHelp(!showHelp)}>
            {showHelp ? "Hide setup help" : "Setup help"}
          </button>
        </div>
        {showHelp && (
          <div className="cb__help-dialog">
            <SetupInstructions />
          </div>
        )}
      </>
    );
  }

  return (
    <div className="cb__status-bar">
      <div className="cb__status-info">
        <div
          className={`cb__status-dot ${playerState.connected ? "cb__status-dot--on" : "cb__status-dot--off"}`}
        />
        <span className="cb__status-device">
          {playerState.connected
            ? `${playerState.userName ?? "Connected"}${playerState.deviceName ? ` — ${playerState.deviceName}` : ""}`
            : "No active device"}
        </span>
      </div>
      <button className="cb__logout-btn" onClick={onDisconnect}>
        Disconnect
      </button>
    </div>
  );
}
