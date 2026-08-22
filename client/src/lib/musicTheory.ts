/*
 * Music Theory Database
 * Contains all standard scales, modes, and patterns for detection
 * Normalized to C for comparison (transposition-agnostic)
 */

export interface ScalePattern {
  name: string;
  notes: string[]; // Normalized to C
  intervals: string[]; // e.g., ["Root", "Major 2nd", "Major 3rd", ...]
  emotion: string;
  category: "mode" | "scale" | "pentatonic" | "blues" | "exotic";
  triads?: string[]; // Chord names for each scale degree
  progression?: string; // Common chord progression
  semitonePattern?: string; // W-W-H-W-W-W-H format
}

// All notes in chromatic scale
export const CHROMATIC_NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Interval names for reference
const INTERVAL_NAMES = [
  "Root",
  "Minor 2nd",
  "Major 2nd",
  "Minor 3rd",
  "Major 3rd",
  "Perfect 4th",
  "Tritone",
  "Perfect 5th",
  "Minor 6th",
  "Major 6th",
  "Minor 7th",
  "Major 7th",
];

// Convert semitone intervals to note names (starting from C)
function intervalsToNotes(semitones: number[]): string[] {
  return semitones.map((semitone) => CHROMATIC_NOTES[semitone % 12]);
}

// Get interval names from semitone intervals
function getIntervalNames(semitones: number[]): string[] {
  return semitones.map((semitone) => INTERVAL_NAMES[semitone % 12]);
}

// Modes (7 modes of the major scale)
const MODES: ScalePattern[] = [
  {
    name: "Ionian (Major)",
    notes: intervalsToNotes([0, 2, 4, 5, 7, 9, 11]),
    intervals: getIntervalNames([0, 2, 4, 5, 7, 9, 11]),
    emotion: "Bright, happy, triumphant, confident, resolute, celebratory, heroic, optimistic, victorious, radiant, joyful, affirming, uplifting, majestic, golden",
    category: "mode",
    triads: ["Cmaj", "Dmin", "Emin", "Fmaj", "Gmaj", "Amin", "Bdim"],
    progression: "I-IV-V (or I-vi-IV-V for pop)",
    semitonePattern: "W-W-H-W-W-W-H",
  },
  {
    name: "Dorian",
    notes: intervalsToNotes([0, 2, 3, 5, 7, 9, 10]),
    intervals: getIntervalNames([0, 2, 3, 5, 7, 9, 10]),
    emotion: "Jazzy, mellow, introspective, soulful, contemplative, sophisticated, groovy, laid-back, cool, understated, reflective, poetic, wandering, mysterious-yet-warm",
    category: "mode",
    triads: ["Cmin", "Dmin", "Ebmaj", "Fmaj", "Gmin", "Adim", "Bbmaj"],
    progression: "i-IV-V (or ii-V-I jazz)",
    semitonePattern: "W-H-W-W-W-H-W",
  },
  {
    name: "Phrygian",
    notes: intervalsToNotes([0, 1, 3, 5, 7, 8, 10]),
    intervals: getIntervalNames([0, 1, 3, 5, 7, 8, 10]),
    emotion: "Dark, Spanish, exotic, passionate, flamenco-tinged, mysterious, sensual, dramatic, intense, brooding, earthy, primal, haunting, fiery, melancholic",
    category: "mode",
    triads: ["Cmin", "Dbmaj", "Ebmaj", "Fmin", "Gdim", "Abmaj", "Bbmin"],
    progression: "i-bII-V (or i-bII-VII)",
    semitonePattern: "H-W-W-W-H-W-W",
  },
  {
    name: "Lydian",
    notes: intervalsToNotes([0, 2, 4, 6, 7, 9, 11]),
    intervals: getIntervalNames([0, 2, 4, 6, 7, 9, 11]),
    emotion: "Bright, ethereal, dreamy, whimsical, celestial, magical, uplifting, hopeful, transcendent, luminous, enchanting, surreal, optimistic, airy, expansive",
    category: "mode",
    triads: ["Cmaj", "Dmaj", "Emin", "F#dim", "Gmaj", "Amin", "Bmin"],
    progression: "I-II-V (or I-bVI-IV)",
    semitonePattern: "W-W-W-H-W-W-H",
  },
  {
    name: "Mixolydian",
    notes: intervalsToNotes([0, 2, 4, 5, 7, 9, 10]),
    intervals: getIntervalNames([0, 2, 4, 5, 7, 9, 10]),
    emotion: "Bluesy, funky, soulful, groovy, upbeat, energetic, playful, slightly dark, rock-oriented, jazzy, swaggering, confident, rebellious, edgy",
    category: "mode",
    triads: ["Cmaj", "Dmin", "Emin", "Fmaj", "Gmin", "Adim", "Bbmaj"],
    progression: "I-IV-I (or V-IV-I)",
    semitonePattern: "W-W-H-W-W-H-W",
  },
  {
    name: "Aeolian (Natural Minor)",
    notes: intervalsToNotes([0, 2, 3, 5, 7, 8, 10]),
    intervals: getIntervalNames([0, 2, 3, 5, 7, 8, 10]),
    emotion: "Dark, melancholic, introspective, sad, contemplative, mournful, emotional, introspective, minor-key, somber, reflective, poignant, wistful, sorrowful",
    category: "mode",
    triads: ["Cmin", "Ddim", "Ebmaj", "Fmin", "Gmin", "Abmaj", "Bbmaj"],
    progression: "i-VII-VI (or i-iv-V)",
    semitonePattern: "W-H-W-W-H-W-W",
  },
  {
    name: "Locrian",
    notes: intervalsToNotes([0, 1, 3, 5, 6, 8, 10]),
    intervals: getIntervalNames([0, 1, 3, 5, 6, 8, 10]),
    emotion: "Dark, tense, unstable, anxious, unsettling, disorienting, fragile, precarious, ominous, eerie, haunting, dystopian, claustrophobic, dissonant, disturbing",
    category: "mode",
    triads: ["Cmin", "Dbmaj", "Ebmin", "Fmin", "Gbmaj", "Abmaj", "Bbdim"],
    progression: "i-bII-i (or i-bV-bVI)",
    semitonePattern: "H-W-W-H-W-W-W",
  },
];

