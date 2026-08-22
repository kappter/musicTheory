import { useState, useEffect } from "react";
import { Link } from "wouter";
import { detectScale, ALL_SCALES, CHROMATIC_NOTES, detectChord, getSuggestedChords, isScaleComplete, getRelativeModes } from "@/lib/musicTheory";
import type { ScalePattern, ChordMatch } from "@/lib/musicTheory";

export default function Home() {
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [detectedScale, setDetectedScale] = useState<ScalePattern | null>(null);
  const [detectedChord, setDetectedChord] = useState<ChordMatch | null>(null);
  const [suggestedChords, setSuggestedChords] = useState<ChordMatch[]>([]);
  const [themeColor, setThemeColor] = useState("#a67c52");
  const [notation, setNotation] = useState<"sharps" | "flats">("sharps");
  const [tuning, setTuning] = useState("standard");
  const [stringOrder, setStringOrder] = useState("low-bottom");
  const [isInitialized, setIsInitialized] = useState(false);
  const [presetKey, setPresetKey] = useState<string>("C");
  const [presetMode, setPresetMode] = useState<string>("Ionian (Major)");
  const [showInstructions, setShowInstructions] = useState(false);
  const [loadedPresetScale, setLoadedPresetScale] = useState<ScalePattern | null>(null);
  const [relativeModes, setRelativeModes] = useState<ScalePattern[]>([]);

  // Quiz mode state
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizType, setQuizType] = useState<'identification' | 'construction'>('identification');
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [quizScale, setQuizScale] = useState<ScalePattern | null>(null);
  const [quizAnswerSubmitted, setQuizAnswerSubmitted] = useState(false);
  const [quizFeedback, setQuizFeedback] = useState<{ correctCount: number; totalNotes: number; percentage: number } | null>(null);
  const [quizSession, setQuizSession] = useState({ currentQuestion: 0, scores: [] as number[] });
  const [showQuizTypeMenu, setShowQuizTypeMenu] = useState(false);
  const [selectedQuizType, setSelectedQuizType] = useState<'identification' | 'construction' | null>(null);
  const [quizQuestionKey, setQuizQuestionKey] = useState<string>('');
  const [quizQuestionMode, setQuizQuestionMode] = useState<string>('');

  // Display mode state
  const [showIntervals, setShowIntervals] = useState(false);

  // Custom scales state
  const [customScales, setCustomScales] = useState<Record<string, string[]>>(() => {
    if (typeof window === "undefined") return {};
    const saved = localStorage.getItem("customScales");
    return saved ? JSON.parse(saved) : {};
  });

  const saveCustomScale = (name: string) => {
    if (!name.trim() || selectedNotes.length === 0) return;
    const updated = { ...customScales, [name]: selectedNotes };
    setCustomScales(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("customScales", JSON.stringify(updated));
    }
  };

  const loadCustomScale = (name: string) => {
    const notes = customScales[name];
    if (notes) {
      setSelectedNotes(notes);
    }
  };

  const deleteCustomScale = (name: string) => {
    const updated = { ...customScales };
    delete updated[name];
    setCustomScales(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("customScales", JSON.stringify(updated));
    }
  };

  // Load random scale on component mount
  useEffect(() => {
    if (!isInitialized) {
      loadRandomScale();
      setIsInitialized(true);
    }
  }, []);

  const loadRandomScale = () => {
    const randomScale = ALL_SCALES[Math.floor(Math.random() * ALL_SCALES.length)];
    const randomKey = CHROMATIC_NOTES[Math.floor(Math.random() * CHROMATIC_NOTES.length)];
    
    // Transpose the scale to the random key
    const rootIdx = CHROMATIC_NOTES.indexOf(randomKey);
    const cMajorRootIdx = CHROMATIC_NOTES.indexOf("C");
    const newNotes = randomScale.notes.map(note => {
      const noteIdx = CHROMATIC_NOTES.indexOf(note);
      const transposedIdx = (noteIdx - cMajorRootIdx + rootIdx + 12) % 12;
      return CHROMATIC_NOTES[transposedIdx];
    });
    
    // Extract mode name
    const modeName = randomScale.name.split(" ").slice(1).join(" ") || randomScale.name;
    const displayName = randomKey === "C" ? randomScale.name : `${randomKey} ${modeName}`;
    const loadedScale = { ...randomScale, name: displayName, notes: newNotes };
    
    setSelectedNotes(newNotes);
    setLoadedPresetScale(loadedScale);
    setDetectedScale(loadedScale);
    setRelativeModes(getRelativeModes(loadedScale));
    setPresetKey(randomKey);
    setPresetMode(randomScale.name);
    setTuning("standard");
    setStringOrder("low-bottom");
  };

  // Guitar tunings
  const tunings: Record<string, string[]> = {
    standard: ["E", "A", "D", "G", "B", "E"],
    dropD: ["D", "A", "D", "G", "B", "E"],
    openG: ["D", "G", "D", "G", "B", "D"],
    dadgad: ["D", "A", "D", "G", "A", "D"],
    openD: ["D", "A", "D", "F#", "A", "D"],
  };

  const getTuning = () => {
    const tuningMap: Record<string, keyof typeof tunings> = {
      standard: "standard",
      dropD: "dropD",
      openG: "openG",
      dadgad: "dadgad",
      openD: "openD",
    };
    return tunings[tuningMap[tuning] || "standard"];
  };

  const getIntervalLabel = (note: string): string => {
    if (!detectedScale) return note;
    
    // Normalize flats to sharps for lookup
    const flatToSharp: Record<string, string> = {
      "Db": "C#",
      "Eb": "D#",
      "Gb": "F#",
      "Ab": "G#",
      "Bb": "A#",
    };
    const normalizedNote = flatToSharp[note] || note;
    
    const rootNote = detectedScale.notes[0];
    const rootIdx = CHROMATIC_NOTES.indexOf(rootNote);
    const noteIdx = CHROMATIC_NOTES.indexOf(normalizedNote);
    
    const semitones = (noteIdx - rootIdx + 12) % 12;
    
    const intervalNames: Record<number, string> = {
      0: '1',
      1: 'b2',
      2: '2',
      3: 'b3',
      4: '3',
      5: '4',
      6: 'b5',
      7: '5',
      8: 'b6',
      9: '6',
      10: 'b7',
      11: '7',
    };
    
    return intervalNames[semitones] || note;
  };

  const handleNoteClick = (note: string) => {
    // Toggle the note in quiz or explorer mode
    handleNoteClickInternal(note);
  };

  // Keyboard shortcuts: Q-Y for strings, 0-9,A-D for frets
  const stringKeys = ["q", "w", "e", "r", "t", "y"];
  const fretKeys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d"];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const stringIdx = stringKeys.indexOf(key);
      const fretIdx = fretKeys.indexOf(key);

      if (stringIdx !== -1 && fretIdx !== -1) {
        // Both string and fret keys pressed (shouldn't happen)
        return;
      }

      if (stringIdx !== -1) {
        // String key pressed - need fret context (for now, just play open string)
        const tuningNotes = getTuning();
        const displayTuning = stringOrder === "low-bottom" ? [...tuningNotes].reverse() : tuningNotes;
        handleNoteClick(displayTuning[stringIdx]);
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stringOrder, tuning]);

  // Update detected scale and chord when notes change
  useEffect(() => {
    if (selectedNotes.length === 0) {
      setDetectedScale(null);
      setDetectedChord(null);
      setSuggestedChords([]);
      setLoadedPresetScale(null);
    } else if (selectedNotes.length === 1) {
      // For single note, don't detect scale yet - just show the note
      setDetectedScale(null);
      setDetectedChord(null);
      setSuggestedChords([]);
      setRelativeModes([]);
    } else {
      const detected = loadedPresetScale || detectScale(selectedNotes);
      setDetectedScale(detected);
      
      // Get relative modes for the detected scale
      if (detected) {
        const relatives = getRelativeModes(detected);
        setRelativeModes(relatives);
      } else {
        setRelativeModes([]);
      }

      // Detect chord if 3+ notes selected
      if (selectedNotes.length >= 3) {
        const chord = detectChord(selectedNotes);
        setDetectedChord(chord);
        const suggested = getSuggestedChords(selectedNotes);
        setSuggestedChords(suggested);
      } else {
        setDetectedChord(null);
        setSuggestedChords([]);
      }


    }
  }, [selectedNotes, loadedPresetScale, isQuizMode, quizType]);

  const handleNoteClickInternal = (note: string) => {
    setSelectedNotes((prev: string[]) => {
      if (prev.includes(note)) {
        return prev.filter(n => n !== note);
      } else {
        return [...prev, note];
      }
    });
  };

  const handleClear = () => {
    setSelectedNotes([]);
    setQuizAnswerSubmitted(false);
    setQuizFeedback(null);
  };

  const getNoteDisplay = (note: string): string => {
    if (notation === "flats") {
      const flatMap: Record<string, string> = {
        "C#": "Db",
        "D#": "Eb",
        "F#": "Gb",
        "G#": "Ab",
        "A#": "Bb",
      };
      return flatMap[note] || note;
    }
    return note;
  };

  const loadPreset = () => {
    // Read from DOM as fallback in case React state is out of sync
    const selects = typeof document !== 'undefined' ? document.querySelectorAll('select') : [];
    const domPresetKey = selects[3]?.value || presetKey;
    const domPresetMode = selects[4]?.value || presetMode;
    
    // Use DOM values if they differ from state (state might be out of sync)
    const keyToUse = domPresetKey !== presetKey ? domPresetKey : presetKey;
    const modeToUse = domPresetMode !== presetMode ? domPresetMode : presetMode;
    
    const scale = ALL_SCALES.find(s => s.name === modeToUse);
    if (scale) {
      const rootIdx = CHROMATIC_NOTES.indexOf(keyToUse);
      const cMajorRootIdx = CHROMATIC_NOTES.indexOf("C");
      const newNotes = scale.notes.map(note => {
        const noteIdx = CHROMATIC_NOTES.indexOf(note);
        const transposedIdx = (noteIdx - cMajorRootIdx + rootIdx + 12) % 12;
        return CHROMATIC_NOTES[transposedIdx];
      });
      setSelectedNotes(newNotes);
      // Extract mode name - for single-word names like "Phrygian", use the full name
      const modeName = scale.name.split(" ").slice(1).join(" ") || scale.name;
      const displayName = keyToUse === "C" ? scale.name : `${keyToUse} ${modeName}`;
      const loadedScale = { ...scale, name: displayName, notes: newNotes };
      setLoadedPresetScale(loadedScale);
      setDetectedScale(loadedScale);
      setRelativeModes(getRelativeModes(loadedScale));
      // Also update the state to match what was loaded
      setPresetKey(keyToUse);
      setPresetMode(modeToUse);
    }
  };

  const getScalesByDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): ScalePattern[] => {
    const easyScales = ['Ionian (Major)', 'Aeolian (Natural Minor)', 'Major Pentatonic', 'Minor Pentatonic'];
    const mediumScales = ['Ionian (Major)', 'Dorian', 'Phrygian', 'Lydian', 'Mixolydian', 'Aeolian (Natural Minor)', 'Locrian', 'Harmonic Minor', 'Melodic Minor', 'Major Pentatonic', 'Minor Pentatonic', 'Blues Scale'];
    
    const selectedScales = difficulty === 'easy' ? easyScales : difficulty === 'medium' ? mediumScales : ALL_SCALES.map(s => s.name);
    return ALL_SCALES.filter(s => selectedScales.includes(s.name));
  };

  const startQuiz = (type: 'identification' | 'construction', difficulty: 'easy' | 'medium' | 'hard') => {
    const availableScales = getScalesByDifficulty(difficulty);
    const randomScale = availableScales[Math.floor(Math.random() * availableScales.length)];
    const randomKey = CHROMATIC_NOTES[Math.floor(Math.random() * CHROMATIC_NOTES.length)];
    
    // Transpose the scale to the random key
    const rootIdx = CHROMATIC_NOTES.indexOf(randomKey);
    const cMajorRootIdx = CHROMATIC_NOTES.indexOf("C");
    const newNotes = randomScale.notes.map(note => {
      const noteIdx = CHROMATIC_NOTES.indexOf(note);
      const transposedIdx = (noteIdx - cMajorRootIdx + rootIdx + 12) % 12;
      return CHROMATIC_NOTES[transposedIdx];
    });
    
    const modeName = randomScale.name.split(" ").slice(1).join(" ") || randomScale.name;
    const displayName = randomKey === "C" ? randomScale.name : `${randomKey} ${modeName}`;
    const loadedScale = { ...randomScale, name: displayName, notes: newNotes };
    
    setQuizScale(loadedScale);
    setQuizType(type);
    setQuizDifficulty(difficulty);
    setQuizQuestionKey(randomKey);
    setQuizQuestionMode(randomScale.name);
    setIsQuizMode(true);
    setSelectedNotes(type === 'identification' ? newNotes : []);
    setQuizAnswerSubmitted(false);
    setQuizFeedback(null);
    setQuizSession({ currentQuestion: 1, scores: [] });
  };

  const exitQuiz = () => {
    setIsQuizMode(false);
    setSelectedNotes([]);
    setQuizAnswerSubmitted(false);
    setQuizFeedback(null);
  };

  const submitQuizAnswer = () => {
    if (!quizScale) return;
    
    if (quizType === 'identification') {
      // For identification quiz, check if user selected the correct key and mode from dropdowns
      const selects = typeof document !== 'undefined' ? document.querySelectorAll('select') : [];
      const selectedKey = selects[3]?.value || presetKey;
      const selectedMode = selects[4]?.value || presetMode;
      
      const isCorrect = selectedKey === quizQuestionKey && selectedMode === quizQuestionMode;
      const percentage = isCorrect ? 100 : 0;
      
      setQuizFeedback({ correctCount: isCorrect ? 1 : 0, totalNotes: 1, percentage });
    } else {
      // For construction quiz, check how many correct notes were selected
      const correctNotes = selectedNotes.filter(n => quizScale.notes.includes(n)).length;
      const wrongNotes = selectedNotes.filter(n => !quizScale.notes.includes(n)).length;
      const totalNotes = quizScale.notes.length;
      
      // Proportional scoring: correct notes / total notes
      const percentage = Math.round((correctNotes / totalNotes) * 100);
      
      setQuizFeedback({ correctCount: correctNotes, totalNotes, percentage });
    }
    
    setQuizAnswerSubmitted(true);
  };

  const nextQuizQuestion = () => {
    if (quizSession.currentQuestion >= 10) {
      setIsQuizMode(false);
      return;
    }
    
    const newScores = [...quizSession.scores];
    if (quizFeedback) {
      newScores.push(quizFeedback.percentage);
    }
    
    const availableScales = getScalesByDifficulty(quizDifficulty);
    const randomScale = availableScales[Math.floor(Math.random() * availableScales.length)];
    const randomKey = CHROMATIC_NOTES[Math.floor(Math.random() * CHROMATIC_NOTES.length)];
    
    // Transpose the scale to the random key
    const rootIdx = CHROMATIC_NOTES.indexOf(randomKey);
    const cMajorRootIdx = CHROMATIC_NOTES.indexOf("C");
    const newNotes = randomScale.notes.map(note => {
      const noteIdx = CHROMATIC_NOTES.indexOf(note);
      const transposedIdx = (noteIdx - cMajorRootIdx + rootIdx + 12) % 12;
      return CHROMATIC_NOTES[transposedIdx];
    });
    
    const modeName = randomScale.name.split(" ").slice(1).join(" ") || randomScale.name;
    const displayName = randomKey === "C" ? randomScale.name : `${randomKey} ${modeName}`;
    const loadedScale = { ...randomScale, name: displayName, notes: newNotes };
    
    setQuizSession({ currentQuestion: quizSession.currentQuestion + 1, scores: newScores });
    setQuizScale(loadedScale);
    setQuizQuestionKey(randomKey);
    setQuizQuestionMode(randomScale.name);
    setSelectedNotes(quizType === 'identification' ? newNotes : []);
    setQuizAnswerSubmitted(false);
    setQuizFeedback(null);
  };

  const tuningNotes = getTuning();
  const displayTuning = stringOrder === "low-bottom" ? [...tuningNotes].reverse() : tuningNotes;

  // Fretboard SVG rendering - improved design
  const frets = 13;
  const strings = 6;
  const stringSpacing = 30;
  const fretSpacing = 60;
  const dotRadius = 12;
  const fretboardPadding = 40;
  const fretboardWidth = fretSpacing * frets + fretboardPadding * 2;
  const fretboardHeight = stringSpacing * (strings - 1) + fretboardPadding * 2;

  const getFretboardNotes = () => {
    const notes: Array<{ note: string; string: number; fret: number }> = [];
    displayTuning.forEach((openNote, stringIdx) => {
      for (let fret = 0; fret < frets; fret++) {
        const noteIdx = (CHROMATIC_NOTES.indexOf(openNote) + fret) % 12;
        const note = CHROMATIC_NOTES[noteIdx];
        notes.push({ note, string: stringIdx, fret });
      }
    });
    return notes;
  };

  const fretboardNotes = getFretboardNotes();

  // Piano SVG rendering - fully responsive and scalable
  // Calculate octaves based on available space (3-4 octaves for large screens, 1-2 for small)
  const pianoContainerWidth = typeof window !== 'undefined' ? window.innerWidth - 64 : 800;
  const pianoContainerHeight = 250;
  const targetWhiteKeyWidth = Math.max(30, Math.min(70, pianoContainerWidth / 28));
  const octaveCount = Math.max(1, Math.floor(pianoContainerWidth / (targetWhiteKeyWidth * 7)));
  const pianoKeys = Array.from({ length: octaveCount * 12 }, (_, i) => CHROMATIC_NOTES[i % 12]);
  const whiteKeyCount = pianoKeys.filter(n => !n.includes("#")).length;
  const whiteKeyWidth = pianoContainerWidth / whiteKeyCount;
  const whiteKeyHeight = pianoContainerHeight;
  const pianoWidth = whiteKeyCount * whiteKeyWidth;
  const pianoHeight = pianoContainerHeight;
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const blackKeyHeight = pianoHeight * 0.65;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 md:mb-8" style={{ color: themeColor }}>
        Music Theory Modes
      </h1>

      {/* Mode Tabs */}
      <div className="flex justify-center gap-4 mb-6 md:mb-8">
        <button
          onClick={loadRandomScale}
          className="px-4 md:px-6 py-2 rounded-lg font-semibold transition-all text-sm md:text-base hover:opacity-90"
          style={{
            backgroundColor: themeColor,
            color: "#000",
          }}
        >
          Random
        </button>
        <button
          disabled
          className="px-4 md:px-6 py-2 rounded-lg font-semibold transition-all text-sm md:text-base opacity-40 cursor-not-allowed"
          style={{
            backgroundColor: "#666",
            color: "#333",
          }}
        >
          Quiz
        </button>
        <Link
          href="/journey"
          className="px-4 md:px-6 py-2 rounded-lg font-semibold transition-all text-sm md:text-base hover:opacity-90 inline-block"
          style={{
            backgroundColor: themeColor,
            color: "#000",
          }}
        >
          Journey
        </Link>
      </div>

      {/* Controls */}
      <div
        className="rounded-lg p-3 md:p-6 mb-6 md:mb-8 flex flex-wrap gap-2 md:gap-3 justify-center items-center"
        style={{ border: `2px solid ${themeColor}`, backgroundColor: "#2a2a2a" }}
      >
        <select
          value={notation}
          onChange={e => setNotation(e.target.value as "sharps" | "flats")}
          className="px-2 md:px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-xs md:text-sm"
        >
          <option value="sharps">Sharps</option>
          <option value="flats">Flats</option>
        </select>

        <select
          value={tuning}
          onChange={e => setTuning(e.target.value)}
          className="px-2 md:px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-xs md:text-sm"
        >
          <option value="standard">Standard</option>
          <option value="dropD">Drop D</option>
          <option value="openG">Open G</option>
          <option value="dadgad">DADGAD</option>
          <option value="openD">Open D</option>
        </select>

        <select
          value={stringOrder}
          onChange={e => setStringOrder(e.target.value)}
          className="px-2 md:px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-xs md:text-sm"
        >
          <option value="high-bottom">High String</option>
          <option value="low-bottom">Low String</option>
        </select>

        <select
          value={presetKey}
          onChange={e => setPresetKey(e.target.value)}
          className="px-2 md:px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-xs md:text-sm"
        >
          {CHROMATIC_NOTES.map(note => (
            <option key={note} value={note}>
              {note}
            </option>
          ))}
        </select>

        <select
          value={presetMode}
          onChange={e => setPresetMode(e.target.value)}
          className="px-2 md:px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 text-xs md:text-sm"
        >
          {ALL_SCALES.map(scale => (
            <option key={scale.name} value={scale.name}>
              {scale.name}
            </option>
          ))}
        </select>

        <button
          onClick={loadPreset}
          className="px-3 md:px-4 py-2 rounded font-semibold transition-all text-xs md:text-sm"
          style={{
            backgroundColor: themeColor,
            color: "#000",
          }}
        >
          Load
        </button>

        <input
          type="color"
          value={themeColor}
          onChange={e => setThemeColor(e.target.value)}
          className="w-10 h-9 md:w-12 md:h-10 rounded cursor-pointer"
        />

        <button
          onClick={handleClear}
          className="px-3 md:px-4 py-2 rounded font-semibold transition-all text-xs md:text-sm"
          style={{
            backgroundColor: themeColor,
            color: "#000",
          }}
        >
          Clear
        </button>
        <button
          onClick={() => setShowIntervals(!showIntervals)}
          className="px-3 md:px-4 py-2 rounded font-semibold transition-all text-xs md:text-sm"
          style={{
            backgroundColor: showIntervals ? themeColor : "#444",
            color: showIntervals ? "#000" : "#fff",
          }}
        >
          {showIntervals ? "Intervals" : "Notes"}
        </button>

        <button
          onClick={() => setShowInstructions(true)}
          className="px-3 md:px-4 py-2 rounded font-semibold transition-all text-xs md:text-sm bg-gray-700 text-white hover:bg-gray-600"
        >
          ?
        </button>
      </div>

      {/* Quiz Mode */}
      {isQuizMode && quizScale && (
        <div className="text-center mb-6 md:mb-8">
          <div className="mb-4">
            <p className="text-xs md:text-sm text-gray-400">Question {quizSession.currentQuestion} of 10</p>
          </div>
          <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4" style={{ color: themeColor }}>
            {quizType === 'identification' ? 'Identify the scale' : 'Build the scale'}
          </h2>
          <p className="text-sm md:text-lg mb-4">{quizScale.emotion}</p>
          
          <div className="space-y-4">
            {!quizAnswerSubmitted ? (
              <button
                onClick={submitQuizAnswer}
                className="px-6 md:px-8 py-2 rounded-lg font-semibold text-sm md:text-base"
                style={{
                  backgroundColor: themeColor,
                  color: "#000",
                }}
              >
                Submit Answer
              </button>
            ) : (
              <div>
                <p className="text-lg md:text-xl font-bold mb-4" style={{ color: themeColor }}>
                  {quizFeedback?.percentage}% - You found {quizFeedback?.correctCount} out of {quizFeedback?.totalNotes} notes
                </p>
                <button
                  onClick={nextQuizQuestion}
                  className="px-6 md:px-8 py-2 rounded-lg font-semibold text-sm md:text-base"
                  style={{
                    backgroundColor: themeColor,
                    color: "#000",
                  }}
                >
                  {quizSession.currentQuestion >= 10 ? 'View Results' : 'Next Question'}
                </button>
              </div>
            )}
            <button
              onClick={exitQuiz}
              className="px-6 md:px-8 py-2 rounded-lg font-semibold text-sm md:text-base bg-gray-700 text-white hover:bg-gray-600"
            >
              Exit Quiz
            </button>
          </div>
        </div>
      )}

      {/* Status Message with Chord Detection */}
      {selectedNotes.length > 0 && !isQuizMode && detectedScale && (
        <div className="text-center mb-4 md:mb-6">
          <p className="text-sm md:text-base" style={{ color: themeColor }}>
            {detectedScale.name}
          </p>
          {detectedChord && selectedNotes.length >= 3 && (
            <p className="text-xs md:text-sm mt-2" style={{ color: themeColor, opacity: 0.9 }}>
              Chord: <strong>{detectedChord.name}</strong>
            </p>
          )}
          {isScaleComplete(selectedNotes, detectedScale) && (
            <p className="text-xs md:text-sm mt-2" style={{ color: "#4ade80", fontWeight: "bold" }}>
              ✓ Complete Scale
            </p>
          )}
        </div>
      )}

      {/* Information Table */}
      {selectedNotes.length > 0 && !isQuizMode && detectedScale && (
        <div className="mb-6 md:mb-8 overflow-x-auto">
          <table className="w-full border-collapse text-xs md:text-base">
            <thead>
              <tr style={{ backgroundColor: themeColor }}>
                <th className="border border-gray-600 px-2 md:px-4 py-2 text-left text-black font-bold">
                  PROPERTY
                </th>
                <th className="border border-gray-600 px-2 md:px-4 py-2 text-left text-black font-bold">
                  DETAILS
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-gray-800">
                <td className="border border-gray-600 px-2 md:px-4 py-2">Notes</td>
                <td className="border border-gray-600 px-2 md:px-4 py-2">
                  {selectedNotes.map(n => getNoteDisplay(n)).join(", ")}
                </td>
              </tr>
              <tr className="bg-gray-700">
                <td className="border border-gray-600 px-2 md:px-4 py-2">Intervals</td>
                <td className="border border-gray-600 px-2 md:px-4 py-2">
                  {detectedScale.intervals.join(", ")}
                </td>
              </tr>
              <tr className="bg-gray-800">
                <td className="border border-gray-600 px-2 md:px-4 py-2">Emotion/Feeling</td>
                <td className="border border-gray-600 px-2 md:px-4 py-2">{detectedScale.emotion}</td>
              </tr>
              {detectedScale.semitonePattern && (
                <tr className="bg-gray-700">
                  <td className="border border-gray-600 px-2 md:px-4 py-2">Semitone Pattern</td>
                  <td className="border border-gray-600 px-2 md:px-4 py-2">{detectedScale.semitonePattern}</td>
                </tr>
              )}
              {detectedScale.triads && (
                <tr className="bg-gray-800">
                  <td className="border border-gray-600 px-2 md:px-4 py-2">Triads</td>
                  <td className="border border-gray-600 px-2 md:px-4 py-2">{detectedScale.triads.join(", ")}</td>
                </tr>
              )}
              {detectedScale.progression && (
                <tr className="bg-gray-700">
                  <td className="border border-gray-600 px-2 md:px-4 py-2">Chord Progression</td>
                  <td className="border border-gray-600 px-2 md:px-4 py-2">{detectedScale.progression}</td>
                </tr>
              )}
              {relativeModes.length > 0 && (
                <tr className="bg-gray-700">
                  <td className="border border-gray-600 px-2 md:px-4 py-2">Relative Modes</td>
                  <td className="border border-gray-600 px-2 md:px-4 py-2 text-sm">
                    {relativeModes.map(m => m.name).join(", ")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Fretboard - Improved Design */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-center" style={{ color: themeColor }}>
          Guitar Fretboard {isQuizMode && quizScale ? `(${quizScale.name})` : detectedScale ? `(${detectedScale.name})` : ""}
        </h2>
        <div className="overflow-x-auto">
          <svg
            width="100%"
            height="auto"
            viewBox={`0 0 ${fretboardWidth} ${fretboardHeight}`}
            className="bg-gray-800 rounded"
            style={{ minHeight: "200px" }}
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Fret lines (horizontal) */}
            {Array.from({ length: strings }).map((_, i) => (
              <line
                key={`fret-${i}`}
                x1={fretboardPadding}
                y1={fretboardPadding + i * stringSpacing}
                x2={fretboardWidth - fretboardPadding}
                y2={fretboardPadding + i * stringSpacing}
                stroke="#666"
                strokeWidth="1.5"
              />
            ))}

            {/* String lines (vertical) */}
            {Array.from({ length: frets + 1 }).map((_, i) => (
              <line
                key={`string-${i}`}
                x1={fretboardPadding + i * fretSpacing}
                y1={fretboardPadding}
                x2={fretboardPadding + i * fretSpacing}
                y2={fretboardHeight - fretboardPadding}
                stroke={i === 0 ? "#999" : i === 1 || i === 12 ? "#daa520" : "#555"}
                strokeWidth={i === 0 || i === 1 || i === 12 ? "3" : "1"}
              />
            ))}

            {/* Open string tuning labels (left side) - text only */}
            {displayTuning.map((note, stringIdx) => {
              return (
                <text
                  key={`open-${stringIdx}`}
                  x={fretboardPadding - 20}
                  y={fretboardPadding + stringIdx * stringSpacing}
                  textAnchor="middle"
                  dy="0.3em"
                  fontSize="11"
                  fontWeight="bold"
                  fill={themeColor}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleNoteClick(note)}
                >
                  {getNoteDisplay(note)}
                </text>
              );
            })}

            {/* Fretted note dots */}
            {fretboardNotes.map((noteData, idx) => {
              const x = fretboardPadding + (noteData.fret + 1) * fretSpacing - fretSpacing / 2;
              const y = fretboardPadding + noteData.string * stringSpacing;
              const isSelected = selectedNotes.includes(noteData.note);
              // Only show root indicator if the note is selected and is the first selected note
              const isRoot = isSelected && selectedNotes.length > 0 && noteData.note === selectedNotes[0];

              return (
                <g key={idx} onClick={() => handleNoteClick(noteData.note)} style={{ cursor: "pointer" }}>
                  <circle
                    cx={x}
                    cy={y}
                    r={dotRadius}
                    fill={isRoot ? "#fbbf24" : isSelected ? themeColor : "#444"}
                    stroke={isRoot ? "#f59e0b" : isSelected ? themeColor : "#666"}
                    strokeWidth={isRoot ? "2.5" : "1.5"}
                  />
                  {isSelected && (
                    <text
                      x={x}
                      y={y}
                      textAnchor="middle"
                      dy="0.3em"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#000"
                    >
                      {showIntervals ? getIntervalLabel(noteData.note) : getNoteDisplay(noteData.note)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Piano - Responsive with bounded height */}
      <div>
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-center" style={{ color: themeColor }}>
          Piano Roll {isQuizMode && quizScale ? `(${quizScale.name})` : detectedScale ? `(${detectedScale.name})` : ""}
        </h2>
        <div className="w-full" style={{ height: "200px", display: "flex", alignItems: "stretch", justifyContent: "center", backgroundColor: "#1a2332", borderRadius: "0.5rem", overflow: "hidden" }}>
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${pianoWidth} ${pianoHeight}`}
            className="bg-gray-800"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* White keys */}
            {pianoKeys.map((note, idx) => {
              if (note.includes("#")) return null;
              const whiteKeyIdx = ["C", "D", "E", "F", "G", "A", "B"].indexOf(note);
              const x = whiteKeyIdx * whiteKeyWidth + (Math.floor(idx / 12) * 7 * whiteKeyWidth);
              const isSelected = selectedNotes.includes(note);
              // Only show root indicator if the note is selected and is the first selected note
              const isRoot = isSelected && selectedNotes.length > 0 && note === selectedNotes[0];

              return (
                <g key={`white-${idx}`} onClick={() => handleNoteClick(note)} style={{ cursor: "pointer" }}>
                  <rect
                    x={x}
                    y="5"
                    width={whiteKeyWidth - 1}
                    height={whiteKeyHeight - 5}
                    fill={isRoot ? "#fbbf24" : isSelected ? themeColor : "white"}
                    stroke={isRoot ? "#f59e0b" : "#333"}
                    strokeWidth={isRoot ? "1.5" : "0.5"}
                    rx="2"
                  />
                  {isSelected && (
                    <text
                      x={x + (whiteKeyWidth - 1) / 2}
                      y={whiteKeyHeight - 8}
                      textAnchor="middle"
                      fontSize="8"
                      fontWeight="bold"
                      fill="#000"
                    >
                      {showIntervals ? getIntervalLabel(note) : getNoteDisplay(note)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Black keys */}
            {pianoKeys.map((note, idx) => {
              if (!note.includes("#")) return null;
              const whiteKeyIdx = ["C", "D", "E", "F", "G", "A", "B"].indexOf(note.charAt(0));
              const x = whiteKeyIdx * whiteKeyWidth + (Math.floor(idx / 12) * 7 * whiteKeyWidth) + whiteKeyWidth - blackKeyWidth / 2;
              const isSelected = selectedNotes.includes(note);
              // Only show root indicator if the note is selected and is the first selected note
              const isRoot = isSelected && selectedNotes.length > 0 && note === selectedNotes[0];

              return (
                <g key={`black-${idx}`} onClick={() => handleNoteClick(note)} style={{ cursor: "pointer" }}>
                  <rect
                    x={x}
                    y="5"
                    width={blackKeyWidth}
                    height={blackKeyHeight}
                    fill={isRoot ? "#fbbf24" : isSelected ? themeColor : "#222"}
                    stroke={isRoot ? "#f59e0b" : "#000"}
                    strokeWidth={isRoot ? "1.5" : "0.5"}
                    rx="1"
                  />
                  {isSelected && (
                    <text
                      x={x + blackKeyWidth / 2}
                      y={blackKeyHeight - 3}
                      textAnchor="middle"
                      fontSize="7"
                      fontWeight="bold"
                      fill="#fff"
                    >
                      {showIntervals ? getIntervalLabel(note) : getNoteDisplay(note)}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
        <p className="text-xs md:text-sm text-gray-400 mt-2 text-center">
          Keyboard shortcuts: Q-Y (strings), 0-9, A-D (frets)
        </p>
      </div>

      {/* Quiz Type Selection Modal */}
      {showQuizTypeMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 md:p-8 max-w-md border-2" style={{ borderColor: themeColor }}>
            <h2 className="text-xl md:text-2xl font-bold mb-6" style={{ color: themeColor }}>Choose Quiz Type</h2>
            {!selectedQuizType ? (
              <div className="space-y-4">
                <button
                  onClick={() => setSelectedQuizType('identification')}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-sm md:text-base transition-all"
                  style={{
                    backgroundColor: themeColor,
                    color: "#000",
                  }}
                >
                  Identification Quiz
                </button>
                <button
                  onClick={() => setSelectedQuizType('construction')}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-sm md:text-base transition-all"
                  style={{
                    backgroundColor: themeColor,
                    color: "#000",
                  }}
                >
                  Construction Quiz
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-300 mb-4">Select Difficulty Level</p>
                <button
                  onClick={() => {
                    startQuiz(selectedQuizType, 'easy');
                    setShowQuizTypeMenu(false);
                    setSelectedQuizType(null);
                  }}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-sm md:text-base transition-all bg-green-600 hover:bg-green-700 text-white"
                >
                  Easy
                </button>
                <button
                  onClick={() => {
                    startQuiz(selectedQuizType, 'medium');
                    setShowQuizTypeMenu(false);
                    setSelectedQuizType(null);
                  }}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-sm md:text-base transition-all bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Medium
                </button>
                <button
                  onClick={() => {
                    startQuiz(selectedQuizType, 'hard');
                    setShowQuizTypeMenu(false);
                    setSelectedQuizType(null);
                  }}
                  className="w-full px-4 py-3 rounded-lg font-semibold text-sm md:text-base transition-all bg-red-600 hover:bg-red-700 text-white"
                >
                  Hard
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setShowQuizTypeMenu(false);
                setSelectedQuizType(null);
              }}
              className="w-full mt-4 px-4 py-2 rounded-lg font-semibold text-sm md:text-base bg-gray-700 text-gray-300 hover:bg-gray-600 transition-all"
            >
              {selectedQuizType ? 'Back' : 'Cancel'}
            </button>
          </div>
        </div>
      )}

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 md:p-8 max-w-2xl max-h-96 overflow-y-auto border-2" style={{ borderColor: themeColor }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl md:text-2xl font-bold" style={{ color: themeColor }}>How to Use</h2>
              <button onClick={() => setShowInstructions(false)} className="text-2xl text-gray-400 hover:text-white">×</button>
            </div>
            <div className="text-sm md:text-base text-gray-300 space-y-4">
              <div>
                <h3 className="font-bold mb-2" style={{ color: themeColor }}>Explorer Mode</h3>
                <p>Click notes on the fretboard or piano to explore scales. The <strong>first note you click becomes the root</strong> (shown with a visual indicator), and subsequent notes are accents. The app detects which scale/mode matches your selection in real-time.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: themeColor }}>Root Note Concept</h3>
                <p>All 7 modes use the same notes but start on different degrees. For example, all white keys on a piano are different modes depending on which note you start from. The root note is your starting point.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: themeColor }}>Complete Scale</h3>
                <p>When you select all notes of a named scale, a green "✓ Complete Scale" indicator appears, confirming you've found the full pattern.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: themeColor }}>Quiz Mode</h3>
                <p>Test your knowledge! The root note is always shown. If "Identify Root" is checked, you must find the root first. Otherwise, recreate the scale starting from the given root.</p>
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: themeColor }}>Custom Scales</h3>
                <p>Save your own scale patterns by clicking "Save Custom Scale" after selecting notes. Load them anytime from the custom scales dropdown.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-12 md:mt-16 pt-6 md:pt-8 pb-6 md:pb-8 border-t border-gray-700 text-center text-xs md:text-sm text-gray-400">
        <p>
          © 2026 Ken Kapptie | <a href="https://kappter.github.io/portfolio/" target="_blank" rel="noopener noreferrer" className="hover:text-gray-300 transition-colors" style={{ color: themeColor }}>Portfolio</a>
        </p>
      </footer>
    </div>
  );
}
