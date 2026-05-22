"use client";

import { useState, useCallback, useRef } from "react";
import { useSpotifyPlayer } from "./useSpotifyPlayer";
import { SpotifyAuth } from "./SpotifyAuth";
import { CueList } from "./CueList";
import { NowPlaying } from "./NowPlaying";
import { BackgroundPlaylist } from "./BackgroundPlaylist";
import * as storage from "./storage";

export function ControlBoard() {
  const [cues, setCues] = useState(() => storage.getAllCues());
  const [bgUri, setBgUri] = useState(() => storage.getBackgroundPlaylistUri());
  const player = useSpotifyPlayer();

  const refreshCues = useCallback(() => {
    setCues(storage.getAllCues());
  }, []);

  const volumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleVolume = useCallback(
    (pct: number) => {
      if (volumeTimerRef.current) clearTimeout(volumeTimerRef.current);
      volumeTimerRef.current = setTimeout(() => player.setVolume(pct), 150);
    },
    [player],
  );

  const activeCue = cues.find((c) => c.id === player.activeCueId) ?? null;

  const handleSaveBgUri = useCallback((uri: string) => {
    storage.setBackgroundPlaylistUri(uri);
    setBgUri(uri);
  }, []);

  return (
    <div className="cb">
      <CueList
        cues={cues}
        activeCueId={player.activeCueId}
        playerState={player.playerState}
        disabled={!player.token}
        onPlay={player.playCue}
        onCuesChange={refreshCues}
      />

      <div className="cb__right">
        <SpotifyAuth
          token={player.token}
          playerState={player.playerState}
          onConnect={player.connect}
          onDisconnect={player.disconnect}
        />

        {player.token && (
          <div className="cb__volume">
            <span className="cb__volume-label">🔊</span>
            <input
              type="range"
              className="cb__volume-slider"
              min={0}
              max={100}
              defaultValue={player.playerState.volumePercent}
              onChange={(e) => handleVolume(Number(e.target.value))}
            />
            <span className="cb__volume-pct">{Math.round(player.playerState.volumePercent)}%</span>
          </div>
        )}

        {player.token && (
          <NowPlaying
            activeCue={activeCue}
            playerState={player.playerState}
            backgroundPlaylistUri={bgUri}
            onStop={player.stop}
            onSkipNext={player.skipNext}
            onSkipPrev={player.skipPrev}
            onRestart={player.restartTrack}
            onPause={player.pause}
            onResume={player.resume}
            onSeek={player.seek}
          />
        )}

        <BackgroundPlaylist
          playlistUri={bgUri}
          playerState={player.playerState}
          disabled={!player.token}
          onPlay={player.playBackgroundPlaylist}
          onSaveUri={handleSaveBgUri}
        />
      </div>
    </div>
  );
}