// Other scales
const OTHER_SCALES: ScalePattern[] = [
  {
    name: "Harmonic Minor",
    notes: intervalsToNotes([0, 2, 3, 5, 7, 8, 11]),
    intervals: getIntervalNames([0, 2, 3, 5, 7, 8, 11]),
    emotion: "Dark, dramatic, classical, intense, mysterious, exotic, minor-key, emotional, powerful, haunting, sophisticated, romantic, operatic",
    category: "scale",
    triads: ["Cmin", "Ddim", "Ebmaj", "Fmin", "Gmaj", "Abmaj", "Bb#dim"],
    progression: "i-iv-V (or i-VII-VI)",
    semitonePattern: "W-H-W-W-H-W+H-H",
  },
  {
    name: "Melodic Minor",
    notes: intervalsToNotes([0, 2, 3, 5, 7, 9, 11]),
    intervals: getIntervalNames([0, 2, 3, 5, 7, 9, 11]),
    emotion: "Sophisticated, jazzy, classical, introspective, emotional, lyrical, expressive, modern, refined, contemplative, nuanced, complex",
    category: "scale",
    triads: ["Cmin", "Dmin", "Ebmaj", "Fmaj", "Gmaj", "Adim", "B#dim"],
    progression: "i-IV-V (or i-ii-V)",
    semitonePattern: "W-H-W-W-W-W-H",
  },
  {
    name: "Harmonic Major",
    notes: intervalsToNotes([0, 2, 4, 5, 7, 8, 11]),
    intervals: getIntervalNames([0, 2, 4, 5, 7, 8, 11]),
    emotion: "Exotic, mysterious, classical, dramatic, unusual, sophisticated, dark-major, complex, introspective, uncommon, refined",
    category: "scale",
    triads: ["Cmaj", "Dmin", "Emin", "Fmaj", "Gmaj", "Abmaj", "Bb#dim"],
    progression: "I-IV-V (or I-vi-IV)",
    semitonePattern: "W-W-H-W-H-W+H-H",
  },
  {
    name: "Neapolitan Minor",
    notes: intervalsToNotes([0, 1, 3, 5, 7, 8, 11]),
    intervals: getIntervalNames([0, 1, 3, 5, 7, 8, 11]),
    emotion: "Dark, exotic, classical, mysterious, dramatic, unusual, rare, sophisticated, intense, haunting, complex, uncommon",
    category: "scale",
    triads: ["Cmin", "Dbmaj", "Ebmaj", "Fmin", "Gmaj", "Abmaj", "Bb#dim"],
    progression: "i-bII-V (or i-iv-V)",
    semitonePattern: "H-W-W-W-H-W+H-H",
  },
  {
    name: "Whole Tone",
    notes: intervalsToNotes([0, 2, 4, 6, 8, 10]),
    intervals: getIntervalNames([0, 2, 4, 6, 8, 10]),
    emotion: "Surreal, abstract, impressionistic, dreamlike, unsettling, avant-garde, modern, dissonant, ethereal, otherworldly, experimental, ambiguous",
    category: "scale",
    triads: ["Caug", "Daug", "Eaug", "F#aug", "G#aug", "A#aug"],
    progression: "I-II-III (or I-III-V)",
    semitonePattern: "W-W-W-W-W-W",
  },
  {
    name: "Diminished (Half-Whole)",
    notes: intervalsToNotes([0, 1, 3, 4, 6, 7, 9, 10]),
    intervals: getIntervalNames([0, 1, 3, 4, 6, 7, 9, 10]),
    emotion: "Tense, dark, unsettling, mysterious, dramatic, symmetrical, jazz-oriented, dissonant, complex, sophisticated, intricate, unusual",
    category: "scale",
    triads: ["Cdim", "Dbdim", "Ebdim", "Fdim"],
    progression: "i-bII-i (or i-iv-VII)",
    semitonePattern: "H-W-H-W-H-W-H-W",
  },
  {
    name: "Diminished (Whole-Half)",
    notes: intervalsToNotes([0, 2, 3, 5, 6, 8, 9, 11]),
    intervals: getIntervalNames([0, 2, 3, 5, 6, 8, 9, 11]),
    emotion: "Tense, dark, mysterious, dramatic, symmetrical, jazz-oriented, dissonant, complex, sophisticated, intricate, unusual, edgy",
    category: "scale",
    triads: ["Cmaj", "Dmin", "Emin", "Fmaj"],
    progression: "I-ii-III (or I-IV-V)",
    semitonePattern: "W-H-W-H-W-H-W-H",
  },
  {
    name: "Augmented",
    notes: intervalsToNotes([0, 3, 4, 7, 8, 11]),
    intervals: getIntervalNames([0, 3, 4, 7, 8, 11]),
    emotion: "Surreal, abstract, mysterious, unsettling, dreamlike, symmetrical, unusual, dissonant, ethereal, experimental, ambiguous, complex",
    category: "scale",
    triads: ["Caug", "Eaug", "G#aug"],
    progression: "I-III-V (or I-bIII-V)",
    semitonePattern: "W+H-H-W+H-H-W+H",
  },
  {
    name: "Major Pentatonic",
    notes: intervalsToNotes([0, 2, 4, 7, 9]),
    intervals: getIntervalNames([0, 2, 4, 7, 9]),
    emotion: "Bright, simple, folk-like, uplifting, accessible, warm, open, melodic, straightforward, cheerful, natural, timeless, universal",
    category: "pentatonic",
    triads: ["Cmaj", "Dmin", "Gmin"],
    progression: "I-IV-V (or I-V-IV)",
    semitonePattern: "W-W-W+H-W-W+H",
  },
  {
    name: "Minor Pentatonic",
    notes: intervalsToNotes([0, 3, 5, 7, 10]),
    intervals: getIntervalNames([0, 3, 5, 7, 10]),
    emotion: "Dark, bluesy, soulful, introspective, simple, accessible, melancholic, moody, raw, earthy, primal, universal, expressive",
    category: "pentatonic",
    triads: ["Cmin", "Ebmaj", "Gmin"],
    progression: "i-IV-i (or i-bVI-V)",
    semitonePattern: "W+H-W-W-W+H-W",
  },
  {
    name: "Egyptian Pentatonic",
    notes: intervalsToNotes([0, 2, 5, 7, 10]),
    intervals: getIntervalNames([0, 2, 5, 7, 10]),
    emotion: "Exotic, ancient, mysterious, earthy, primal, folk-like, open, sparse, meditative, transcendent, timeless, cultural, unique",
    category: "pentatonic",
    triads: ["Csus2", "Fsus2", "Gmin"],
    progression: "I-IV-i (or i-IV-V)",
    semitonePattern: "W-W+H-W-W+H-W",
  },
  {
    name: "Yo Pentatonic",
    notes: intervalsToNotes([0, 3, 5, 7, 10]),
    intervals: getIntervalNames([0, 3, 5, 7, 10]),
    emotion: "Asian, meditative, sparse, mysterious, contemplative, open, ethereal, peaceful, introspective, minimalist, transcendent, unique, cultural",
    category: "pentatonic",
    triads: ["Cmin", "Ebmaj", "Gmin"],
    progression: "i-bVI-i (or i-IV-V)",
    semitonePattern: "W+H-W-W-W+H-W",
  },
  {
    name: "Blues Scale",
    notes: intervalsToNotes([0, 3, 5, 6, 7, 10]),
    intervals: getIntervalNames([0, 3, 5, 6, 7, 10]),
    emotion: "Bluesy, soulful, gritty, raw, emotional, expressive, jazzy, funky, introspective, earthy, powerful, authentic, melancholic-yet-hopeful",
    category: "blues",
    triads: ["Cmin", "Ebmaj", "Gmin"],
    progression: "i-IV-i (or I-IV-I)",
    semitonePattern: "W+H-W-H-H-W+H-W",
  },
  {
    name: "Spanish Phrygian",
    notes: intervalsToNotes([0, 1, 3, 5, 7, 8, 10]),
    intervals: getIntervalNames([0, 1, 3, 5, 7, 8, 10]),
    emotion: "Spanish, flamenco, passionate, dark, exotic, intense, dramatic, fiery, sensual, earthy, primal, mysterious, cultural, vibrant",
    category: "exotic",
    triads: ["Cmin", "Dbmaj", "Ebmaj"],
    progression: "i-bII-V (or i-bII-VII)",
    semitonePattern: "H-W-W-W-H-W-W",
  },
  {
    name: "Jazz Minor",
    notes: intervalsToNotes([0, 2, 3, 5, 7, 9, 11]),
    intervals: getIntervalNames([0, 2, 3, 5, 7, 9, 11]),
    emotion: "Sophisticated, jazzy, modern, complex, refined, expressive, lyrical, introspective, intellectual, contemporary, nuanced, dynamic",
    category: "exotic",
    triads: ["Cmin", "Dmin", "Ebmaj", "Fmaj"],
    progression: "i-ii-V (or i-IV-V)",
    semitonePattern: "W-H-W-W-W-W-H",
  },
  {
    name: "Japanese Pentatonic",
    notes: intervalsToNotes([0, 1, 5, 7, 10]),
    intervals: getIntervalNames([0, 1, 5, 7, 10]),
    emotion: "Asian, meditative, mysterious, sparse, contemplative, ethereal, peaceful, introspective, minimalist, transcendent, cultural, unique, zen",
    category: "exotic",
    triads: ["Cmin", "Fmaj", "Gmin"],
    progression: "i-IV-i (or i-V-i)",
    semitonePattern: "H-W+H-W-W+H-W",
  },
  {
    name: "Indian Raga Bhairav",
    notes: intervalsToNotes([0, 1, 4, 5, 7, 8, 11]),
    intervals: getIntervalNames([0, 1, 4, 5, 7, 8, 11]),
    emotion: "Indian, exotic, spiritual, meditative, mysterious, complex, intricate, cultural, unique, transcendent, introspective, philosophical",
    category: "exotic",
    triads: ["Cmaj", "Dmin", "Emin", "Fmaj"],
    progression: "I-ii-V (or I-IV-V)",
    semitonePattern: "H-W+H-H-W-H-W+H",
  },
];

