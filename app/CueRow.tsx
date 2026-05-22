"use client";

import type { Cue } from "./types";
import { formatMs } from "./types";

interface CueRowProps {
  cue: Cue;
  isActive: boolean;
  hasSomeActive: boolean;
  countdownMs: number | null;
  disabled: boolean;
  onPlay: (cue: Cue) => void;
  onEdit: (cue: Cue) => void;
  onDelete: (cue: Cue) => void;
  onMoveUp: (cue: Cue) => void;
  onMoveDown: (cue: Cue) => void;
  isFirst: boolean;
  isLast: boolean;
}

export function CueRow({
  cue,
  isActive,
  hasSomeActive,
  countdownMs,
  disabled,
  onPlay,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: CueRowProps) {
  const isEmpty = !cue.spotifyTrackId;
  const rowClass = [
    "cue-row",
    isActive && "cue-row--active",
    !isActive && hasSomeActive && "cue-row--dimmed",
    isEmpty && "cue-row--empty",
  ]
    .filter(Boolean)
    .join(" ");

  const timeRange = isEmpty
    ? "—"
    : `${formatMs(cue.startTimeMs)} → ${cue.endTimeMs != null ? formatMs(cue.endTimeMs) : "end"}`;

  return (
    <div
      className={rowClass}
      style={{ background: cue.color }}
      onClick={() => !isEmpty && !disabled && onPlay(cue)}
    >
      <div className="cue-row__info">
        <div className="cue-row__label">
          {cue.position}. {cue.label}
        </div>
        {cue.subtitle && <div className="cue-row__subtitle">{cue.subtitle}</div>}
        {isEmpty && (
          <div className="cue-row__subtitle" style={{ fontStyle: "italic" }}>
            No song yet
          </div>
        )}
      </div>
      <div className="cue-row__times">
        <div className="cue-row__range">{timeRange}</div>
        {isActive && <div className="cue-row__badge">▶ PLAYING</div>}
        {isActive && countdownMs != null && countdownMs > 0 && (
          <div className="cue-row__countdown">{formatMs(countdownMs)}</div>
        )}
      </div>
      <div className="cue-row__actions" onClick={(e) => e.stopPropagation()}>
        {!isFirst && (
          <button className="cue-row__action-btn" onClick={() => onMoveUp(cue)} title="Move up">
            ↑
          </button>
        )}
        {!isLast && (
          <button className="cue-row__action-btn" onClick={() => onMoveDown(cue)} title="Move down">
            ↓
          </button>
        )}
        <button className="cue-row__action-btn" onClick={() => onEdit(cue)} title="Edit">
          ✎
        </button>
        <button
          className="cue-row__action-btn cue-row__action-btn--danger"
          onClick={() => onDelete(cue)}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
