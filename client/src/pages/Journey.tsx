import React, { useState, useMemo, useCallback } from "react";
import { ALL_SCALES, CHROMATIC_NOTES, getRelativeModes } from "@/lib/musicTheory";
import type { ScalePattern } from "@/lib/musicTheory";
import { Link } from "wouter";

// Section types for song structure
const SECTION_TYPES = [
  "intro", "verse", "pre-chorus", "chorus", "bridge", "breakdown", "solo", "outro"
] as const;

type SectionType = typeof SECTION_TYPES[number];

const TIME_SIGNATURES = ["4/4", "3/4", "6/8", "7/4", "5/4", "7/8", "9/8", "12/8"] as const;

interface JourneyBlock {
  id: string;
  type: SectionType;
  measures: number;
  rootNote: string;
  mode: string;
  feel: string;
  lyrics: string;
  energy_drummer: number;
  energy_bassist: number;
  energy_guitarist: number;
  energy_keyboardist: number;
  energy_vocalist: number;
  ts_drummer: string;
  ts_bassist: string;
  ts_guitarist: string;
  ts_keyboardist: string;
  ts_vocalist: string;
}

interface ModeRelationship {
  commonNotes: string[];
  uniqueNotes: string[];
  tensionLevel: number; // 0-10
  resolutionStrength: number; // 0-10
  suggestion: string;
}

// Circle mode types
type CircleMode = "relative" | "parallel" | "freeform";

// Templates for different song structures
const JOURNEY_TEMPLATES: Record<string, SectionType[]> = {
  "2 - Intro/Outro": ["intro", "outro"],
  "3 - Verse/Chorus/Outro": ["verse", "chorus", "outro"],
  "4 - Standard": ["intro", "verse", "chorus", "outro"],
  "5 - Pop": ["intro", "verse", "chorus", "bridge", "outro"],
  "6 - Extended": ["intro", "verse", "pre-chorus", "chorus", "bridge", "outro"],
  "7 - Full": ["intro", "verse", "pre-chorus", "chorus", "verse", "bridge", "outro"],
  "8 - Epic": ["intro", "verse", "pre-chorus", "chorus", "verse", "bridge", "chorus", "outro"],
  "9 - Progressive": ["intro", "verse", "chorus", "verse", "chorus", "bridge", "solo", "chorus", "outro"],
  "10 - Suite": ["intro", "verse", "pre-chorus", "chorus", "breakdown", "verse", "bridge", "solo", "chorus", "outro"],
  "11 - Opus": ["intro", "verse", "pre-chorus", "chorus", "verse", "pre-chorus", "chorus", "bridge", "solo", "chorus", "outro"],
  "12 - Magnum": ["intro", "verse", "pre-chorus", "chorus", "breakdown", "verse", "pre-chorus", "chorus", "bridge", "solo", "chorus", "outro"],
  "Custom": [],
};

// Nudges only apply to Relative mode (diatonic modes)
const MODE_NUDGES: Record<string, string[]> = {
  "Ionian (Major)": ["Mixolydian", "Lydian", "Aeolian (Natural Minor)"],
  "Dorian": ["Mixolydian", "Aeolian (Natural Minor)", "Phrygian"],
  "Phrygian": ["Aeolian (Natural Minor)", "Dorian", "Locrian"],
  "Lydian": ["Ionian (Major)", "Mixolydian", "Dorian"],
  "Mixolydian": ["Dorian", "Ionian (Major)", "Aeolian (Natural Minor)"],
  "Aeolian (Natural Minor)": ["Dorian", "Phrygian", "Ionian (Major)"],
  "Locrian": ["Phrygian", "Aeolian (Natural Minor)", "Dorian"],
};

function getModeName(fullName: string): string {
  const parts = fullName.split(" ");
  if (parts.length > 1) {
    return parts.slice(1).join(" ");
  }
  return fullName;
}

function getRootFromName(fullName: string): string {
  return fullName.split(" ")[0];
}

// Mode brightness order (from darkest to brightest) - used for diatonic modes
const MODE_BRIGHTNESS: Record<string, number> = {
  "Locrian": 1,
  "Phrygian": 2,
  "Aeolian (Natural Minor)": 3,
  "Dorian": 4,
  "Mixolydian": 5,
  "Ionian (Major)": 6,
  "Lydian": 7,
};

// Characteristic intervals that define each mode's color
const MODE_CHARACTERISTICS: Record<string, { defining: string; quality: string }> = {
  "Ionian (Major)": { defining: "Major 7th, Major 3rd", quality: "stable, bright, resolved" },
  "Dorian": { defining: "Minor 3rd, Major 6th", quality: "warm minor, jazzy" },
  "Phrygian": { defining: "Minor 2nd, Minor 3rd", quality: "dark, exotic, tense" },
  "Lydian": { defining: "Raised 4th, Major 7th", quality: "ethereal, floating, dreamy" },
  "Mixolydian": { defining: "Major 3rd, Minor 7th", quality: "bluesy, dominant, driving" },
  "Aeolian (Natural Minor)": { defining: "Minor 3rd, Minor 6th", quality: "sad, natural, melancholic" },
  "Locrian": { defining: "Diminished 5th, Minor 2nd", quality: "unstable, dissonant, tense" },
  // Extended for non-diatonic scales
  "Harmonic Minor": { defining: "Minor 3rd, Major 7th", quality: "dramatic, classical, dark" },
  "Melodic Minor": { defining: "Minor 3rd, Major 6th, Major 7th", quality: "sophisticated, jazzy, lyrical" },
  "Neapolitan Minor": { defining: "Minor 2nd, Minor 3rd, Major 7th", quality: "dark, exotic, Neapolitan" },
  "Whole Tone": { defining: "All whole steps, no semitones", quality: "surreal, dreamlike, floating" },
  "Diminished (Half-Whole)": { defining: "Alternating H-W, symmetrical", quality: "tense, mysterious, jazz" },
  "Spanish Phrygian": { defining: "Minor 2nd, Major 3rd", quality: "flamenco, passionate, fiery" },
  "Jazz Minor": { defining: "Minor 3rd, Major 6th, Major 7th", quality: "modern jazz, complex" },
  "Blues Scale": { defining: "Blue note (b5), Minor pentatonic+", quality: "bluesy, raw, soulful" },
  "Harmonic Major": { defining: "Major 3rd, Minor 6th", quality: "exotic major, dark-bright" },
  "Major Pentatonic": { defining: "No semitones, 5 notes", quality: "bright, open, folk-like" },
  "Minor Pentatonic": { defining: "No semitones, 5 notes", quality: "dark, bluesy, universal" },
  "Augmented": { defining: "Symmetrical, augmented triads", quality: "surreal, unstable, abstract" },
  "Indian Raga Bhairav": { defining: "Minor 2nd, Major 3rd, Minor 6th", quality: "spiritual, exotic, meditative" },
  "Japanese Pentatonic": { defining: "Minor 2nd, no 3rd", quality: "zen, sparse, contemplative" },
  "Egyptian Pentatonic": { defining: "Suspended, no 3rd", quality: "ancient, open, meditative" },
  "Yo Pentatonic": { defining: "Minor 3rd, no 7th", quality: "Asian, meditative, sparse" },
  "Diminished (Whole-Half)": { defining: "Alternating W-H, symmetrical", quality: "tense, edgy, jazz" },
};

