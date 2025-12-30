// --- Scale data --------------------------------------------------------
// Replace this stub with the real scale catalog you already use.
// Intervals are relative to root in semitones.

const SCALE_PATTERNS = [
  {
    id: "major",
    name: "Major (Ionian)",
    intervals: [0, 2, 4, 5, 7, 9, 11],
    family: "Diatonic",
  },
  {
    id: "natural_minor",
    name: "Natural Minor (Aeolian)",
    intervals: [0, 2, 3, 5, 7, 8, 10],
    family: "Diatonic",
  },
  {
    id: "dorian",
    name: "Dorian",
    intervals: [0, 2, 3, 5, 7, 9, 10],
    family: "Diatonic",
  },
  {
    id: "mixolydian",
    name: "Mixolydian",
    intervals: [0, 2, 4, 5, 7, 9, 10],
    family: "Diatonic",
  },
  // Add the rest of your modes/scales here
];

// --- Pitch‑class helpers ----------------------------------------------

const PITCH_CLASS_NAMES = [
  "C",
  "C♯ / D♭",
  "D",
  "D♯ / E♭",
  "E",
  "F",
  "F♯ / G♭",
  "G",
  "G♯ / A♭",
  "A",
  "A♯ / B♭",
  "B",
];

// If you already have a pc->name mapper, reuse that instead.
function pcToName(pc) {
  return PITCH_CLASS_NAMES[((pc % 12) + 12) % 12];
}

function sortPC(arr) {
  return arr.slice().sort((a, b) => a - b);
}

// --- Detection logic --------------------------------------------------

function matchesPattern(selectedSet, patternIntervals) {
  if (selectedSet.size !== patternIntervals.length) return null;

  const selArr = sortPC(Array.from(selectedSet));
  const patBase = sortPC(patternIntervals);

  // Try all 12 possible transpositions
  for (let root = 0; root < 12; root++) {
    const transposed = sortPC(patBase.map(i => (i + root) % 12));
    let same = true;
    for (let i = 0; i < selArr.length; i++) {
      if (selArr[i] !== transposed[i]) {
        same = false;
        break;
      }
    }
    if (same) return root; // pc of root
  }
  return null;
}

function detectScale(selectedSet) {
  const results = [];
  for (const pattern of SCALE_PATTERNS) {
    const rootPc = matchesPattern(selectedSet, pattern.intervals);
    if (rootPc !== null) {
      results.push({ pattern, rootPc });
    }
  }
  return results;
}

// Generate ordered note list for UI
function orderedNotesFromRoot(rootPc, intervals) {
  return intervals
    .map(i => (rootPc + i) % 12)
    .map(pc => pcToName(pc));
}

// --- UI wiring --------------------------------------------------------

const selectedNotes = new Set();

let elStatus;
let elScaleName;
let elScaleMeta;
let elScaleNotes;
let elScaleExtra;
let btnOpenPractice;

document.addEventListener("DOMContentLoaded", () => {
  elStatus = document.getElementById("scale-status");
  elScaleName = document.getElementById("scale-name");
  elScaleMeta = document.getElementById("scale-meta");
  elScaleNotes = document.getElementById("scale-notes");
  elScaleExtra = document.getElementById("scale-extra");
  btnOpenPractice = document.getElementById("open-in-practice");

  // Bind note buttons
  document.querySelectorAll(".note").forEach(btn => {
    const pc = Number(btn.dataset.pc);
    btn.addEventListener("click", () => onNoteClick(btn, pc));
  });

  // Clear selection
  const clearBtn = document.getElementById("clear-selection");
  if (clearBtn) {
    clearBtn.addEventListener("click", clearSelection);
  }

  // Optional handoff to main practice app when you add query param support
  if (btnOpenPractice) {
    btnOpenPractice.addEventListener("click", openInPracticeApp);
  }

  updateStatusInitial();
});

// --- Event handlers ---------------------------------------------------

function onNoteClick(btn, pc) {
  if (selectedNotes.has(pc)) {
    selectedNotes.delete(pc);
    btn.classList.remove("selected");
  } else {
    selectedNotes.add(pc);
    btn.classList.add("selected");
  }
  detectAndRender();
}

function clearSelection() {
  selectedNotes.clear();
  document.querySelectorAll(".note.selected").forEach(btn =>
    btn.classList.remove("selected")
  );
  updateStatusInitial();
}

function updateStatusInitial() {
  if (!elStatus) return;
  elStatus.textContent = "Tap notes to discover a scale or mode.";
  elStatus.classList.remove("error");
  elStatus.classList.add("message");

  elScaleName.textContent = "";
  elScaleMeta.textContent = "";
  elScaleNotes.textContent = "";
  elScaleExtra.textContent = "";

  if (btnOpenPractice) {
    btnOpenPractice.disabled = true;
  }
}

// --- Detection -> UI --------------------------------------------------

function detectAndRender() {
  if (selectedNotes.size === 0) {
    updateStatusInitial();
    return;
  }

  const matches = detectScale(selectedNotes);

  if (matches.length === 0) {
    renderUnknownPattern();
  } else {
    renderKnownPattern(matches[0]); // pick first for now
  }
}

function renderUnknownPattern() {
  elStatus.textContent = "This note set is not a standard scale/mode in this app.";
  elStatus.classList.remove("message");
  elStatus.classList.add("error");

  elScaleName.textContent = "";
  elScaleMeta.textContent = "";
  elScaleNotes.textContent = "";
  elScaleExtra.textContent = "";

  if (btnOpenPractice) {
    btnOpenPractice.disabled = true;
  }
}

function renderKnownPattern(match) {
  const { pattern, rootPc } = match;

  const rootName = pcToName(rootPc);
  const prettyName = `${rootName} ${pattern.name}`;

  elStatus.textContent = "Recognized scale/mode.";
  elStatus.classList.remove("error");
  elStatus.classList.add("message");

  elScaleName.textContent = prettyName;

  const metaParts = [];
  if (pattern.family) metaParts.push(`Family: ${pattern.family}`);
  if (pattern.intervals) metaParts.push(`Size: ${pattern.intervals.length} notes`);
  elScaleMeta.textContent = metaParts.join(" • ");

  const notes = orderedNotesFromRoot(rootPc, pattern.intervals);
  elScaleNotes.textContent = notes.length ? `Notes: ${notes.join(" – ")}` : "";

  // Extend with your existing descriptive fields if you have them
  if (pattern.description) {
    elScaleExtra.textContent = pattern.description;
  } else {
    elScaleExtra.textContent = "";
  }

  if (btnOpenPractice) {
    btnOpenPractice.disabled = false;
    btnOpenPractice.dataset.rootPc = String(rootPc);
    btnOpenPractice.dataset.scaleId = pattern.id;
  }
}

// --- Handoff to practice app (optional) ------------------------------

// Adjust URL and param names to match your existing test page.
function openInPracticeApp() {
  if (!btnOpenPractice || btnOpenPractice.disabled) return;

  const rootPc = Number(btnOpenPractice.dataset.rootPc);
  const scaleId = btnOpenPractice.dataset.scaleId;

  // Example: map pc -> simple key name for query string
  const keyName = pcToName(rootPc).split(" ")[0]; // crude; replace with your real mapping

  const url = new URL("../test/index.html", window.location.href);
  url.searchParams.set("key", keyName);
  url.searchParams.set("scale", scaleId);

  window.location.href = url.toString();
}