// Combine all scales
export const ALL_SCALES: ScalePattern[] = [...MODES, ...OTHER_SCALES];

export function detectScale(selectedNotes: string[]): ScalePattern | null {
  if (selectedNotes.length === 0) return null;

  // Normalize selected notes: find the root (lowest note) and transpose all to C
  const noteIndices = selectedNotes.map((note) => CHROMATIC_NOTES.indexOf(note)).filter((i) => i >= 0);

  if (noteIndices.length === 0) return null;

  // Remove duplicates and sort
  const uniqueIndices = Array.from(new Set(noteIndices)).sort((a, b) => a - b);

  // Calculate intervals from the lowest note
  const lowestNote = uniqueIndices[0];
  const normalizedIntervals = uniqueIndices.map((idx) => (idx - lowestNote + 12) % 12).sort((a, b) => a - b);

  // First pass: Search for exact matches
  for (const scale of ALL_SCALES) {
    const scaleIndices = scale.notes.map((note) => CHROMATIC_NOTES.indexOf(note)).sort((a, b) => a - b);
    const scaleIntervals = scaleIndices.map((idx) => (idx - scaleIndices[0] + 12) % 12).sort((a, b) => a - b);

    // Check if normalized intervals match scale intervals exactly
    if (JSON.stringify(normalizedIntervals) === JSON.stringify(scaleIntervals)) {
      return scale;
    }
  }

  // Second pass: Search for partial matches (user selected a subset of a scale)
  // Prioritize by: 1) all notes match, 2) fewest extra notes, 3) order in ALL_SCALES
  let bestMatch: ScalePattern | null = null;
  let bestExtraCount = Infinity;

  for (const scale of ALL_SCALES) {
    const scaleIntervals = new Set(
      scale.notes.map((note) => CHROMATIC_NOTES.indexOf(note)).map((idx) => (idx - lowestNote + 12) % 12)
    );

    // Check if all selected notes are in this scale
    const allMatch = normalizedIntervals.every((interval) => scaleIntervals.has(interval));

    if (allMatch) {
      const extraCount = scaleIntervals.size - normalizedIntervals.length;
      if (extraCount < bestExtraCount) {
        bestMatch = scale;
        bestExtraCount = extraCount;
      }
    }
  }

  return bestMatch;
}