function analyzeRelationship(modeA: ScalePattern, modeB: ScalePattern): ModeRelationship {
  const modeNameA = getModeName(modeA.name);
  const modeNameB = getModeName(modeB.name);
  
  // Get interval structures (semitones from each mode's own root)
  const rootA = CHROMATIC_NOTES.indexOf(modeA.notes[0]);
  const rootB = CHROMATIC_NOTES.indexOf(modeB.notes[0]);
  
  const intervalsA = modeA.notes.map(n => (CHROMATIC_NOTES.indexOf(n) - rootA + 12) % 12);
  const intervalsB = modeB.notes.map(n => (CHROMATIC_NOTES.indexOf(n) - rootB + 12) % 12);
  
  // Find common intervals (same scale degrees relative to their own roots)
  const setA = new Set(intervalsA);
  const setB = new Set(intervalsB);
  const commonIntervals = intervalsA.filter(i => setB.has(i));
  const uniqueToB = intervalsB.filter(i => !setA.has(i));
  
  // Also compute actual pitch-class overlap for non-diatonic comparisons
  const pitchesA = new Set(modeA.notes);
  const pitchesB = new Set(modeB.notes);
  const commonPitches = modeA.notes.filter(n => pitchesB.has(n));
  const uniquePitchesB = modeB.notes.filter(n => !pitchesA.has(n));
  
  // Map intervals back to note names for display
  const commonNotes = commonPitches;
  const uniqueNotes = uniquePitchesB;
  
  // Calculate tension based on:
  // 1. Brightness distance (if both are diatonic modes)
  const brightnessA = MODE_BRIGHTNESS[modeNameA] || 4;
  const brightnessB = MODE_BRIGHTNESS[modeNameB] || 4;
  const brightnessDiff = Math.abs(brightnessA - brightnessB);
  
  // 2. Interval structure difference
  const intervalDiffCount = uniqueToB.length;
  
  // 3. Root distance (semitones between roots)
  const rootDistance = Math.min((rootB - rootA + 12) % 12, (rootA - rootB + 12) % 12);
  
  // 4. Pitch-class overlap ratio (fewer common pitches = more tension)
  const maxNotes = Math.max(modeA.notes.length, modeB.notes.length);
  const overlapRatio = commonPitches.length / maxNotes;
  
  // 5. Special tension markers
  const hasTritone = intervalsB.includes(6);
  const hasMinor2nd = intervalsB.includes(1) && !intervalsA.includes(1);
  
  // Tension formula: combines structural and pitch-class analysis
  let tensionLevel = Math.round(
    (brightnessDiff / 6) * 2 + // 0-2 from brightness (diatonic)
    (intervalDiffCount / Math.max(7, modeB.notes.length)) * 3 + // 0-3 from interval differences
    ((1 - overlapRatio) * 3) + // 0-3 from pitch-class divergence
    (rootDistance > 0 && rootDistance <= 2 ? 0 : rootDistance >= 5 ? 1.5 : 0.5) + // root distance factor
    (hasTritone ? 0.5 : 0) +
    (hasMinor2nd ? 0.5 : 0)
  );
  
  // Resolution strength based on:
  // 1. Common pitches (more = smoother resolution)
  // 2. Presence of leading tone
  // 3. Root relationship (fifth = strong, step = moderate)
  const hasLeadingTone = intervalsB.includes(11);
  const resolvesUpward = brightnessB > brightnessA;
  const isFifthRelation = rootDistance === 7 || rootDistance === 5;
  const isStepRelation = rootDistance === 1 || rootDistance === 2;
  
  let resolutionStrength = Math.round(
    overlapRatio * 4 + // 0-4 from pitch overlap
    (hasLeadingTone ? 1.5 : 0) +
    (resolvesUpward ? 1 : 0) +
    (isFifthRelation ? 2 : isStepRelation ? 1 : 0) +
    (brightnessDiff <= 1 ? 1 : 0)
  );
  
  // Generate contextual suggestion
  let suggestion = "";
  const charB = MODE_CHARACTERISTICS[modeNameB];
  
  if (tensionLevel >= 7) suggestion = `Maximum tension — dramatic shift to ${charB?.quality || "contrasting color"}`;
  else if (tensionLevel >= 5) suggestion = `Strong contrast — ${charB?.quality || "new energy"} builds tension`;
  else if (tensionLevel >= 3) suggestion = `Moderate evolution — shifting toward ${charB?.quality || "new character"}`;
  else suggestion = `Smooth transition — subtle color change to ${charB?.quality || "related territory"}`;
  
  if (resolutionStrength >= 7) suggestion += " → resolves strongly";
  else if (resolutionStrength >= 4) suggestion += " → partial resolution";
  else suggestion += " → open-ended";
  
  return {
    commonNotes,
    uniqueNotes,
    tensionLevel: Math.min(10, Math.max(1, tensionLevel)),
    resolutionStrength: Math.min(10, Math.max(1, resolutionStrength)),
    suggestion,
  };
}

// Transpose a scale pattern to a given root
function transposeScale(scale: ScalePattern, targetRoot: string): ScalePattern {
  const originalRoot = scale.notes[0];
  const originalRootIdx = CHROMATIC_NOTES.indexOf(originalRoot);
  const targetRootIdx = CHROMATIC_NOTES.indexOf(targetRoot);
  const offset = (targetRootIdx - originalRootIdx + 12) % 12;
  
  const transposedNotes = scale.notes.map(note => {
    const idx = CHROMATIC_NOTES.indexOf(note);
    return CHROMATIC_NOTES[(idx + offset) % 12];
  });
  
  return {
    ...scale,
    name: `${targetRoot} ${scale.name}`,
    notes: transposedNotes,
  };
}

