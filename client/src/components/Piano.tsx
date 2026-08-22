import React, { useMemo } from "react";
import { CHROMATIC_NOTES } from "@/lib/musicTheory";

interface PianoProps {
  selectedNotes: string[];
  onNoteToggle: (note: string) => void;
  octaveStart?: number;
  octaveCount?: number;
  rootNote?: string; // Root note to highlight
}

export default function Piano({
  selectedNotes,
  onNoteToggle,
  octaveStart = 0,
  octaveCount = 2,
  rootNote,
}: PianoProps) {
  const whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
  const blackNotes = ["C#", "D#", "F#", "G#", "A#"];

  // Generate all notes across octaves
  const allNotes = useMemo(() => {
    const notes: string[] = [];
    for (let octave = octaveStart; octave < octaveStart + octaveCount; octave++) {
      CHROMATIC_NOTES.forEach((note) => {
        notes.push(note);
      });
    }
    return notes;
  }, [octaveStart, octaveCount]);

  // Calculate positions for white keys
  const whiteKeyPositions = useMemo(() => {
    const positions: Record<string, number> = {};
    let position = 0;
    for (let octave = octaveStart; octave < octaveStart + octaveCount; octave++) {
      whiteNotes.forEach((note) => {
        positions[note] = position;
        position++;
      });
    }
    return positions;
  }, [octaveStart, octaveCount]);

  const whiteKeyWidth = 60;
  const whiteKeyHeight = 280;
  const blackKeyWidth = 40;
  const blackKeyHeight = 180;
  const blackKeyOffset = 30; // Offset from left edge of white key

  // Total width for all white keys
  const totalWhiteKeys = whiteNotes.length * octaveCount;
  const totalWidth = totalWhiteKeys * whiteKeyWidth;

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-mono font-bold text-foreground">Piano Keyboard</h2>

      {/* Piano container */}
      <div
        className="relative bg-neutral-900 rounded-lg p-4 shadow-2xl border border-neutral-800"
        style={{ width: totalWidth + 32 }}
      >
        {/* White keys */}
        <div className="flex gap-0">
          {Array.from({ length: totalWhiteKeys }).map((_, idx) => {
            const note = whiteNotes[idx % whiteNotes.length];
            const isSelected = selectedNotes.includes(note);
            const isRoot = note === rootNote;

            return (
              <button
                key={`white-${idx}`}
                onClick={() => onNoteToggle(note)}
                className={`
                  relative flex-shrink-0 rounded-b-lg border-2 border-neutral-700
                  transition-all duration-200 cursor-pointer
                  ${
                    isRoot
                      ? "bg-amber-400 shadow-lg shadow-amber-400/50 border-amber-300"
                      : isSelected
                      ? "bg-cyan-400 shadow-lg shadow-cyan-400/50 border-cyan-300"
                      : "bg-white hover:bg-neutral-100 shadow-md"
                  }
                `}
                style={{
                  width: whiteKeyWidth,
                  height: whiteKeyHeight,
                }}
                title={note}
              >
                <span
                  className={`
                    absolute bottom-3 left-0 right-0 text-center text-xs font-mono font-bold
                    ${isSelected ? "text-neutral-900" : "text-neutral-700"}
                  `}
                >
                  {note}
                </span>
              </button>
            );
          })}
        </div>

        {/* Black keys */}
        <div className="absolute top-4 left-4 w-full h-full pointer-events-none">
          {Array.from({ length: totalWhiteKeys }).map((_, idx) => {
            const note = whiteNotes[idx % whiteNotes.length];
            const nextNote = whiteNotes[(idx + 1) % whiteNotes.length];

            // Skip black keys that don't exist (between E-F and B-C)
            if (note === "E" || note === "B") return null;

            const blackNote = note + "#";
            const isSelected = selectedNotes.includes(blackNote);
            const isRoot = blackNote === rootNote;
            const xPos = (idx + 0.65) * whiteKeyWidth;

            return (
              <button
                key={`black-${idx}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onNoteToggle(blackNote);
                }}
                className={`
                  absolute rounded-b-lg border-2 border-neutral-600
                  transition-all duration-200 cursor-pointer
                  ${
                    isRoot
                      ? "bg-amber-500 shadow-lg shadow-amber-500/60 border-amber-400"
                      : isSelected
                      ? "bg-cyan-500 shadow-lg shadow-cyan-500/60 border-cyan-400"
                      : "bg-neutral-800 hover:bg-neutral-700 shadow-md"
                  }
                `}
                style={{
                  width: blackKeyWidth,
                  height: blackKeyHeight,
                  left: xPos - blackKeyWidth / 2,
                  top: 0,
                }}
                title={blackNote}
              >
                <span
                  className={`
                    absolute bottom-2 left-0 right-0 text-center text-xs font-mono font-bold
                    ${isSelected ? "text-neutral-900" : "text-neutral-400"}
                  `}
                >
                  {blackNote}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected notes display */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground mb-2">Selected Notes:</p>
        <div className="flex flex-wrap gap-2 justify-center">
          {selectedNotes.length === 0 ? (
            <span className="text-neutral-500 italic">Click notes to select...</span>
          ) : (
            selectedNotes.map((note) => (
              <span
                key={note}
                className="px-3 py-1 bg-cyan-400/20 border border-cyan-400 text-cyan-300 rounded font-mono text-sm"
              >
                {note}
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
