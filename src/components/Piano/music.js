
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

const FADE_OUT_TIME = 300; // 声音淡出时间
(async () => {
  const keyMap = Object.keys(audioDatas)
  for (let i = 0; i < keyMap.length; ++i) {
    const key = keyMap[i]
    const url = audioDatas[key]
    const buffer = await getBuffer(url)
    let gain // 音量控制
    let source // 源

    music[key] = {
      start() { // 每次播放一个源
        gain = audioContext.createGain()
        gain.connect(audioContext.destination)
        source = getSource(buffer)
        source.connect(gain)
        source.start()
      },
      stop() { // 该源慢慢停止
        if (!source) return
        gain.gain.linearRampToValueAtTime(0.0, audioContext.currentTime + FADE_OUT_TIME / 1000)
        source.stop(audioContext.currentTime + FADE_OUT_TIME / 1000)
      }
    }
  }
})()
