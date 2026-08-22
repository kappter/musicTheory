import React from "react";
import { CHROMATIC_NOTES } from "@/lib/musicTheory";

interface FretboardProps {
  selectedNotes: string[];
  onNoteToggle: (note: string) => void;
  tuning?: number[]; // MIDI note indices for each string
  fretCount?: number;
  rootNote?: string; // Root note to highlight
}

export default function Fretboard({
  selectedNotes,
  onNoteToggle,
  tuning = [4, 9, 2, 7, 11, 4], // Standard tuning: E, A, D, G, B, E
  fretCount = 12,
  rootNote,
}: FretboardProps) {
  const strings = tuning.length;
  const fretWidth = 50;
  const stringHeight = 40;
  const dotRadius = 8;

  return (
    <div className="flex flex-col items-center gap-4">
      <h2 className="text-xl font-mono font-bold text-foreground">Guitar Fretboard</h2>

      {/* Fretboard */}
      <div
        className="bg-neutral-900 rounded-lg p-4 shadow-2xl border border-neutral-800"
        style={{
          width: (fretCount + 1) * fretWidth + 32,
          height: strings * stringHeight + 32,
        }}
      >
        {/* Strings */}
        {Array.from({ length: strings }).map((_, stringIdx) => (
          <div key={`string-${stringIdx}`}>
            {/* String line */}
            <div
              className="absolute bg-neutral-600"
              style={{
                top: 16 + stringIdx * stringHeight + stringHeight / 2 - 1,
                left: 16,
                width: (fretCount + 1) * fretWidth,
                height: 2,
              }}
            />

            {/* Frets and notes for this string */}
            {Array.from({ length: fretCount + 1 }).map((_, fretIdx) => {
              const noteIndex = (tuning[stringIdx] + fretIdx) % 12;
              const note = CHROMATIC_NOTES[noteIndex];
              const isSelected = selectedNotes.includes(note);
              const isRoot = note === rootNote;

              return (
                <button
                  key={`fret-${stringIdx}-${fretIdx}`}
                  onClick={() => onNoteToggle(note)}
                  className={`
                    absolute rounded-full transition-all duration-200 cursor-pointer
                    flex items-center justify-center font-mono text-xs font-bold
                    ${
                      isRoot
                        ? "bg-amber-400 shadow-lg shadow-amber-400/50 text-neutral-900 border-2 border-amber-300"
                        : isSelected
                        ? "bg-cyan-400 shadow-lg shadow-cyan-400/50 text-neutral-900 border-2 border-cyan-300"
                        : "bg-neutral-700 hover:bg-neutral-600 text-neutral-300 border-2 border-neutral-600"
                    }
                  `}
                  style={{
                    width: dotRadius * 2,
                    height: dotRadius * 2,
                    top: 16 + stringIdx * stringHeight + stringHeight / 2 - dotRadius,
                    left: 16 + fretIdx * fretWidth + fretWidth / 2 - dotRadius,
                  }}
                  title={`${note} (String ${stringIdx + 1}, Fret ${fretIdx})`}
                >
                  {isSelected && <span className="text-xs">{note}</span>}
                </button>
              );
            })}
          </div>
        ))}

        {/* Fret markers (vertical lines) */}
        {Array.from({ length: fretCount + 1 }).map((_, fretIdx) => (
          <div
            key={`fret-line-${fretIdx}`}
            className="absolute bg-neutral-700"
            style={{
              left: 16 + fretIdx * fretWidth + fretWidth / 2 - 1,
              top: 16,
              width: 2,
              height: strings * stringHeight,
            }}
          />
        ))}

        {/* Fret numbers */}
        <div className="absolute flex" style={{ top: 16 + strings * stringHeight + 8, left: 16 }}>
          {Array.from({ length: fretCount + 1 }).map((_, fretIdx) => (
            <div
              key={`fret-num-${fretIdx}`}
              className="text-xs text-neutral-500 font-mono text-center"
              style={{ width: fretWidth }}
            >
              {fretIdx}
            </div>
          ))}
        </div>
      </div>

      {/* String labels */}
      <div className="text-xs text-neutral-500 font-mono space-y-1">
        {["E", "A", "D", "G", "B", "E"].map((label, idx) => (
          <div key={`string-label-${idx}`}>String {idx + 1}: {label}</div>
        ))}
      </div>
    </div>
  );
}
