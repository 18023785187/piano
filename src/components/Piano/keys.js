
// 钢琴键位
export const keyMap = [
  {
    pitch: 0,
    keys: ['A0', 'A#0'],
  },
  {
    pitch: 1,
    keys: ['B0', 'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1'],
  },
  {
    pitch: 2,
    keys: ['B1', 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2'],
  },
  {
    pitch: 3,
    keys: ['B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3'],
  },
  {
    pitch: 4,
    keys: ['B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4'],
  },
  {
    pitch: 5,
    keys: ['B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5'],
  },
  {
    pitch: 6,
    keys: ['B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6'],
  },
  {
    pitch: 7,
    keys: ['B6', 'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7'],
  },
  {
    pitch: 8,
    keys: ['B7', 'C8'],
  }
]

/**
 * 键位，格式: [key, shift]
 */
export const notes = {
  'A0': ['F1', false],
  'A#0': ['F2', false],
  'B0': ['F3', false],
  'C1': ['F4', false],
  'C#1': ['F4', true],
  'D1': ['F5', false],
  'D#1': ['F5', true],
  'E1': ['F6', false],
  'F1': ['F7', false],
  'F#1': ['F7', true],
  'G1': ['F8', false],
  'G#1': ['F8', true],
  'A1': ['F9', false],
  'A#1': ['F9', true],
  'B1': ['F0', false],
  'C2': ['Digit1', false],
  'C#2': ['Digit1', true],
  'D2': ['Digit2', false],
  'D#2': ['Digit2', true],
  'E2': ['Digit3', false],
  'F2': ['Digit4', false],
  'F#2': ['Digit4', true],
  'G2': ['Digit5', false],
  'G#2': ['Digit5', true],
  'A2': ['Digit6', false],
  'A#2': ['Digit6', true],
  'B2': ['Digit7', false],
  'C3': ['Digit8', false],
  'C#3': ['Digit8', true],
  'D3': ['Digit9', false],
  'D#3': ['Digit9', true],
  'E3': ['Digit0', false],
  'F3': ['KeyQ', false],
  'F#3': ['KeyQ', true],
  'G3': ['KeyW', false],
  'G#3': ['KeyW', true],
  'A3': ['KeyE', false],
  'A#3': ['KeyE', true],
  'B3': ['KeyR', false],
  'C4': ['KeyT', false],
  'C#4': ['KeyT', true],
  'D4': ['KeyY', false],
  'D#4': ['KeyY', true],
  'E4': ['KeyU', false],
  'F4': ['KeyI', false],
  'F#4': ['KeyI', true],
  'G4': ['KeyO', false],
  'G#4': ['KeyO', true],
  'A4': ['KeyP', false],
  'A#4': ['KeyP', true],
  'B4': ['KeyA', false],
  'C5': ['KeyS', false],
  'C#5': ['KeyS', true],
  'D5': ['KeyD', false],
  'D#5': ['KeyD', true],
  'E5': ['KeyF', false],
  'F5': ['KeyG', false],
  'F#5': ['KeyG', true],
  'G5': ['KeyH', false],
  'G#5': ['KeyH', true],
  'A5': ['KeyJ', false],
  'A#5': ['KeyJ', true],
  'B5': ['KeyK', false],
  'C6': ['KeyL', false],
  'C#6': ['KeyL', true],
  'D6': ['KeyZ', false],
  'D#6': ['KeyZ', true],
  'E6': ['KeyX', false],
  'F6': ['KeyC', false],
  'F#6': ['KeyC', true],
  'G6': ['KeyV', false],
  'G#6': ['KeyV', true],
  'A6': ['KeyB', false],
  'A#6': ['KeyB', true],
  'B6': ['KeyN', false],
  'C7': ['KeyM', false],
  'C#7': ['KeyM', true],
  'D7': ['Numpad1', false],
  'D#7': ['Numpad2', false],
  'E7': ['Numpad3', false],
  'F7': ['Numpad4', false],
  'F#7': ['Numpad5', false],
  'G7': ['Numpad6', false],
  'G#7': ['Numpad7', false],
  'A7': ['Numpad8', false],
  'A#7': ['Numpad9', false],
  'B7': ['Numpad0', false],
  'C8': ['NumpadDecimal', false],
}
export const noteMap = {}
export const noteFlags = {}
export const noteHighs = {}
for(const key in notes) {
  const note = notes[key].join('')
  noteMap[note] = key
  noteFlags[note] = false
  noteHighs[key] = false
}
