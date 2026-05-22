"use client";

import { useState } from "react";
import { setClientId as saveClientId } from "./storage";
import { SetupInstructions } from "./SetupInstructions";

interface SetupProps {
  onComplete: () => void;
}

export function Setup({ onComplete }: SetupProps) {
  const [clientId, setClientId] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = clientId.trim();
    if (!trimmed) return;
    saveClientId(trimmed);
    onComplete();
  };

  return (
    <div className="cb__setup">
      <div className="cb__setup-card">
        <h1 className="cb__setup-title">Control Board</h1>
        <p className="cb__setup-desc">
          A Spotify-powered cue board for live events. To get started, you need a Spotify Developer
          App.
        </p>

        <SetupInstructions />

        <form onSubmit={handleSave} className="cb__setup-form">
          <label className="cb__setup-label">Spotify Client ID</label>
          <input
            className="cb__setup-input"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
            required
            pattern="[a-zA-Z0-9]{32}"
            title="Client ID should be a 32-character alphanumeric string"
          />
          <button type="submit" className="cb__setup-btn" disabled={!clientId.trim()}>
            Save &amp; Continue
          </button>
        </form>
      </div>
    </div>
  );
}
