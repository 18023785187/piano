
import { audioDatas } from './audio-datas'

const audioContext = new AudioContext({ latencyHint: 'interactive' })

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

export const music = {} // 暴露的音源接口

const FADE_OUT_TIME = 200; // 声音淡出时间
(async () => {
  const keyMap = Object.keys(audioDatas)
  for (let i = 0; i < keyMap.length; ++i) {
    const key = keyMap[i]
    const url = audioDatas[key]
    const buffer = await getBuffer(url)
    let gain // 音量控制
    let source // 源
    let currentTime

    music[key] = {
      start(volume = 1) { // 每次播放一个源
        this.stop()
        currentTime = audioContext.currentTime
        gain = audioContext.createGain()
        gain.connect(audioContext.destination)
        gain.gain.value = volume
        source = getSource(buffer)
        source.connect(gain)
        source.start()
      },
      stop() { // 该源慢慢停止
        if (!source) return
        const delay = audioContext.currentTime - currentTime
        gain.gain.linearRampToValueAtTime(gain.gain.value / 10, audioContext.currentTime + delay)
        gain.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + delay + FADE_OUT_TIME / 1000)
        source.stop(audioContext.currentTime + FADE_OUT_TIME / 1000)
      }
    }
  }
})()

export class Auto {
  /**
   * @typedef {[number, Array<[string, number]>]} Score
   * @typedef {{ left: Score, right: Score }} Scores
   * @typedef {{ play: (key?: string) => void, stop: (key?: string) => void }} Hooks
   * @param {Scores} scores 
   * @param {Hooks} hooks 钩子函数，在每个音符播放时会播放后执行
   */
  constructor(rhythm, scores, hooks) {
    this.rhythm = (60 / rhythm) * 1000
    this._hooks = hooks
    this.left = this.compiler(scores.left)
    this.right = this.compiler(scores.right)
    this.leftVolume = 1
    this.rightVolume = 1
  }

  compiler(score) {
    const self = this
    const triggers = []
    for (let i = 0; i < score.length; ++i) {
      const unit = score[i]
      const sounds = unit[1]
      const timer = self.rhythm * unit[0]

      const trigger = async (volume) => {
        return new Promise((resolve) => {
          for (let j = 0; j < sounds.length; ++j) {
            const sound = sounds[j]
            music[sound].start(volume)
          }
          setTimeout(() => {
            resolve()
          }, timer)
        })
      }

      triggers.push(trigger)
    }

    return ({
      volume: 1,
      async start() {
        for (const trigger of triggers) await trigger(this.volume)
      }
    })
  }
}
