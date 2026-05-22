"use client";

import { useState } from "react";
import type { Cue, CueInput } from "./types";
import { parseTimeToMs, formatMs, extractTrackId } from "./types";

interface CueFormProps {
  cue?: Cue | null;
  onSave: (data: CueInput) => void;
  onCancel: () => void;
}

export function CueForm({ cue, onSave, onCancel }: CueFormProps) {
  const [label, setLabel] = useState(cue?.label ?? "");
  const [subtitle, setSubtitle] = useState(cue?.subtitle ?? "");
  const [trackInput, setTrackInput] = useState(
    cue?.spotifyTrackId ? `https://open.spotify.com/track/${cue.spotifyTrackId}` : "",
  );
  const [startTime, setStartTime] = useState(cue ? formatMs(cue.startTimeMs) : "0:00");
  const [endTime, setEndTime] = useState(cue?.endTimeMs != null ? formatMs(cue.endTimeMs) : "");
  const [color, setColor] = useState(cue?.color ?? "#546e7a");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      label,
      subtitle,
      spotifyTrackId: extractTrackId(trackInput),
      startTimeMs: parseTimeToMs(startTime),
      endTimeMs: endTime.trim() ? parseTimeToMs(endTime) : null,
      color,
    });
  };

  return (
    <div className="cue-form-overlay" onClick={onCancel}>
      <form className="cue-form" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h3 className="cue-form__title">{cue ? "Edit Cue" : "Add Cue"}</h3>

        <div className="cue-form__field">
          <label className="cue-form__label">Name</label>
          <input
            className="cue-form__input"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Intro Music"
            required
          />
        </div>

        <div className="cue-form__field">
          <label className="cue-form__label">Subtitle (optional)</label>
          <input
            className="cue-form__input"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="e.g. Opening Act"
          />
        </div>

        <div className="cue-form__field">
          <label className="cue-form__label">Spotify Track URL or ID</label>
          <input
            className="cue-form__input"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
            placeholder="https://open.spotify.com/track/..."
          />
        </div>

        <div className="cue-form__row">
          <div className="cue-form__field">
            <label className="cue-form__label">Start Time (m:ss)</label>
            <input
              className="cue-form__input"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              placeholder="0:00"
            />
          </div>
          <div className="cue-form__field">
            <label className="cue-form__label">End Time (m:ss or empty)</label>
            <input
              className="cue-form__input"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              placeholder="Leave empty for full track"
            />
          </div>
        </div>

        <div className="cue-form__field">
          <label className="cue-form__label">Color</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="color"
              value={color.startsWith("#") ? color : "#546e7a"}
              onChange={(e) => setColor(e.target.value)}
              style={{
                width: 40,
                height: 32,
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            />
            <input
              className="cue-form__input"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#e65100 or CSS gradient"
              style={{ flex: 1 }}
            />
          </div>
        </div>

        <div className="cue-form__actions">
          <button type="button" className="cue-form__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="cue-form__save" disabled={!label.trim()}>
            {cue ? "Save" : "Add Cue"}
          </button>
        </div>
      </form>
    </div>
  );
}
