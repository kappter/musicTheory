# Journey Builder Specification

## SongMaker JSON Format
```json
{
  "songName": "Song Title",
  "blocks": [
    {
      "type": "intro|verse|pre-chorus|chorus|bridge|breakdown|solo|outro",
      "measures": 4|8,
      "rootNote": "C|C#|D|D#|E|F|F#|G|G#|A|A#|B",
      "mode": "Phrygian|Dorian|Ionian|Aeolian|etc",
      "tempo": 96,
      "timeSignature": "4/4",
      "feel": "Emotional descriptor string",
      "lyrics": "Optional lyrics text",
      "energy_drummer": 1-10,
      "energy_bassist": 1-10,
      "energy_guitarist": 1-10,
      "energy_keyboardist": 1-10,
      "energy_vocalist": 1-10
    }
  ]
}
```

## Feature Requirements

### Modal Circle
- Circle with 7 equally divided entities representing relative modes
- Configurable root/parent scale
- Nudges and rules for what is relevant, typical, and appealing
- Click any mode to show full scale info

### Highlighting System
- Common notes (stability/connection) - one color
- Unique notes (tension/color) - another color
- Resolution tones (leading tones, dominant relationships) - third color

### Journey Timeline
- Templates for 2-12 sections
- Section types: intro, verse, pre-chorus, chorus, bridge, breakdown, solo, outro
- Each section gets a mode assignment from the circle

### Export
- SongMaker JSON with defaults: 96 BPM, 4/4 time signature
- User can change tempo/time signature later
- Energy levels default to reasonable values

### UI Changes
- Disable Quiz button (grey out)
- Add "Journey" tab/navigation alongside Explorer
- Keep existing Explorer functionality intact
