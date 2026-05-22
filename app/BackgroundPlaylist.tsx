"use client";

import { useState } from "react";
import type { PlayerState } from "./useSpotifyPlayer";
import { parsePlaylistInput } from "./types";

interface BackgroundPlaylistProps {
  playlistUri: string | null;
  playerState: PlayerState;
  disabled: boolean;
  onPlay: (uri: string) => void;
  onSaveUri: (uri: string) => void;
}

export function BackgroundPlaylist({
  playlistUri,
  playerState,
  disabled,
  onPlay,
  onSaveUri,
}: BackgroundPlaylistProps) {
  const [editInput, setEditInput] = useState("");
  const [showEdit, setShowEdit] = useState(false);

  const isPlayingPlaylist = playerState.isPlaying && playerState.contextUri === playlistUri;

  const handleSave = () => {
    const parsed = parsePlaylistInput(editInput);
    if (parsed) {
      onSaveUri(parsed);
      setShowEdit(false);
      setEditInput("");
    }
  };

  return (
    <div className="cb__bg-playlist">
      <div className="cb__bg-playlist-header">
        <div>
          <div className="cb__bg-playlist-label">Background Playlist</div>
          <div className="cb__bg-playlist-status">
            {!playlistUri ? "Not configured" : isPlayingPlaylist ? "Playing" : "Paused"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            className="cb__bg-playlist-play"
            disabled={disabled || !playlistUri}
            onClick={() => playlistUri && onPlay(playlistUri)}
          >
            {isPlayingPlaylist ? "▶ Playing" : "▶ Resume"}
          </button>
          <button
            className="cb__bg-playlist-play cb__bg-playlist-config-btn"
            onClick={() => setShowEdit(!showEdit)}
          >
            ⚙
          </button>
        </div>
      </div>
      {showEdit && (
        <div className="cb__bg-playlist-config">
          <input
            className="cb__bg-playlist-input"
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
            placeholder={playlistUri || "Spotify playlist URL or URI"}
          />
          <button className="cb__bg-playlist-save" onClick={handleSave}>
            Save
          </button>
        </div>
      )}
    </div>
  );
}