export default function Journey() {
  const themeColor = "#a67c52";
  
  // Chord progression visualizer state
  const [highlightedChordIndex, setHighlightedChordIndex] = useState<number | null>(null);
  
  // Parent scale configuration
  const [parentKey, setParentKey] = useState<string>("C");
  const [parentMode, setParentMode] = useState<string>("Ionian (Major)");
  
  // Circle mode state
  const [circleMode, setCircleMode] = useState<CircleMode>("relative");
  
  // Circle state
  const [selectedModeIndex, setSelectedModeIndex] = useState<number>(0);
  const [comparisonModeIndex, setComparisonModeIndex] = useState<number | null>(null);
  
  // Freeform state
  const [freeformNodes, setFreeformNodes] = useState<ScalePattern[]>([]);
  const [freeformSearchOpen, setFreeformSearchOpen] = useState(false);
  const [freeformSearchQuery, setFreeformSearchQuery] = useState("");
  const [freeformSearchRoot, setFreeformSearchRoot] = useState("C");
  
  // Journey timeline state
  const [journeyBlocks, setJourneyBlocks] = useState<JourneyBlock[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("5 - Pop");
  const [songName, setSongName] = useState<string>("Untitled Journey");
  const [tempo, setTempo] = useState<number>(96);
  const [timeSignature, setTimeSignature] = useState<string>("4/4");
  
  // Get nodes for the circle based on current mode
  const circleNodes: ScalePattern[] = useMemo(() => {
    if (circleMode === "relative") {
      // Original behavior: 7 relative modes sharing same notes
      const parentScale = ALL_SCALES.find(s => s.name === parentMode);
      if (!parentScale) return [];
      
      const keyOffset = CHROMATIC_NOTES.indexOf(parentKey);
      const transposedNotes = parentScale.notes.map(note => {
        const idx = CHROMATIC_NOTES.indexOf(note);
        return CHROMATIC_NOTES[(idx + keyOffset) % 12];
      });
      
      const transposedScale: ScalePattern = {
        ...parentScale,
        name: `${parentKey} ${parentScale.name}`,
        notes: transposedNotes,
      };
      
      return getRelativeModes(transposedScale);
    } else if (circleMode === "parallel") {
      // 7 diatonic modes all rooted on the same note (parentKey)
      const modes = ALL_SCALES.filter(s => s.category === "mode");
      return modes.map(mode => transposeScale(mode, parentKey));
    } else {
      // Freeform: user-added nodes
      return freeformNodes;
    }
  }, [circleMode, parentKey, parentMode, freeformNodes]);
  
  // Current selected mode details
  const selectedMode = circleNodes[selectedModeIndex] || null;
  const comparisonMode = comparisonModeIndex !== null ? circleNodes[comparisonModeIndex] : null;
  
  // Analyze relationship between selected and comparison modes
  const relationship = useMemo(() => {
    if (!selectedMode || !comparisonMode) return null;
    return analyzeRelationship(selectedMode, comparisonMode);
  }, [selectedMode, comparisonMode]);
  
  // Get nudges for the selected mode (only in Relative mode)
  const nudges = useMemo(() => {
    if (circleMode !== "relative" || !selectedMode) return [];
    const modeName = getModeName(selectedMode.name);
    const suggested = MODE_NUDGES[modeName] || [];
    return suggested.map(name => {
      const idx = circleNodes.findIndex(m => getModeName(m.name) === name);
      return { name, index: idx };
    }).filter(n => n.index >= 0);
  }, [selectedMode, circleNodes, circleMode]);
  
  // Reset selection when circle mode changes
  const handleCircleModeChange = (mode: CircleMode) => {
    setCircleMode(mode);
    setSelectedModeIndex(0);
    setComparisonModeIndex(null);
  };
  
  // Freeform: add a scale node
  const addFreeformNode = (scale: ScalePattern, root: string) => {
    const transposed = transposeScale(scale, root);
    // Don't add duplicates
    if (freeformNodes.some(n => n.name === transposed.name)) return;
    setFreeformNodes(prev => [...prev, transposed]);
    setFreeformSearchOpen(false);
    setFreeformSearchQuery("");
  };
  
  // Freeform: remove a node
  const removeFreeformNode = (idx: number) => {
    setFreeformNodes(prev => prev.filter((_, i) => i !== idx));
    if (selectedModeIndex >= freeformNodes.length - 1) {
      setSelectedModeIndex(Math.max(0, freeformNodes.length - 2));
    }
    if (comparisonModeIndex !== null && comparisonModeIndex >= freeformNodes.length - 1) {
      setComparisonModeIndex(null);
    }
  };
  
  // Filtered scales for freeform search
  const filteredScales = useMemo(() => {
    if (!freeformSearchQuery.trim()) return ALL_SCALES;
    const q = freeformSearchQuery.toLowerCase();
    return ALL_SCALES.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.emotion.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.progression && s.progression.toLowerCase().includes(q))
    );
  }, [freeformSearchQuery]);
  
  // Initialize journey from template
  const initializeJourney = useCallback((templateKey: string) => {
    const sections = JOURNEY_TEMPLATES[templateKey];
    if (!sections) return;
    
    if (sections.length === 0) {
      setJourneyBlocks([]);
      return;
    }
    
    const blocks: JourneyBlock[] = sections.map((type, idx) => ({
      id: `block-${Date.now()}-${idx}`,
      type,
      measures: type === "intro" || type === "outro" ? 4 : 8,
      rootNote: parentKey,
      mode: parentMode,
      feel: "",
      lyrics: "",
      energy_drummer: Math.min(10, Math.max(1, Math.round(3 + (idx / sections.length) * 5))),
      energy_bassist: Math.min(10, Math.max(1, Math.round(4 + (idx / sections.length) * 4))),
      energy_guitarist: Math.min(10, Math.max(1, Math.round(3 + (idx / sections.length) * 5))),
      energy_keyboardist: Math.min(10, Math.max(1, Math.round(3 + (idx / sections.length) * 4))),
      energy_vocalist: Math.min(10, Math.max(1, Math.round(1 + (idx / sections.length) * 7))),
      ts_drummer: timeSignature,
      ts_bassist: timeSignature,
      ts_guitarist: timeSignature,
      ts_keyboardist: timeSignature,
      ts_vocalist: timeSignature,
    }));
    
    setJourneyBlocks(blocks);
  }, [parentKey, parentMode, timeSignature]);
  
  // Add a new block
  const addBlock = useCallback((type: SectionType = "verse") => {
    const newBlock: JourneyBlock = {
      id: `block-${Date.now()}-${journeyBlocks.length}`,
      type,
      measures: type === "intro" || type === "outro" ? 4 : 8,
      rootNote: parentKey,
      mode: parentMode,
      feel: "",
      lyrics: "",
      energy_drummer: 5,
      energy_bassist: 5,
      energy_guitarist: 5,
      energy_keyboardist: 5,
      energy_vocalist: 5,
      ts_drummer: timeSignature,
      ts_bassist: timeSignature,
      ts_guitarist: timeSignature,
      ts_keyboardist: timeSignature,
      ts_vocalist: timeSignature,
    };
    setJourneyBlocks(prev => [...prev, newBlock]);
  }, [journeyBlocks.length, parentKey, parentMode, timeSignature]);
  
  // Assign a mode from the circle to a journey block
  const assignModeToBlock = (blockId: string) => {
    if (!selectedMode) return;
    setJourneyBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return {
          ...block,
          rootNote: getRootFromName(selectedMode.name),
          mode: getModeName(selectedMode.name),
        };
      }
      return block;
    }));
  };
  
  // Update block field
  const updateBlock = (blockId: string, field: keyof JourneyBlock, value: string | number) => {
    setJourneyBlocks(prev => prev.map(block => {
      if (block.id === blockId) {
        return { ...block, [field]: value };
      }
      return block;
    }));
  };
  
  // Export as SongMaker JSON
  const exportSongMaker = () => {
    const songData = {
      songName,
      tempo,
      blocks: journeyBlocks.map(block => ({
        type: block.type,
        measures: block.measures,
        rootNote: block.rootNote,
        mode: block.mode,
        feel: block.feel,
        lyrics: block.lyrics,
        energy_drummer: block.energy_drummer,
        energy_bassist: block.energy_bassist,
        energy_guitarist: block.energy_guitarist,
        energy_keyboardist: block.energy_keyboardist,
        energy_vocalist: block.energy_vocalist,
        ts_drummer: block.ts_drummer,
        ts_bassist: block.ts_bassist,
        ts_guitarist: block.ts_guitarist,
        ts_keyboardist: block.ts_keyboardist,
        ts_vocalist: block.ts_vocalist,
      })),
    };
    
    const blob = new Blob([JSON.stringify(songData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${songName.replace(/\s+/g, "_")}_SongMaker.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  // Remove a block from the journey
  const removeBlock = (blockId: string) => {
    setJourneyBlocks(prev => prev.filter(b => b.id !== blockId));
  };

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: "#1a1a2e", color: "#e0d6c8" }}>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: themeColor, fontFamily: "'Playfair Display', serif" }}>
          Journey Builder
        </h1>
        <p className="text-sm text-gray-400">Map your modal journey from tension to resolution</p>
        <Link href="/" className="inline-block mt-2 text-sm underline opacity-60 hover:opacity-100" style={{ color: themeColor }}>
          ← Back to Explorer
        </Link>
      </div>
      
      {/* Parent Scale Configuration */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="rounded-lg p-4 flex flex-wrap gap-3 justify-center items-center" style={{ backgroundColor: "#2a2a3e", border: `1px solid ${themeColor}33` }}>
          <label className="text-sm font-semibold" style={{ color: themeColor }}>Parent Scale:</label>
          <select
            value={parentKey}
            onChange={(e) => setParentKey(e.target.value)}
            className="px-3 py-1.5 rounded text-sm"
            style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: `1px solid ${themeColor}55` }}
          >
            {CHROMATIC_NOTES.map(note => (
              <option key={note} value={note}>{note}</option>
            ))}
          </select>
          <select
            value={parentMode}
            onChange={(e) => setParentMode(e.target.value)}
            className="px-3 py-1.5 rounded text-sm"
            style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: `1px solid ${themeColor}55` }}
          >
            {ALL_SCALES.filter(s => s.category === "mode").map(scale => (
              <option key={scale.name} value={scale.name}>{scale.name}</option>
            ))}
          </select>
          
          {/* Circle Mode Toggle */}
          <div className="flex rounded-lg overflow-hidden ml-4" style={{ border: `1px solid ${themeColor}55` }}>
            {([
              { key: "relative" as const, label: "Relative" },
              { key: "parallel" as const, label: "Parallel" },
              { key: "freeform" as const, label: "Freeform" },
            ]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleCircleModeChange(key)}
                className="px-3 py-1.5 text-xs font-semibold transition-all"
                style={{
                  backgroundColor: circleMode === key ? themeColor : "#3a3a4e",
                  color: circleMode === key ? "#000" : "#e0d6c8",
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Circle mode description */}
        <div className="text-center mt-2 text-xs text-gray-500">
          {circleMode === "relative" && "7 modes sharing the same notes (diatonic relatives)"}
          {circleMode === "parallel" && `7 modes all rooted on ${parentKey} (parallel modes — same root, different color)`}
          {circleMode === "freeform" && "Add any scale from the library — build custom harmonic paths"}
        </div>
      </div>
      
      {/* Modal Circle */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Circle Visualization */}
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-semibold mb-4" style={{ color: themeColor }}>
            {circleMode === "relative" ? "Modal Circle" : circleMode === "parallel" ? "Parallel Modes" : "Freeform Palette"}
          </h2>
          
          {/* Freeform: Add Scale button */}
          {circleMode === "freeform" && (
            <div className="w-full mb-4">
              <button
                onClick={() => setFreeformSearchOpen(!freeformSearchOpen)}
                className="w-full px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#22c55e33", color: "#22c55e", border: "1px solid #22c55e55" }}
              >
                + Add Scale to Circle
              </button>
              
              {/* Search Panel */}
              {freeformSearchOpen && (
                <div className="mt-2 rounded-lg p-3" style={{ backgroundColor: "#1a1a2e", border: "1px solid #555" }}>
                  <div className="flex gap-2 mb-2">
                    <select
                      value={freeformSearchRoot}
                      onChange={(e) => setFreeformSearchRoot(e.target.value)}
                      className="px-2 py-1 rounded text-xs"
                      style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: "1px solid #555" }}
                    >
                      {CHROMATIC_NOTES.map(note => (
                        <option key={note} value={note}>{note}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={freeformSearchQuery}
                      onChange={(e) => setFreeformSearchQuery(e.target.value)}
                      placeholder="Search scales... (name, emotion, progression)"
                      className="flex-1 px-3 py-1 rounded text-xs"
                      style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: "1px solid #555" }}
                      autoFocus
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {filteredScales.map(scale => (
                      <button
                        key={scale.name}
                        onClick={() => addFreeformNode(scale, freeformSearchRoot)}
                        className="w-full text-left px-3 py-1.5 rounded text-xs hover:opacity-80 transition-opacity flex justify-between items-center"
                        style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8" }}
                      >
                        <span>
                          <span className="font-semibold" style={{ color: themeColor }}>{freeformSearchRoot} {scale.name}</span>
                          <span className="text-gray-500 ml-2">({scale.category})</span>
                        </span>
                        {scale.progression && (
                          <span className="text-gray-500 text-[10px]">{scale.progression}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* SVG Circle */}
          {circleNodes.length > 0 ? (
            <div className="relative w-80 h-80 md:w-96 md:h-96">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Center label */}
                <text x="200" y="185" textAnchor="middle" fill={themeColor} fontSize="13" fontWeight="bold">
                  {circleMode === "freeform" ? "Freeform" : parentKey}
                </text>
                <text x="200" y="205" textAnchor="middle" fill="#999" fontSize="10">
                  {circleMode === "relative" ? parentMode : circleMode === "parallel" ? "Parallel" : `${circleNodes.length} nodes`}
                </text>
                
                {/* Connection lines */}
                {comparisonModeIndex !== null && circleNodes.length > 0 && (
                  <line
                    x1={200 + 120 * Math.cos((selectedModeIndex * 2 * Math.PI / circleNodes.length) - Math.PI / 2)}
                    y1={200 + 120 * Math.sin((selectedModeIndex * 2 * Math.PI / circleNodes.length) - Math.PI / 2)}
                    x2={200 + 120 * Math.cos((comparisonModeIndex * 2 * Math.PI / circleNodes.length) - Math.PI / 2)}
                    y2={200 + 120 * Math.sin((comparisonModeIndex * 2 * Math.PI / circleNodes.length) - Math.PI / 2)}
                    stroke={themeColor}
                    strokeWidth="2"
                    strokeDasharray="5,5"
                    opacity="0.6"
                  />
                )}
                
                {/* Mode nodes */}
                {circleNodes.map((mode, idx) => {
                  const angle = (idx * 2 * Math.PI / circleNodes.length) - Math.PI / 2;
                  const radius = circleNodes.length <= 7 ? 140 : circleNodes.length <= 12 ? 150 : 160;
                  const x = 200 + radius * Math.cos(angle);
                  const y = 200 + radius * Math.sin(angle);
                  const isSelected = idx === selectedModeIndex;
                  const isComparison = idx === comparisonModeIndex;
                  const isNudge = nudges.some(n => n.index === idx);
                  
                  return (
                    <g key={idx} style={{ cursor: "pointer" }}
                      onClick={() => {
                        if (idx === selectedModeIndex) return;
                        if (comparisonModeIndex === idx) {
                          setComparisonModeIndex(null);
                        } else {
                          setComparisonModeIndex(idx);
                        }
                      }}
                      onDoubleClick={() => setSelectedModeIndex(idx)}
                    >
                      {/* Outer ring for nudges */}
                      {isNudge && !isSelected && !isComparison && (
                        <circle cx={x} cy={y} r="38" fill="none" stroke={themeColor} strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
                      )}
                      
                      {/* Node circle */}
                      <circle
                        cx={x} cy={y}
                        r={isSelected ? 36 : isComparison ? 34 : 30}
                        fill={isSelected ? themeColor : isComparison ? "#4a6fa5" : "#3a3a4e"}
                        stroke={isSelected ? "#fbbf24" : isComparison ? "#6fa5d4" : isNudge ? themeColor : "#555"}
                        strokeWidth={isSelected || isComparison ? 3 : isNudge ? 2 : 1}
                      />
                      
                      {/* Root note */}
                      <text x={x} y={y - 6} textAnchor="middle" fill={isSelected ? "#000" : "#e0d6c8"} fontSize="11" fontWeight="bold">
                        {getRootFromName(mode.name)}
                      </text>
                      
                      {/* Mode name */}
                      <text x={x} y={y + 8} textAnchor="middle" fill={isSelected ? "#000" : "#aaa"} fontSize={circleNodes.length > 10 ? "7" : "9"}>
                        {getModeName(mode.name).substring(0, circleNodes.length > 10 ? 6 : 8)}
                      </text>
                      
                      {/* Degree number */}
                      <text x={x} y={y + 20} textAnchor="middle" fill={isSelected ? "#333" : "#666"} fontSize="8">
                        {idx + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            <div className="w-80 h-80 md:w-96 md:h-96 flex items-center justify-center rounded-lg" style={{ backgroundColor: "#2a2a3e" }}>
              <p className="text-sm text-gray-500 text-center px-4">
                {circleMode === "freeform" 
                  ? "Add scales above to build your harmonic palette" 
                  : "No modes available"
                }
              </p>
            </div>
          )}
          
          {/* Legend */}
          <div className="flex flex-wrap gap-3 mt-4 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: themeColor }}></span>
              Selected (dbl-click)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: "#4a6fa5" }}></span>
              Comparison (click)
            </span>
            {circleMode === "relative" && (
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full border border-dashed" style={{ borderColor: themeColor }}></span>
                Suggested
              </span>
            )}
          </div>
          
          {/* Freeform: node list with remove buttons */}
          {circleMode === "freeform" && freeformNodes.length > 0 && (
            <div className="mt-3 w-full max-w-sm">
              <div className="flex flex-wrap gap-1">
                {freeformNodes.map((node, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]"
                    style={{
                      backgroundColor: idx === selectedModeIndex ? themeColor + "33" : "#3a3a4e",
                      color: idx === selectedModeIndex ? themeColor : "#e0d6c8",
                      border: `1px solid ${idx === selectedModeIndex ? themeColor : "#555"}`,
                    }}
                  >
                    {node.name}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFreeformNode(idx); }}
                      className="text-red-400 hover:text-red-300 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Mode Details & Relationship Panel */}
        <div className="space-y-4">
          {/* Selected Mode Info */}
          {selectedMode && (
            <div className="rounded-lg p-4" style={{ backgroundColor: "#2a2a3e", border: `1px solid ${themeColor}33` }}>
              <h3 className="font-bold text-lg mb-2" style={{ color: themeColor }}>{selectedMode.name}</h3>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-400">Notes:</span> {selectedMode.notes.join(", ")}</p>
                <p><span className="text-gray-400">Intervals:</span> {selectedMode.intervals?.join(", ")}</p>
                <p><span className="text-gray-400">Emotion:</span> <span className="italic text-gray-300">{selectedMode.emotion}</span></p>
                {selectedMode.triads && <p><span className="text-gray-400">Triads:</span> {selectedMode.triads.join(", ")}</p>}
                {selectedMode.progression && <p><span className="text-gray-400">Progression:</span> {selectedMode.progression}</p>}
                {selectedMode.semitonePattern && <p><span className="text-gray-400">Pattern:</span> {selectedMode.semitonePattern}</p>}
              </div>
              
              {/* Nudges (only in Relative mode) */}
              {nudges.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <p className="text-xs text-gray-400 mb-1">Suggested transitions:</p>
                  <div className="flex flex-wrap gap-2">
                    {nudges.map(nudge => (
                      <button
                        key={nudge.name}
                        onClick={() => setComparisonModeIndex(nudge.index)}
                        className="px-2 py-1 rounded text-xs hover:opacity-80 transition-opacity"
                        style={{ backgroundColor: "#3a3a4e", color: themeColor, border: `1px solid ${themeColor}55` }}
                      >
                        → {nudge.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Chord Progression Visualizer */}
              {selectedMode?.triads && selectedMode?.progression && (() => {
                // Parse the progression string to get Roman numerals
                const progStr = selectedMode.progression!;
                // Get the primary progression (before "or" parenthetical)
                const primaryProg = progStr.includes("(or")
                  ? progStr.split("(or")[0].trim()
                  : progStr.includes(" or ")
                  ? progStr.split(" or ")[0].trim()
                  : progStr.trim();
                const altProgRaw = progStr.includes("(or ")
                  ? progStr.match(/\(or\s+(.+?)\)/)?.[1]?.trim() || null
                  : null;
                // Strip trailing descriptive text (e.g., "for pop", "jazz") after the last numeral
                const altProg = altProgRaw
                  ? altProgRaw.replace(/\s+(for\s+\w+|jazz|blues|rock|pop|classical)$/i, "").trim()
                  : null;
                
                // Map Roman numerals to degree indices
                const NUMERAL_MAP: Record<string, number> = {
                  "I": 0, "i": 0, "II": 1, "ii": 1, "III": 2, "iii": 2,
                  "IV": 3, "iv": 3, "V": 4, "v": 4, "VI": 5, "vi": 5,
                  "VII": 6, "vii": 6,
                  "bII": 1, "bii": 1, "bIII": 2, "biii": 2,
                  "bV": 4, "bv": 4, "bVI": 5, "bvi": 5, "bVII": 6, "bvii": 6,
                  "#IV": 3, "#iv": 3,
                };
                
                const parseNumerals = (prog: string) => {
                  return prog.split("-").map(numeral => {
                    const trimmed = numeral.trim();
                    const degreeIdx = NUMERAL_MAP[trimmed];
                    const isMinor = trimmed === trimmed.toLowerCase() || trimmed.startsWith("b") && trimmed.slice(1) === trimmed.slice(1).toLowerCase();
                    return {
                      numeral: trimmed,
                      degreeIndex: degreeIdx !== undefined ? degreeIdx : 0,
                      isMinor,
                    };
                  });
                };
                
                const primaryChords = parseNumerals(primaryProg);
                const altChords = altProg ? parseNumerals(altProg) : null;
                
                // Get chord notes from the triad name
                const getChordNotes = (triadName: string): string[] => {
                  // Parse chord name like "Cmaj", "Dmin", "Bdim", "F#dim"
                  const match = triadName.match(/^([A-G]#?)(.+)$/);
                  if (!match) return [];
                  const root = match[1];
                  const quality = match[2];
                  const rootIdx = CHROMATIC_NOTES.indexOf(root);
                  if (rootIdx === -1) return [root];
                  
                  if (quality === "maj") {
                    return [root, CHROMATIC_NOTES[(rootIdx + 4) % 12], CHROMATIC_NOTES[(rootIdx + 7) % 12]];
                  } else if (quality === "min") {
                    return [root, CHROMATIC_NOTES[(rootIdx + 3) % 12], CHROMATIC_NOTES[(rootIdx + 7) % 12]];
                  } else if (quality === "dim") {
                    return [root, CHROMATIC_NOTES[(rootIdx + 3) % 12], CHROMATIC_NOTES[(rootIdx + 6) % 12]];
                  } else if (quality === "aug") {
                    return [root, CHROMATIC_NOTES[(rootIdx + 4) % 12], CHROMATIC_NOTES[(rootIdx + 8) % 12]];
                  }
                  return [root];
                };
                
                const getQualityLabel = (triadName: string): string => {
                  if (triadName.endsWith("maj")) return "Major";
                  if (triadName.endsWith("min")) return "Minor";
                  if (triadName.endsWith("dim")) return "Dim";
                  if (triadName.endsWith("aug")) return "Aug";
                  return "";
                };
                
                const getQualityColor = (triadName: string): string => {
                  if (triadName.endsWith("maj")) return "#22c55e";
                  if (triadName.endsWith("min")) return "#6fa5d4";
                  if (triadName.endsWith("dim")) return "#ef4444";
                  if (triadName.endsWith("aug")) return "#f59e0b";
                  return "#888";
                };
                
                // Transpose triads to the actual root of the selected mode
                // The triads in the data are defined relative to C, so we need to transpose
                const transposeTriad = (triadName: string, semitones: number): string => {
                  const match = triadName.match(/^([A-G][b#]?)(.+)$/);
                  if (!match) return triadName;
                  const triadRoot = match[1];
                  const quality = match[2];
                  // Handle flats: convert to sharp equivalent for lookup
                  const flatToSharp: Record<string, string> = { "Db": "C#", "Eb": "D#", "Fb": "E", "Gb": "F#", "Ab": "G#", "Bb": "A#", "Cb": "B" };
                  const normalizedRoot = flatToSharp[triadRoot] || triadRoot;
                  const rootIdx = CHROMATIC_NOTES.indexOf(normalizedRoot);
                  if (rootIdx === -1) return triadName;
                  const newRoot = CHROMATIC_NOTES[(rootIdx + semitones) % 12];
                  return newRoot + quality;
                };
                
                // Calculate transposition: how many semitones from C to the mode's actual root
                const modeRoot = selectedMode.notes[0];
                const baseModeRoot = "C"; // All triads in data are defined relative to C
                const transposeSemitones = (CHROMATIC_NOTES.indexOf(modeRoot) - CHROMATIC_NOTES.indexOf(baseModeRoot) + 12) % 12;
                
                const triads = selectedMode.triads!.map(t => 
                  transposeSemitones === 0 ? t : transposeTriad(t, transposeSemitones)
                );
                
                return (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs text-gray-400 mb-2">Chord Progression:</p>
                    
                    {/* Primary progression with flow arrows */}
                    <div className="flex flex-wrap items-center gap-1 mb-3">
                      {primaryChords.map((chord, idx) => {
                        const triad = triads[chord.degreeIndex] || "?";
                        const isHighlighted = highlightedChordIndex === chord.degreeIndex;
                        const qualityColor = getQualityColor(triad);
                        return (
                          <React.Fragment key={idx}>
                            <button
                              onClick={() => setHighlightedChordIndex(isHighlighted ? null : chord.degreeIndex)}
                              className="relative px-3 py-2 rounded-lg text-center transition-all hover:scale-105 cursor-pointer"
                              style={{
                                backgroundColor: isHighlighted ? qualityColor + "33" : "#3a3a4e",
                                border: `2px solid ${isHighlighted ? qualityColor : "#555"}`,
                                boxShadow: isHighlighted ? `0 0 12px ${qualityColor}44` : "none",
                                minWidth: "60px",
                              }}
                            >
                              <span className="block text-xs font-bold" style={{ color: qualityColor }}>{chord.numeral}</span>
                              <span className="block text-[11px] font-semibold text-white">{triad}</span>
                              <span className="block text-[9px] text-gray-400">{getQualityLabel(triad)}</span>
                            </button>
                            {idx < primaryChords.length - 1 && (
                              <span className="text-gray-500 text-lg">→</span>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                    
                    {/* Alt progression */}
                    {altChords && (
                      <div className="mb-3">
                        <p className="text-[10px] text-gray-500 mb-1">Alternative:</p>
                        <div className="flex flex-wrap items-center gap-1">
                          {altChords.map((chord, idx) => {
                            const triad = triads[chord.degreeIndex] || "?";
                            const isHighlighted = highlightedChordIndex === chord.degreeIndex;
                            const qualityColor = getQualityColor(triad);
                            return (
                              <React.Fragment key={idx}>
                                <button
                                  onClick={() => setHighlightedChordIndex(isHighlighted ? null : chord.degreeIndex)}
                                  className="px-2 py-1 rounded text-center transition-all hover:scale-105 cursor-pointer"
                                  style={{
                                    backgroundColor: isHighlighted ? qualityColor + "22" : "#2a2a3e",
                                    border: `1px solid ${isHighlighted ? qualityColor : "#444"}`,
                                    minWidth: "44px",
                                  }}
                                >
                                  <span className="block text-[10px] font-bold" style={{ color: qualityColor }}>{chord.numeral}</span>
                                  <span className="block text-[9px] text-white">{triad}</span>
                                </button>
                                {idx < altChords.length - 1 && (
                                  <span className="text-gray-600 text-sm">→</span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Highlighted chord detail */}
                    {highlightedChordIndex !== null && triads[highlightedChordIndex] && (() => {
                      const triad = triads[highlightedChordIndex];
                      const notes = getChordNotes(triad);
                      const qualityColor = getQualityColor(triad);
                      return (
                        <div className="rounded-lg p-3 mt-2" style={{ backgroundColor: "#1a1a2e", border: `1px solid ${qualityColor}44` }}>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-bold" style={{ color: qualityColor }}>{triad}</span>
                            <span className="text-xs text-gray-400">— Degree {highlightedChordIndex + 1} ({getQualityLabel(triad)})</span>
                          </div>
                          <div className="flex gap-1">
                            {notes.map(note => (
                              <span
                                key={note}
                                className="px-2 py-1 rounded text-xs font-mono font-bold"
                                style={{
                                  backgroundColor: qualityColor + "22",
                                  color: qualityColor,
                                  border: `1px solid ${qualityColor}55`,
                                }}
                              >
                                {note}
                              </span>
                            ))}
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {notes.length === 3 ? `Root: ${notes[0]} • Third: ${notes[1]} • Fifth: ${notes[2]}` : ""}
                          </p>
                        </div>
                      );
                    })()}
                    
                    {/* All triads grid */}
                    <div className="mt-3 pt-2 border-t border-gray-800">
                      <p className="text-[10px] text-gray-500 mb-1.5">All scale degree triads:</p>
                      <div className="grid grid-cols-4 gap-1">
                        {triads.map((triad, idx) => {
                          const qualityColor = getQualityColor(triad);
                          const isHighlighted = highlightedChordIndex === idx;
                          const isInProgression = primaryChords.some(c => c.degreeIndex === idx);
                          return (
                            <button
                              key={idx}
                              onClick={() => setHighlightedChordIndex(isHighlighted ? null : idx)}
                              className="px-1.5 py-1 rounded text-center transition-all hover:scale-105 cursor-pointer"
                              style={{
                                backgroundColor: isHighlighted ? qualityColor + "33" : isInProgression ? "#3a3a4e" : "#252535",
                                border: `1px solid ${isHighlighted ? qualityColor : isInProgression ? qualityColor + "55" : "#333"}`,
                                opacity: isInProgression || isHighlighted ? 1 : 0.6,
                              }}
                            >
                              <span className="block text-[9px] text-gray-400">{["I","II","III","IV","V","VI","VII","VIII"][idx]}</span>
                              <span className="block text-[10px] font-semibold" style={{ color: qualityColor }}>{triad}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
          
          {/* Relationship Analysis */}
          {relationship && comparisonMode && (
            <div className="rounded-lg p-4" style={{ backgroundColor: "#1e2a3e", border: "1px solid #4a6fa533" }}>
              <h3 className="font-bold mb-2" style={{ color: "#6fa5d4" }}>
                {selectedMode?.name} → {comparisonMode.name}
              </h3>
              
              <div className="space-y-3 text-sm">
                {/* Tension/Resolution meters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Tension</p>
                    <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${relationship.tensionLevel * 10}%`,
                          backgroundColor: relationship.tensionLevel > 7 ? "#ef4444" : relationship.tensionLevel > 4 ? "#f59e0b" : "#22c55e",
                        }}
                      />
                    </div>
                    <p className="text-xs text-right mt-0.5" style={{ color: relationship.tensionLevel > 7 ? "#ef4444" : relationship.tensionLevel > 4 ? "#f59e0b" : "#22c55e" }}>
                      {relationship.tensionLevel}/10
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Resolution</p>
                    <div className="h-2 rounded-full bg-gray-700 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${relationship.resolutionStrength * 10}%`,
                          backgroundColor: relationship.resolutionStrength > 7 ? "#22c55e" : relationship.resolutionStrength > 4 ? "#6fa5d4" : "#888",
                        }}
                      />
                    </div>
                    <p className="text-xs text-right mt-0.5" style={{ color: relationship.resolutionStrength > 7 ? "#22c55e" : relationship.resolutionStrength > 4 ? "#6fa5d4" : "#888" }}>
                      {relationship.resolutionStrength}/10
                    </p>
                  </div>
                </div>
                
                {/* Note comparison */}
                <div>
                  <p className="text-xs text-gray-400 mb-1">Common Notes (stability):</p>
                  <div className="flex flex-wrap gap-1">
                    {relationship.commonNotes.map(note => (
                      <span key={note} className="px-2 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "#22c55e22", color: "#22c55e", border: "1px solid #22c55e44" }}>
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <p className="text-xs text-gray-400 mb-1">Unique Notes (tension/color):</p>
                  <div className="flex flex-wrap gap-1">
                    {relationship.uniqueNotes.map(note => (
                      <span key={note} className="px-2 py-0.5 rounded text-xs font-mono" style={{ backgroundColor: "#ef444422", color: "#ef4444", border: "1px solid #ef444444" }}>
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Suggestion */}
                <p className="text-xs italic pt-2 border-t border-gray-700" style={{ color: themeColor }}>
                  {relationship.suggestion}
                </p>
              </div>
            </div>
          )}
          
          {!comparisonMode && selectedMode && (
            <div className="rounded-lg p-4 text-center text-sm text-gray-500" style={{ backgroundColor: "#2a2a3e" }}>
              Click another mode on the circle to compare relationships
            </div>
          )}
        </div>
      </div>
      
      {/* Journey Timeline */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="rounded-lg p-4 md:p-6" style={{ backgroundColor: "#2a2a3e", border: `1px solid ${themeColor}33` }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold" style={{ color: themeColor }}>Journey Timeline</h2>
            
            <div className="flex flex-wrap gap-2 items-center">
              <input
                type="text"
                value={songName}
                onChange={(e) => setSongName(e.target.value)}
                placeholder="Song Name"
                className="px-3 py-1.5 rounded text-sm w-48"
                style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: `1px solid ${themeColor}55` }}
              />
              <input
                type="number"
                value={tempo}
                onChange={(e) => setTempo(Number(e.target.value))}
                className="px-2 py-1.5 rounded text-sm w-16"
                style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: `1px solid ${themeColor}55` }}
                min={40}
                max={240}
              />
              <span className="text-xs text-gray-400">BPM</span>
              <select
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value)}
                className="px-2 py-1.5 rounded text-sm"
                style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: `1px solid ${themeColor}55` }}
                title="Default time signature for new blocks"
              >
                {TIME_SIGNATURES.map(ts => (
                  <option key={ts} value={ts}>{ts}</option>
                ))}
              </select>
              <span className="text-[10px] text-gray-500">(default)</span>
            </div>
          </div>
          
          {/* Template selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="px-3 py-1.5 rounded text-sm"
              style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: `1px solid ${themeColor}55` }}
            >
              {Object.keys(JOURNEY_TEMPLATES).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
            <button
              onClick={() => initializeJourney(selectedTemplate)}
              className="px-4 py-1.5 rounded text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ backgroundColor: themeColor, color: "#000" }}
            >
              {selectedTemplate === "Custom" ? "Start Custom" : "Initialize"}
            </button>
            <button
              onClick={() => addBlock("verse")}
              className="px-3 py-1.5 rounded text-sm font-semibold hover:opacity-80 transition-opacity"
              style={{ backgroundColor: "#4a6fa5", color: "#fff" }}
              title="Add a new section block"
            >
              + Add Section
            </button>
            {journeyBlocks.length > 0 && (
              <button
                onClick={exportSongMaker}
                className="px-4 py-1.5 rounded text-sm font-semibold hover:opacity-80 transition-opacity ml-auto"
                style={{ backgroundColor: "#22c55e", color: "#000" }}
              >
                Export SongMaker JSON
              </button>
            )}
          </div>
          
          {/* Timeline blocks */}
          {journeyBlocks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm">
              {selectedTemplate === "Custom" 
                ? "Click \"+ Add Section\" to start building your custom journey"
                : "Select a template and click \"Initialize\" to start building your journey"
              }
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {journeyBlocks.map((block, idx) => (
                <div
                  key={block.id}
                  className="rounded-lg p-3 flex flex-wrap gap-2 items-center text-sm"
                  style={{ backgroundColor: "#1a1a2e", border: "1px solid #444" }}
                >
                  <span className="text-xs font-mono text-gray-500 w-6">{idx + 1}</span>
                  
                  {/* Section type */}
                  <select
                    value={block.type}
                    onChange={(e) => updateBlock(block.id, "type", e.target.value)}
                    className="px-2 py-1 rounded text-xs"
                    style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: "1px solid #555" }}
                  >
                    {SECTION_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  
                  {/* Measures */}
                  <select
                    value={block.measures}
                    onChange={(e) => updateBlock(block.id, "measures", Number(e.target.value))}
                    className="px-2 py-1 rounded text-xs w-14"
                    style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: "1px solid #555" }}
                  >
                    {[2, 4, 8, 12, 16].map(m => (
                      <option key={m} value={m}>{m} bars</option>
                    ))}
                  </select>
                  
                  {/* Root + Mode display */}
                  <span className="px-2 py-1 rounded text-xs font-semibold" style={{ backgroundColor: themeColor + "33", color: themeColor }}>
                    {block.rootNote} {block.mode}
                  </span>
                  
                  {/* Assign button */}
                  <button
                    onClick={() => assignModeToBlock(block.id)}
                    className="px-2 py-1 rounded text-xs hover:opacity-80"
                    style={{ backgroundColor: "#4a6fa533", color: "#6fa5d4", border: "1px solid #4a6fa555" }}
                    title="Assign selected mode from circle"
                  >
                    ← Assign
                  </button>
                  
                  {/* Feel */}
                  <input
                    type="text"
                    value={block.feel}
                    onChange={(e) => updateBlock(block.id, "feel", e.target.value)}
                    placeholder="Feel..."
                    className="px-2 py-1 rounded text-xs flex-1 min-w-24"
                    style={{ backgroundColor: "#3a3a4e", color: "#e0d6c8", border: "1px solid #555" }}
                  />
                  
                  {/* Per-instrument energy + time signature */}
                  <div className="flex flex-col gap-0.5 ml-auto">
                    {[
                      { eKey: "energy_drummer" as const, tsKey: "ts_drummer" as const, label: "D", color: "#ef4444" },
                      { eKey: "energy_bassist" as const, tsKey: "ts_bassist" as const, label: "B", color: "#f59e0b" },
                      { eKey: "energy_guitarist" as const, tsKey: "ts_guitarist" as const, label: "G", color: "#22c55e" },
                      { eKey: "energy_keyboardist" as const, tsKey: "ts_keyboardist" as const, label: "K", color: "#6fa5d4" },
                      { eKey: "energy_vocalist" as const, tsKey: "ts_vocalist" as const, label: "V", color: "#a855f7" },
                    ].map(({ eKey, tsKey, label, color }) => (
                      <div key={eKey} className="flex items-center gap-1">
                        <span className="text-[9px] w-3 text-right font-mono" style={{ color }}>{label}</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={block[eKey]}
                          onChange={(e) => updateBlock(block.id, eKey, Number(e.target.value))}
                          className="w-14 h-1 accent-current"
                          style={{ accentColor: color }}
                        />
                        <span className="text-[9px] w-3 font-mono" style={{ color }}>{block[eKey]}</span>
                        <select
                          value={block[tsKey]}
                          onChange={(e) => updateBlock(block.id, tsKey, e.target.value)}
                          className="text-[9px] px-0.5 py-0 rounded h-4"
                          style={{ backgroundColor: "#3a3a4e", color, border: `1px solid ${color}44`, minWidth: "32px" }}
                        >
                          {TIME_SIGNATURES.map(ts => (
                            <option key={ts} value={ts}>{ts}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  
                  {/* Remove */}
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="px-1.5 py-0.5 rounded text-xs text-red-400 hover:bg-red-900/30"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Energy Arc Visualization */}
      {journeyBlocks.length > 0 && (
        <div className="max-w-6xl mx-auto mb-8">
          <div className="rounded-lg p-4" style={{ backgroundColor: "#2a2a3e", border: `1px solid ${themeColor}33` }}>
            <h3 className="text-sm font-semibold mb-3" style={{ color: themeColor }}>Energy Arc</h3>
            <svg viewBox={`0 0 ${journeyBlocks.length * 80} 100`} className="w-full h-20">
              {/* Grid lines */}
              {[2, 4, 6, 8, 10].map(level => (
                <line
                  key={level}
                  x1="0"
                  y1={100 - level * 10}
                  x2={journeyBlocks.length * 80}
                  y2={100 - level * 10}
                  stroke="#333"
                  strokeWidth="0.5"
                />
              ))}
              
              {/* Energy lines */}
              {["energy_drummer", "energy_bassist", "energy_guitarist", "energy_keyboardist", "energy_vocalist"].map((role, roleIdx) => {
                const colors = ["#ef4444", "#f59e0b", "#22c55e", "#6fa5d4", "#a855f7"];
                const points = journeyBlocks.map((block, idx) => {
                  const x = idx * 80 + 40;
                  const y = 100 - (block[role as keyof JourneyBlock] as number) * 10;
                  return `${x},${y}`;
                }).join(" ");
                
                return (
                  <polyline
                    key={role}
                    points={points}
                    fill="none"
                    stroke={colors[roleIdx]}
                    strokeWidth="1.5"
                    opacity="0.7"
                  />
                );
              })}
              
              {/* Section labels */}
              {journeyBlocks.map((block, idx) => (
                <text
                  key={idx}
                  x={idx * 80 + 40}
                  y="98"
                  textAnchor="middle"
                  fill="#666"
                  fontSize="8"
                >
                  {block.type.substring(0, 4)}
                </text>
              ))}
            </svg>
            
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2 text-xs">
              {[
                { label: "Drums", color: "#ef4444" },
                { label: "Bass", color: "#f59e0b" },
                { label: "Guitar", color: "#22c55e" },
                { label: "Keys", color: "#6fa5d4" },
                { label: "Vocals", color: "#a855f7" },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1">
                  <span className="w-3 h-0.5 inline-block" style={{ backgroundColor: item.color }}></span>
                  {item.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
