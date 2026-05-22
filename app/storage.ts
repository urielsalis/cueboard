import type { Cue, CueInput } from "./types";

interface StoredData {
  cues: Cue[];
  nextId: number;
  backgroundPlaylistUri: string | null;
  spotifyClientId: string | null;
}

const STORAGE_KEY = "controlboard_data";

const DEFAULT_DATA: StoredData = {
  cues: [
    {
      id: 1,
      position: 1,
      label: "Intro",
      subtitle: "A subtitle",
      spotifyTrackId: "4PTG3Z6ehGkBFwjybzWkR8",
      startTimeMs: 0,
      endTimeMs: 15000,
      color: "#546e7a",
    },
    {
      id: 2,
      position: 2,
      label: "Starting later",
      subtitle: "",
      spotifyTrackId: "6RzRRbZxWWFm7ih6djhUzx",
      startTimeMs: 3000,
      endTimeMs: null,
      color: "#24c421",
    },
  ],
  nextId: 3,
  backgroundPlaylistUri: "spotify:playlist:37i9dQZF1DWWQRwui0ExPn",
  spotifyClientId: null,
};

function load(): StoredData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return { ...DEFAULT_DATA, cues: DEFAULT_DATA.cues.map((c) => ({ ...c })) };
  return JSON.parse(raw);
}

function save(data: StoredData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isConfigured(): boolean {
  const data = load();
  return !!data.spotifyClientId;
}

export function getClientId(): string | null {
  return load().spotifyClientId;
}

export function setClientId(clientId: string) {
  const data = load();
  data.spotifyClientId = clientId;
  save(data);
}

export function getAllCues(): Cue[] {
  return load().cues.sort((a, b) => a.position - b.position);
}

export function createCue(input: CueInput): Cue {
  const data = load();
  const maxPos = data.cues.reduce((m, c) => Math.max(m, c.position), 0);
  const cue: Cue = { id: data.nextId++, position: maxPos + 1, ...input };
  data.cues.push(cue);
  save(data);
  return cue;
}

export function updateCue(id: number, updates: Partial<Omit<Cue, "id" | "position">>): Cue | null {
  const data = load();
  const cue = data.cues.find((c) => c.id === id);
  if (!cue) return null;
  Object.assign(cue, updates);
  save(data);
  return cue;
}

export function deleteCue(id: number): boolean {
  const data = load();
  const idx = data.cues.findIndex((c) => c.id === id);
  if (idx === -1) return false;
  data.cues.splice(idx, 1);
  data.cues.sort((a, b) => a.position - b.position).forEach((c, i) => (c.position = i + 1));
  save(data);
  return true;
}

export function reorderCues(cueIds: number[]) {
  const data = load();
  cueIds.forEach((id, i) => {
    const cue = data.cues.find((c) => c.id === id);
    if (cue) cue.position = i + 1;
  });
  save(data);
}

export function getBackgroundPlaylistUri(): string | null {
  return load().backgroundPlaylistUri;
}

export function setBackgroundPlaylistUri(uri: string) {
  const data = load();
  data.backgroundPlaylistUri = uri;
  save(data);
}
