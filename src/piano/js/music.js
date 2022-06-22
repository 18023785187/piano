
const audioContext = new AudioContext({ latencyHint: 'interactive' }) // 创建上下文
const pianoGain = audioContext.createGain()
pianoGain.connect(audioContext.destination)

const limiterNode = audioContext.createDynamicsCompressor() // 声音压缩器，避免失真
limiterNode.threshold.value = -10
limiterNode.knee.value = 0
limiterNode.ratio.value = 20
limiterNode.attack.value = 0
limiterNode.release.value = 0.1
pianoGain.connect(limiterNode)

/**
 * 设置总音量
 * @param {number} volume 
 */
export const setPianoVolume = (volume) => {
  pianoGain.gain.value = volume
}

/**
 * 获取 source
 * @param {string} buffer 
 * @returns {AudioContext.createBufferSource}
 */
const getSource = (buffer) => {
  const source = audioContext.createBufferSource()
  source.buffer = buffer
  return source
}

/**
 * 获取 buffer
 * @param {string} url 
 * @returns {Promise<string>}
 */
const getBuffer = (url) => {
  const request = new XMLHttpRequest()
  return new Promise((resolve, reject) => {
    request.open('GET', url, true)
    request.responseType = 'arraybuffer';
    request.onload = () => {
      audioContext.decodeAudioData(request.response, buffer => buffer ? resolve(buffer) : reject('decoding error'));
    }
    request.onerror = error => reject(error)
    request.send()
  })
}

export const music = {} // 暴露的音频接口
export const tags_map = { // 标识映射路径片段
  '情绪化': 'Emotional',
  '情绪化2': 'Emotional_2.0',
  '大而柔和的钢琴': 'GreatAndSoftPiano',
  '硬朗的钢琴': 'HardAndToughPiano',
  '硬钢琴': 'HardPiano',
  '竖琴': 'Harp',
  '大键琴': 'Harpsicord',
  '响亮的钢琴': 'LoudAndProudPiano',
  'MLG': 'MLG',
  '经典钢琴': 'mppclassic',
  '八音盒': 'Music_Box',
  '新钢琴': 'NewPiano',
  '钢琴2': 'Piano2',
  '钢琴': 'NewPiano',
  '软钢琴': 'SoftPiano',
  '施坦威钢琴': 'Steinway_Grand',
  '无标题': 'Untitled',
  '复式钢琴': 'Vintage_Upright',
  '柔和的复式钢琴': 'Vintage_Upright_Soft',
}

const keys = ['A0', 'A#0', 'B0', 'C1', 'C#1', 'D1', 'D#1', 'E1', 'F1', 'F#1', 'G1', 'G#1', 'A1', 'A#1', 'B1', 'C2', 'C#2', 'D2', 'D#2', 'E2', 'F2', 'F#2', 'G2', 'G#2', 'A2', 'A#2', 'B2', 'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3', 'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5', 'C6', 'C#6', 'D6', 'D#6', 'E6', 'F6', 'F#6', 'G6', 'G#6', 'A6', 'A#6', 'B6', 'C7', 'C#7', 'D7', 'D#7', 'E7', 'F7', 'F#7', 'G7', 'G#7', 'A7', 'A#7', 'B7', 'C8']
// 文件名
const fileNames = ['a-1', 'as-1', 'b-1', 'c0', 'cs0', 'd0', 'ds0', 'e0', 'f0', 'fs0', 'g0', 'gs0', 'a0', 'as0', 'b0', 'c1', 'cs1', 'd1', 'ds1', 'e1', 'f1', 'fs1', 'g1', 'gs1', 'a1', 'as1', 'b1', 'c2', 'cs2', 'd2', 'ds2', 'e2', 'f2', 'fs2', 'g2', 'gs2', 'a2', 'as2', 'b2', 'c3', 'cs3', 'd3', 'ds3', 'e3', 'f3', 'fs3', 'g3', 'gs3', 'a3', 'as3', 'b3', 'c4', 'cs4', 'd4', 'ds4', 'e4', 'f4', 'fs4', 'g4', 'gs4', 'a4', 'as4', 'b4', 'c5', 'cs5', 'd5', 'ds5', 'e5', 'f5', 'fs5', 'g5', 'gs5', 'a5', 'as5', 'b5', 'c6', 'cs6', 'd6', 'ds6', 'e6', 'f6', 'fs6', 'g6', 'gs6', 'a6', 'as6', 'b6', 'c7']
const wav = ['MLG'] // .wav 格式的文件
/**
 * 加载音频并装载到 music 上
 * @param {string} tag tags 的选项
 * @param {(sum: number) => void} start 准备加载前的回调
 * @param {(residue: number) => void} update 每次加载一个音频都会调用的回调，residue 表示当前剩余未加载的音频
 * @returns 
 */
export function load(tag, start, update) {
  if (music[tag]) { // 如果之前加载过目标音频，那么调用 callback 并直接放回
    update(0)
    return
  }

  music[tag] = {}
  let residue = fileNames.length
  start(residue)
  for (let i = 0; i < fileNames.length; ++i) installSound(keys[i], fileNames[i])

  /**
   * 装载音频
   * @param {string} key 键名
   * @param {string} fileName 加载的文件名
   */
  async function installSound(key, fileName) {
    const url = await require(`@/assets/sounds/${tags_map[tag]}/${fileName}.${wav.includes(tag) ? 'wav' : 'mp3'}`)
    const buffer = await getBuffer(url)
    let gain // 音量控制
    let source // 源
    let currentTime // 当前源播放的起始时间

    music[tag][key] = {
      start(volume = 1) { // 每次播放一个源
        this.stop() // 确保无冲突，先停止上一个源的播放
        currentTime = audioContext.currentTime
        gain = audioContext.createGain()
        gain.connect(pianoGain)
        gain.gain.value = volume
        source = getSource(buffer)
        source.connect(gain)
        source.start()
      },
      stop() { // 该源慢慢停止
        if (!source) return
        const delay = (audioContext.currentTime - currentTime) * 2 // 计算音量衰减时间
        gain.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + delay) // 在该时间音量衰减到 0
        source.stop(audioContext.currentTime + delay) // 在该时间停止音响
      }
    }

    update(--residue)
  }
}