/**
 * Get all possible scales that contain the selected notes
 * Useful for showing "close matches" or suggestions
 */
export function getSuggestedScales(selectedNotes: string[]): ScalePattern[] {
  if (selectedNotes.length === 0) return [];

  const noteSet = new Set(selectedNotes);
  const suggested = ALL_SCALES.filter((scale) => {
    const scaleNotes = new Set(scale.notes);
    // Check if all selected notes are in the scale
    return Array.from(noteSet).every((note) => scaleNotes.has(note));
  });

  // Sort by how many extra notes the scale has (fewer = closer match)
  return suggested.sort((a, b) => {
    const aExtra = a.notes.length - selectedNotes.length;
    const bExtra = b.notes.length - selectedNotes.length;
    return aExtra - bExtra;
  });
}


/**
 * Chord detection - identify chord names from selected notes
 * Returns the most likely chord name based on note intervals
 */
export interface ChordMatch {
  name: string;
  root: string;
  type: string;
  quality: string; // e.g., "Major", "Minor", "Dominant", etc.
}

// Common chord patterns (intervals from root)
const CHORD_PATTERNS: Record<string, number[]> = {
  "Major": [0, 4, 7],
  "Minor": [0, 3, 7],
  "Diminished": [0, 3, 6],
  "Augmented": [0, 4, 8],
  "Major 7": [0, 4, 7, 11],
  "Minor 7": [0, 3, 7, 10],
  "Dominant 7": [0, 4, 7, 10],
  "Half-Diminished 7": [0, 3, 6, 10],
  "Sus2": [0, 2, 7],
  "Sus4": [0, 5, 7],
  "Add9": [0, 4, 7, 2],
  "Minor Add9": [0, 3, 7, 2],
};

