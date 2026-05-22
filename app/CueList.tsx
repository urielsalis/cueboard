"use client";

import { useState, useCallback } from "react";
import { CueRow } from "./CueRow";
import { CueForm } from "./CueForm";
import type { PlayerState } from "./useSpotifyPlayer";
import * as storage from "./storage";
import type { Cue, CueInput } from "./types";

interface CueListProps {
  cues: Cue[];
  activeCueId: number | null;
  playerState: PlayerState;
  disabled: boolean;
  onPlay: (cue: Cue) => void;
  onCuesChange: () => void;
}

export function CueList({
  cues,
  activeCueId,
  playerState,
  disabled,
  onPlay,
  onCuesChange,
}: CueListProps) {
  const [editingCue, setEditingCue] = useState<Cue | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const activeCue = cues.find((c) => c.id === activeCueId) ?? null;
  const countdownMs =
    activeCue && activeCue.endTimeMs != null
      ? Math.max(0, activeCue.endTimeMs - playerState.progressMs)
      : null;

  const handleSaveNew = useCallback(
    (data: CueInput) => {
      storage.createCue(data);
      setShowAddForm(false);
      onCuesChange();
    },
    [onCuesChange],
  );

  const handleSaveEdit = useCallback(
    (data: CueInput) => {
      if (!editingCue) return;
      storage.updateCue(editingCue.id, data);
      setEditingCue(null);
      onCuesChange();
    },
    [editingCue, onCuesChange],
  );

  const handleDelete = useCallback(
    (cue: Cue) => {
      if (!confirm(`Delete "${cue.label}"?`)) return;
      storage.deleteCue(cue.id);
      onCuesChange();
    },
    [onCuesChange],
  );

  const handleMove = useCallback(
    (cue: Cue, direction: "up" | "down") => {
      const idx = cues.findIndex((c) => c.id === cue.id);
      if (idx === -1) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= cues.length) return;
      const newOrder = cues.map((c) => c.id);
      [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
      storage.reorderCues(newOrder);
      onCuesChange();
    },
    [cues, onCuesChange],
  );

  return (
    <div className="cb__left">
      <div className="cb__left-header">
        <span className="cb__left-title">Cue List</span>
        <button className="cb__add-btn" onClick={() => setShowAddForm(true)}>
          + Add Cue
        </button>
      </div>
      <div className="cb__cue-scroll">
        {cues.map((cue, idx) => (
          <CueRow
            key={cue.id}
            cue={cue}
            isActive={cue.id === activeCueId}
            hasSomeActive={activeCueId !== null}
            countdownMs={cue.id === activeCueId ? countdownMs : null}
            disabled={disabled}
            onPlay={onPlay}
            onEdit={setEditingCue}
            onDelete={handleDelete}
            onMoveUp={(c) => handleMove(c, "up")}
            onMoveDown={(c) => handleMove(c, "down")}
            isFirst={idx === 0}
            isLast={idx === cues.length - 1}
          />
        ))}
        {cues.length === 0 && (
          <div className="cb__cue-empty-state">
            No cues yet. Click &quot;+ Add Cue&quot; to get started.
          </div>
        )}
      </div>

      {showAddForm && <CueForm onSave={handleSaveNew} onCancel={() => setShowAddForm(false)} />}
      {editingCue && (
        <CueForm cue={editingCue} onSave={handleSaveEdit} onCancel={() => setEditingCue(null)} />
      )}
    </div>
  );
}
