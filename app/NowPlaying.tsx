"use client";

import type { PlayerState } from "./useSpotifyPlayer";
import type { Cue } from "./types";
import { formatMs } from "./types";

interface NowPlayingProps {
  activeCue: Cue | null;
  playerState: PlayerState;
  backgroundPlaylistUri: string | null;
  onStop: () => void;
  onSkipNext: () => void;
  onSkipPrev: () => void;
  onRestart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSeek: (positionMs: number) => void;
}

export function NowPlaying({
  activeCue,
  playerState,
  backgroundPlaylistUri,
  onStop,
  onSkipNext,
  onSkipPrev,
  onRestart,
  onPause,
  onResume,
  onSeek,
}: NowPlayingProps) {
  const isBgContext =
    !activeCue && backgroundPlaylistUri != null && playerState.contextUri === backgroundPlaylistUri;

  const isBgPlaying = isBgContext && playerState.isPlaying;
  const isBgPaused = isBgContext && !playerState.isPlaying;

  if (!activeCue && !isBgContext) {
    return (
      <div className="cb__np-idle">
        <div className="cb__np-idle-text">No cue playing</div>
        <div className="cb__np-idle-text" style={{ fontSize: 12 }}>
          Click a cue to start
        </div>
      </div>
    );
  }

  if (isBgContext) {
    const progress =
      playerState.trackDurationMs > 0
        ? Math.min(100, (playerState.progressMs / playerState.trackDurationMs) * 100)
        : 0;

    return (
      <div className="cb__now-playing">
        <div className="cb__np-label">Background Playlist</div>
        {playerState.playlistPosition != null && (
          <div className="cb__np-playlist-pos">
            Track {playerState.playlistPosition}
            {playerState.playlistTotal != null ? ` of ${playerState.playlistTotal}` : ""}
          </div>
        )}

        {playerState.trackName && (
          <>
            <div className="cb__np-name cb__np-name--small">{playerState.trackName}</div>
            {playerState.trackArtist && (
              <div className="cb__np-subtitle">{playerState.trackArtist}</div>
            )}
          </>
        )}

        <div className="cb__np-countdown" style={{ color: isBgPaused ? "#888" : "#4caf50" }}>
          {formatMs(playerState.progressMs)}
        </div>
        <div className="cb__np-remaining">
          of {formatMs(playerState.trackDurationMs)}
          {isBgPaused && " — paused"}
        </div>

        <div
          className="cb__np-progress cb__np-progress--seekable"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            onSeek(Math.round(pct * playerState.trackDurationMs));
          }}
        >
          <div
            className="cb__np-progress-bar"
            style={{
              width: `${progress}%`,
              background: isBgPaused ? "#888" : "#4caf50",
            }}
          />
        </div>
        <div className="cb__np-times">
          <span>{formatMs(playerState.progressMs)}</span>
          <span>{formatMs(playerState.trackDurationMs)}</span>
        </div>

        <div className="cb__transport">
          <button className="cb__transport-btn" onClick={onSkipPrev}>
            ⏮
          </button>
          <button className="cb__transport-btn" onClick={onRestart}>
            ↺
          </button>
          {isBgPlaying ? (
            <button className="cb__transport-btn cb__transport-btn--pause" onClick={onPause}>
              ⏸
            </button>
          ) : (
            <button className="cb__transport-btn cb__transport-btn--play" onClick={onResume}>
              ▶
            </button>
          )}
          <button className="cb__transport-btn" onClick={onSkipNext}>
            ⏭
          </button>
        </div>
      </div>
    );
  }

  const cue = activeCue!;
  const remaining =
    cue.endTimeMs != null ? Math.max(0, cue.endTimeMs - playerState.progressMs) : null;

  const elapsed = playerState.progressMs - cue.startTimeMs;
  const total =
    cue.endTimeMs != null
      ? cue.endTimeMs - cue.startTimeMs
      : playerState.trackDurationMs - cue.startTimeMs;
  const progress = total > 0 ? Math.min(100, (elapsed / total) * 100) : 0;

  return (
    <div className="cb__now-playing">
      <div className="cb__np-label">Now Playing</div>
      <div className="cb__np-name">{cue.label}</div>
      {cue.subtitle && <div className="cb__np-subtitle">{cue.subtitle}</div>}

      {playerState.trackName && (
        <div className="cb__np-track">
          <div className="cb__np-track-name">{playerState.trackName}</div>
          {playerState.trackArtist && (
            <div className="cb__np-track-artist">{playerState.trackArtist}</div>
          )}
        </div>
      )}

      <div className={`cb__np-countdown ${remaining == null ? "cb__np-countdown--idle" : ""}`}>
        {remaining != null
          ? formatMs(remaining)
          : formatMs(Math.max(0, playerState.trackDurationMs - playerState.progressMs))}
      </div>
      <div className="cb__np-remaining">{remaining != null ? "remaining" : "track remaining"}</div>

      <div className="cb__np-progress">
        <div className="cb__np-progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <div className="cb__np-times">
        <span>{formatMs(playerState.progressMs)}</span>
        <span>
          {cue.endTimeMs != null ? formatMs(cue.endTimeMs) : formatMs(playerState.trackDurationMs)}
        </span>
      </div>

      <button className="cb__stop-btn" onClick={onStop}>
        ⏹ Stop
      </button>
    </div>
  );
}