export function detectChord(selectedNotes: string[]): ChordMatch | null {
  if (selectedNotes.length < 3) return null;

  const chords: ChordMatch[] = [];
  const seen = new Set<string>();

  // Try each note as potential root
  for (const potentialRoot of selectedNotes) {
    const rootIdx = CHROMATIC_NOTES.indexOf(potentialRoot);
    if (rootIdx === -1) continue;

    // Calculate intervals from this root
    const intervals = selectedNotes.map((note) => {
      const noteIdx = CHROMATIC_NOTES.indexOf(note);
      let interval = (noteIdx - rootIdx + 12) % 12;
      return interval;
    }).sort((a, b) => a - b);

    // Try to match against known chord patterns
    for (const [chordType, pattern] of Object.entries(CHORD_PATTERNS)) {
      const patternSet = new Set(pattern);
      const intervalsSet = new Set(intervals);
      
      const isMatch = Array.from(patternSet).every(interval => intervalsSet.has(interval));
      
      if (isMatch) {
        const chordName = `${potentialRoot}${chordType}`;
        if (!seen.has(chordName)) {
          seen.add(chordName);
          chords.push({
            name: chordName,
            root: potentialRoot,
            type: chordType,
            quality: chordType,
          });
        }
      }
    }
  }

  return chords.length > 0 ? chords[0] : null;
}

