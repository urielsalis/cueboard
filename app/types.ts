export interface Cue {
  id: number;
  position: number;
  label: string;
  subtitle: string;
  spotifyTrackId: string | null;
  startTimeMs: number;
  endTimeMs: number | null;
  color: string;
}

export function formatMs(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export function parseTimeToMs(value: string): number {
  const parts = value.split(":");
  if (parts.length === 2) {
    return (parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10)) * 1000;
  }
  return parseInt(value, 10) * 1000 || 0;
}

export type CueInput = Omit<Cue, "id" | "position">;

export function extractTrackId(input: string): string | null {
  if (!input.trim()) return null;
  const match = input.match(/track\/([A-Za-z0-9]{22})/);
  if (match) return match[1];
  if (/^[A-Za-z0-9]{22}$/.test(input.trim())) return input.trim();
  return null;
}

export function parsePlaylistInput(input: string): string | null {
  const match = input.match(/playlist\/([A-Za-z0-9]+)/);
  if (match) return `spotify:playlist:${match[1]}`;
  if (input.startsWith("spotify:playlist:")) return input;
  return null;
}
