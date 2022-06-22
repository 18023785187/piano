# 乐谱制作

```typescript
type Key = 'A0' | 'A#0' | 'B0' | 'C1' | 'C#1' | 'D1' | 'D#1' | 'E1' | 'F1' | 'F#1' | 'G1' | 'G#1' | 'A1' | 'A#1' | 'B1' | 'C2' | 'C#2' | 'D2' | 'D#2' | 'E2' | 'F2' | 'F#2' | 'G2' | 'G#2' | 'A2' | 'A#2' | 'B2' | 'C3' | 'C#3' | 'D3' | 'D#3' | 'E3' | 'F3' | 'F#3' | 'G3' | 'G#3' | 'A3' | 'A#3' | 'B3' | 'C4' | 'C#4' | 'D4' | 'D#4' | 'E4' | 'F4' | 'F#4' | 'G4' | 'G#4' | 'A4' | 'A#4' | 'B4' | 'C5' | 'C#5' | 'D5' | 'D#5' | 'E5' | 'F5' | 'F#5' | 'G5' | 'G#5' | 'A5' | 'A#5' | 'B5' | 'C6' | 'C#6' | 'D6' | 'D#6' | 'E6' | 'F6' | 'F#6' | 'G6' | 'G#6' | 'A6' | 'A#6' | 'B6' | 'C7' | 'C#7' | 'D7' | 'D#7' | 'E7' | 'F7' | 'F#7' | 'G7' | 'G#7' | 'A7' | 'A#7' | 'B7' | 'C8'
/**
 * 谱
 * Score[i][1] 是节拍数, 表示经过多少拍后进行下一个音符；
 * Score[i][2] 是音符数组，表示当前需要演奏多少个音符；
 * Score[i][3] 是时域，表示音符数组中的音符需要持续多长时间，如果为 undefined 则以 Score[i][1] 当作时域；
 * Score[i][4] 是音量，把该音量调至大于或小于默认音量的值用来模仿演奏时的力度，如果为 undefined 则以默认音量来演奏该段。
 */
type Score = [number, Key[], number | undefined, number | undefined][]

type MusicScore = {
  name: string, // 曲名
  rhythm: number, // 每分钟节拍数
  leftVolume: number, // 设定左手默认音量
  rightVolume: number, // 设定右手默认音量
  left: Score, // 左手谱
  right: Score // 右手谱
}

```