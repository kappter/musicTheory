import React from "react";
import { ScalePattern } from "@/lib/musicTheory";

interface ScaleResultProps {
  scale: ScalePattern | null;
  selectedNotes: string[];
}

export default function ScaleResult({ scale, selectedNotes }: ScaleResultProps) {
  if (selectedNotes.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <p className="text-sm italic">Select notes to discover scales...</p>
      </div>
    );
  }

  if (!scale) {
    return (
      <div className="bg-red-950/30 border-2 border-red-600/50 rounded-lg p-6 text-center animate-pulse">
        <p className="text-lg font-mono font-bold text-red-400 mb-2">Unknown Pattern</p>
        <p className="text-sm text-red-300">
          The combination of {selectedNotes.length} notes doesn't match a standard scale or mode.
        </p>
        <p className="text-xs text-red-400 mt-3">Try selecting more notes or a different combination.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      {/* Scale name and category */}
      <div className="bg-gradient-to-br from-cyan-950/40 to-cyan-900/20 border-2 border-cyan-500/50 rounded-lg p-6">
        <div className="flex items-baseline gap-3 mb-2">
          <h2 className="text-3xl font-mono font-bold text-cyan-300">{scale.name}</h2>
          <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded font-mono border border-cyan-500/30">
            {scale.category}
          </span>
        </div>
        <p className="text-cyan-200 italic">{scale.emotion}</p>
      </div>

      {/* Notes */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
        <p className="text-xs text-neutral-400 font-mono mb-2">NOTES</p>
        <div className="flex flex-wrap gap-2">
          {scale.notes.map((note, idx) => (
            <span
              key={note}
              className="px-3 py-2 bg-neutral-700 border border-neutral-600 text-neutral-100 rounded font-mono text-sm"
            >
              {note}
            </span>
          ))}
        </div>
      </div>

      {/* Intervals */}
      <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
        <p className="text-xs text-neutral-400 font-mono mb-3">INTERVALS</p>
        <div className="grid grid-cols-2 gap-2">
          {scale.intervals.map((interval, idx) => (
            <div key={interval} className="text-sm">
              <span className="text-neutral-500 font-mono">{idx}:</span>
              <span className="text-neutral-300 ml-2">{interval}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Your selection vs scale */}
      {selectedNotes.length < scale.notes.length && (
        <div className="bg-amber-950/30 border border-amber-700/50 rounded-lg p-4">
          <p className="text-xs text-amber-400 font-mono mb-2">COMPLETE SCALE</p>
          <p className="text-sm text-amber-200">
            You selected {selectedNotes.length} of {scale.notes.length} notes. The complete scale includes:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {scale.notes
              .filter((note) => !selectedNotes.includes(note))
              .map((note) => (
                <span key={note} className="px-2 py-1 bg-amber-900/40 text-amber-300 rounded font-mono text-xs">
                  {note}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