export function getSuggestedChords(selectedNotes: string[]): ChordMatch[] {
  if (selectedNotes.length < 3) return [];

  const chords: ChordMatch[] = [];
  const seen = new Set<string>();

  // Try each note as potential root
  for (const potentialRoot of selectedNotes) {
    const rootIdx = CHROMATIC_NOTES.indexOf(potentialRoot);
    if (rootIdx === -1) continue;

    // Calculate intervals from this root
    const intervals = selectedNotes.map((note) => {
      const noteIdx = CHROMATIC_NOTES.indexOf(note);
      let interval = (noteIdx - rootIdx + 12) % 12;
      return interval;
    }).sort((a, b) => a - b);

    // Try to match against known chord patterns
    for (const [chordType, pattern] of Object.entries(CHORD_PATTERNS)) {
      const patternSet = new Set(pattern);
      const intervalsSet = new Set(intervals);
      
      const isMatch = Array.from(patternSet).every(interval => intervalsSet.has(interval));
      
      if (isMatch) {
        const chordName = `${potentialRoot}${chordType}`;
        if (!seen.has(chordName)) {
          seen.add(chordName);
          chords.push({
            name: chordName,
            root: potentialRoot,
            type: chordType,
            quality: chordType,
          });
        }
      }
    }
  }

  return chords;
}

/**
 * Check if all notes of a detected scale are selected
 * Returns true only for named patterns (not custom scales)
 */
export function isScaleComplete(selectedNotes: string[], detectedScale: ScalePattern | null): boolean {
  if (!detectedScale || selectedNotes.length === 0) return false;

  // Don't show complete indicator for custom scales
  if (!detectedScale.category) return false;

  // Get the root note (lowest selected note)
  const noteIndices = selectedNotes.map((note) => CHROMATIC_NOTES.indexOf(note)).filter((i) => i >= 0);
  if (noteIndices.length === 0) return false;

  const uniqueIndices = Array.from(new Set(noteIndices)).sort((a, b) => a - b);
  const lowestNote = uniqueIndices[0];

  // Get scale intervals from detected scale
  const scaleIndices = detectedScale.notes.map((note) => CHROMATIC_NOTES.indexOf(note)).sort((a, b) => a - b);
  const scaleIntervals = scaleIndices.map((idx) => (idx - scaleIndices[0] + 12) % 12).sort((a, b) => a - b);

  // Get selected intervals
  const selectedIntervals = uniqueIndices.map((idx) => (idx - lowestNote + 12) % 12).sort((a, b) => a - b);

  // Check if they match exactly
  return JSON.stringify(selectedIntervals) === JSON.stringify(scaleIntervals);
}

/**
 * Get all relative modes - scales with the same note collection but different roots
 * For example: C Ionian, D Dorian, E Phrygian, etc. all have the same notes
 * This function finds all modes that share the same note collection as the input scale
 */
export function getRelativeModes(scale: ScalePattern | null): ScalePattern[] {
  if (!scale || scale.notes.length === 0) return [];

  // Get the sorted note collection from the selected scale
  const scaleNoteSet = new Set(scale.notes);
  const scaleNotesSorted = Array.from(scaleNoteSet).sort((a, b) => 
    CHROMATIC_NOTES.indexOf(a) - CHROMATIC_NOTES.indexOf(b)
  );

  const relatives: ScalePattern[] = [];

  // Try each mode and transpose it to match the selected scale's notes
  for (const mode of MODES) {
    // For each possible transposition (each possible root)
    for (let transposition = 0; transposition < 12; transposition++) {
      // Transpose the mode's notes
      const transposedNotes = mode.notes.map((note) => {
        const noteIdx = CHROMATIC_NOTES.indexOf(note);
        const newIdx = (noteIdx + transposition) % 12;
        return CHROMATIC_NOTES[newIdx];
      });

      // Sort and compare
      const transposedSorted = Array.from(new Set(transposedNotes)).sort((a, b) => 
        CHROMATIC_NOTES.indexOf(a) - CHROMATIC_NOTES.indexOf(b)
      );

      // If this transposition matches the selected scale's notes, add it
      if (JSON.stringify(transposedSorted) === JSON.stringify(scaleNotesSorted)) {
        // The root is the transposition value (which note we started from)
        const root = CHROMATIC_NOTES[transposition];
        const transposedMode: ScalePattern = {
          ...mode,
          name: `${root} ${mode.name}`,
          notes: transposedNotes,
        };
        relatives.push(transposedMode);
        break; // Found the right transposition for this mode
      }
    }
  }

  return relatives;
}
