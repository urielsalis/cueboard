"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getClientId } from "./storage";
import { refreshAccessToken } from "./spotify-auth";

import type { Cue } from "./types";

const REFRESH_KEY = "cb_spotify_refresh";

interface SpotifyPlaybackState {
  is_playing: boolean;
  progress_ms: number;
  item: {
    name: string;
    artists: { name: string }[];
    duration_ms: number;
    uri?: string;
  } | null;
  device: { id: string; name: string; is_active: boolean; volume_percent: number };
  context: { uri: string } | null;
}

export interface PlayerState {
  connected: boolean;
  deviceName: string | null;
  userName: string | null;
  isPlaying: boolean;
  progressMs: number;
  trackName: string | null;
  trackArtist: string | null;
  trackDurationMs: number;
  contextUri: string | null;
  playlistPosition: number | null;
  playlistTotal: number | null;
  volumePercent: number;
}

const INITIAL_PLAYER_STATE: PlayerState = {
  connected: false,
  deviceName: null,
  userName: null,
  isPlaying: false,
  progressMs: 0,
  trackName: null,
  trackArtist: null,
  trackDurationMs: 0,
  contextUri: null,
  playlistPosition: null,
  playlistTotal: null,
  volumePercent: 50,
};

export function useSpotifyPlayer() {
  const [token, setToken] = useState<string | null>(null);
  const [playerState, setPlayerState] = useState<PlayerState>(INITIAL_PLAYER_STATE);
  const [activeCueId, setActiveCueId] = useState<number | null>(null);

  const tokenRef = useRef<string | null>(null);
  const tokenExpiryRef = useRef(0);
  const deviceIdRef = useRef<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fetchingRef = useRef(false);

  const fetchToken = useCallback(async (): Promise<string | null> => {
    if (fetchingRef.current) return tokenRef.current;
    fetchingRef.current = true;

    const clientId = getClientId();
    const rt = localStorage.getItem(REFRESH_KEY);
    if (!clientId || !rt) {
      fetchingRef.current = false;
      return null;
    }

    try {
      const data = await refreshAccessToken(clientId, rt);
      tokenRef.current = data.accessToken;
      tokenExpiryRef.current = Date.now() + (data.expiresIn - 300) * 1000;
      setToken(data.accessToken);
      localStorage.setItem(REFRESH_KEY, data.refreshToken);

      const meRes = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });
      if (meRes.ok) {
        const me = await meRes.json();
        setPlayerState((prev) => ({ ...prev, userName: me.display_name ?? me.id }));
      }
      fetchingRef.current = false;
      return data.accessToken;
    } catch {
      fetchingRef.current = false;
      return null;
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem(REFRESH_KEY)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- setState is async (after API response), not synchronous
      fetchToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchToken is stable (useCallback with [])
  }, []);

  const getToken = useCallback(async (): Promise<string | null> => {
    if (tokenRef.current && Date.now() < tokenExpiryRef.current) return tokenRef.current;
    return fetchToken();
  }, [fetchToken]);

  const spotifyApi = useCallback(
    async <T = Record<string, unknown>>(
      path: string,
      opts: RequestInit = {},
    ): Promise<T | null> => {
      const t = await getToken();
      if (!t) return null;
      const res = await fetch(`https://api.spotify.com/v1${path}`, {
        ...opts,
        headers: { Authorization: `Bearer ${t}`, ...opts.headers },
      });
      if (res.status === 204) return {} as T;
      if (res.status === 404 && opts.method && opts.method !== "GET") {
        alert(
          "No active Spotify device found. Open Spotify on your computer or phone and play something briefly, then try again.",
        );
        return null;
      }
      if (!res.ok) return null;
      return res.json();
    },
    [getToken],
  );

  function deviceQuery(): string {
    return deviceIdRef.current ? `?device_id=${deviceIdRef.current}` : "";
  }

  const lastTrackUriRef = useRef<string | null>(null);
  const playlistPositionRef = useRef<number | null>(null);
  const playlistTotalRef = useRef<number | null>(null);

  const pollState = useCallback(async () => {
    const data = await spotifyApi<SpotifyPlaybackState>("/me/player");
    if (!data) {
      setPlayerState((prev) => ({ ...prev, connected: false, deviceName: null }));
      return;
    }
    if (data.device?.id) deviceIdRef.current = data.device.id;

    const currentUri = data.item?.uri ?? null;
    if (currentUri && currentUri !== lastTrackUriRef.current && data.context?.uri) {
      lastTrackUriRef.current = currentUri;
      const playlistMatch = data.context.uri.match(/playlist:([A-Za-z0-9]+)/);
      if (playlistMatch) {
        const trackId = currentUri.replace("spotify:track:", "");
        const plRes = await spotifyApi<{ items: { track: { id: string } }[] }>(
          `/playlists/${playlistMatch[1]}/tracks?fields=items(track(id))&limit=50`,
        );
        if (plRes?.items) {
          const idx = plRes.items.findIndex((it) => it.track?.id === trackId);
          playlistPositionRef.current = idx >= 0 ? idx + 1 : null;
          playlistTotalRef.current = plRes.items.length;
        }
      }
    }

    setPlayerState((prev) => ({
      ...prev,
      connected: true,
      deviceName: data.device?.name ?? null,
      isPlaying: data.is_playing,
      progressMs: data.progress_ms ?? 0,
      trackName: data.item?.name ?? null,
      trackArtist: data.item?.artists?.map((a) => a.name).join(", ") ?? null,
      trackDurationMs: data.item?.duration_ms ?? 0,
      contextUri: data.context?.uri ?? null,
      playlistPosition: playlistPositionRef.current,
      playlistTotal: playlistTotalRef.current,
      volumePercent: data.device?.volume_percent ?? prev.volumePercent,
    }));
  }, [spotifyApi]);

  useEffect(() => {
    if (!token) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- setState is async (after API response), not synchronous
    pollState();
    pollingRef.current = setInterval(pollState, 1000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [token, pollState]);

  const playCue = useCallback(
    async (cue: Pick<Cue, "id" | "spotifyTrackId" | "startTimeMs">) => {
      if (!cue.spotifyTrackId) return;
      await spotifyApi(`/me/player/play${deviceQuery()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uris: [`spotify:track:${cue.spotifyTrackId}`],
          position_ms: cue.startTimeMs,
        }),
      });
      setActiveCueId(cue.id);
    },
    [spotifyApi],
  );

  const stop = useCallback(async () => {
    await spotifyApi("/me/player/pause", { method: "PUT" });
    setActiveCueId(null);
  }, [spotifyApi]);

  const pause = useCallback(async () => {
    await spotifyApi("/me/player/pause", { method: "PUT" });
  }, [spotifyApi]);

  const resume = useCallback(async () => {
    await spotifyApi(`/me/player/play${deviceQuery()}`, { method: "PUT" });
  }, [spotifyApi]);

  const playBackgroundPlaylist = useCallback(
    async (playlistUri: string) => {
      spotifyApi("/me/player/repeat?state=context", { method: "PUT" }).catch(() => {});
      await spotifyApi(`/me/player/play${deviceQuery()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ context_uri: playlistUri }),
      });
      setActiveCueId(null);
    },
    [spotifyApi],
  );

  const skipNext = useCallback(async () => {
    await spotifyApi("/me/player/next", { method: "POST" });
  }, [spotifyApi]);

  const skipPrev = useCallback(async () => {
    await spotifyApi("/me/player/previous", { method: "POST" });
  }, [spotifyApi]);

  const restartTrack = useCallback(async () => {
    await spotifyApi("/me/player/seek?position_ms=0", { method: "PUT" });
  }, [spotifyApi]);

  const seek = useCallback(
    async (positionMs: number) => {
      setPlayerState((prev) => ({ ...prev, progressMs: positionMs }));
      await spotifyApi(`/me/player/seek?position_ms=${Math.round(positionMs)}`, { method: "PUT" });
    },
    [spotifyApi],
  );

  const setVolume = useCallback(
    async (percent: number) => {
      await spotifyApi(`/me/player/volume?volume_percent=${Math.round(percent)}`, {
        method: "PUT",
      });
    },
    [spotifyApi],
  );

  const connect = useCallback(() => {
    fetchToken();
  }, [fetchToken]);

  const disconnect = useCallback(() => {
    tokenRef.current = null;
    tokenExpiryRef.current = 0;
    deviceIdRef.current = null;
    localStorage.removeItem(REFRESH_KEY);
    setToken(null);
    setPlayerState({ ...INITIAL_PLAYER_STATE, volumePercent: 100 });
    setActiveCueId(null);
    if (pollingRef.current) clearInterval(pollingRef.current);
  }, []);

  return {
    token,
    playerState,
    activeCueId,
    connect,
    disconnect,
    playCue,
    stop,
    playBackgroundPlaylist,
    skipNext,
    skipPrev,
    restartTrack,
    pause,
    resume,
    setVolume,
    seek,
  };
}
