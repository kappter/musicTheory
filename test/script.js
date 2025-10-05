// --- CONFIG ---
const strings = 6;
const frets = 12;
const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// Tuning (EADGBE standard, lowest string = index 0)
const tuning = [4, 9, 2, 7, 11, 4]; // E2, A2, D3, G3, B3, E4

// --- CANVAS ---
const fretboardCanvas = document.getElementById("fretboard");
const fretCtx = fretboardCanvas.getContext("2d");

const pianoCanvas = document.getElementById("piano");
const pianoCtx = pianoCanvas.getContext("2d");

// --- DRAW FRETS ---
function drawFretboard(highlight = []) {
  fretCtx.clearRect(0, 0, fretboardCanvas.width, fretboardCanvas.height);
  const w = fretboardCanvas.width / frets;
  const h = fretboardCanvas.height / strings;

  // frets
  for (let f = 0; f <= frets; f++) {
    fretCtx.beginPath();
    fretCtx.moveTo(f * w, 0);
    fretCtx.lineTo(f * w, fretboardCanvas.height);
    fretCtx.stroke();
  }
  // strings
  for (let s = 0; s < strings; s++) {
    fretCtx.beginPath();
    fretCtx.moveTo(0, (s + 0.5) * h);
    fretCtx.lineTo(fretboardCanvas.width, (s + 0.5) * h);
    fretCtx.stroke();
  }

  // notes
  for (let s = 0; s < strings; s++) {
    for (let f = 0; f <= frets; f++) {
      const noteIndex = (tuning[s] + f) % 12;
      const note = notes[noteIndex];
      if (highlight.includes(note)) {
        fretCtx.beginPath();
        fretCtx.arc(f * w + w / 2, s * h + h / 2, 10, 0, 2 * Math.PI);
        fretCtx.fillStyle = "red";
        fretCtx.fill();
        fretCtx.stroke();
      }
    }
  }
}

// --- DRAW PIANO ---
function drawPiano(highlight = []) {
  pianoCtx.clearRect(0, 0, pianoCanvas.width, pianoCanvas.height);
  const keyWidth = pianoCanvas.width / 14;
  const keyHeight = pianoCanvas.height;

  // white keys
  let whiteNotes = ["C", "D", "E", "F", "G", "A", "B"];
  let x = 0;
  for (let i = 0; i < 14; i++) {
    let note = notes[i % 12];
    let isSharp = note.includes("#");

    if (!isSharp) {
      pianoCtx.fillStyle = highlight.includes(note) ? "red" : "white";
      pianoCtx.fillRect(x, 0, keyWidth, keyHeight);
      pianoCtx.strokeRect(x, 0, keyWidth, keyHeight);
      x += keyWidth;
    }
  }

  // black keys
  x = 0;
  for (let i = 0; i < 14; i++) {
    let note = notes[i % 12];
    let isSharp = note.includes("#");
    if (!isSharp) {
      x += keyWidth;
    } else {
      pianoCtx.fillStyle = highlight.includes(note) ? "red" : "black";
      pianoCtx.fillRect(x - keyWidth / 4, 0, keyWidth / 2, keyHeight * 0.6);
      pianoCtx.strokeRect(x - keyWidth / 4, 0, keyWidth / 2, keyHeight * 0.6);
    }
  }
}

// --- TABLE GENERATION ---
const intervals = [
  { name: "Minor Second", notes: ["C", "C#"] },
  { name: "Major Second", notes: ["C", "D"] },
  { name: "Perfect Fifth", notes: ["C", "G"] },
];

const triads = [
  { name: "C Major", notes: ["C", "E", "G"] },
  { name: "C Minor", notes: ["C", "D#", "G"] },
  { name: "G Major", notes: ["G", "B", "D"] },
];

const chords = [
  { name: "C7", notes: ["C", "E", "G", "A#"] },
  { name: "Cm7", notes: ["C", "D#", "G", "A#"] },
  { name: "CMaj7", notes: ["C", "E", "G", "B"] },
];

function fillTable(tableId, data) {
  const tbody = document.querySelector(`#${tableId} tbody`);
  tbody.innerHTML = "";
  data.forEach(item => {
    const tr = document.createElement("tr");
    tr.dataset.notes = JSON.stringify(item.notes);

    const td1 = document.createElement("td");
    td1.textContent = item.name;
    const td2 = document.createElement("td");
    td2.textContent = item.notes.join(", ");

    tr.appendChild(td1);
    tr.appendChild(td2);

    // hover effect
    tr.addEventListener("mouseenter", () => {
      drawFretboard(item.notes);
      drawPiano(item.notes);
    });
    tr.addEventListener("mouseleave", () => {
      drawFretboard();
      drawPiano();
    });

    tbody.appendChild(tr);
  });
}

// --- INIT ---
drawFretboard();
drawPiano();
fillTable("intervalsTable", intervals);
fillTable("triadsTable", triads);
fillTable("chordsTable", chords);
