
import { music } from './music'

const STEP = 0.125 // 由于 js 计算精度限制，最小步长为 1/32 分音符🎶

export class Auto {
  constructor(rhythm, spectrum, hooks) {
    this.rhythm = rhythm // 一分钟拍数
    // this._rhythmTime = (60 / this._rhythm) * 1000 // 一拍时长
    // this._progress = 0 // 进度
    this._spectrum = this.compiler(spectrum) // 音谱
    this._hooks = hooks // 钩子
    this._player_map = new Map() // 正在播放的音阶
    this._timer = null
  }

  set rhythm(newRhythm) {
    this._rhythm = newRhythm
    this._rhythmTime = Math.floor((60 / this._rhythm) * 1000)
  }
  get rhythm() {
    return this._rhythm
  }

  /**
   * 编译乐谱
   * @param {*} spectrum 
   * @returns 
   */
  compiler(spectrum) {
    function handler(hand) {
      const player = []

      let progress = 0
      for (let i = 0; i < hand.length; ++i) {
        player.push([progress, [...hand[i][1]], hand[i][2] ? hand[i][2] : hand[i][0], hand[i][3]])
        progress += hand[i][0]
      }

      return {
        volume: 1,
        player: player,
        pos: 0,
      }
    }

    return {
      left: handler(spectrum.left),
      right: handler(spectrum.right),
    }
  }

  play() {
    if (this._progress == null) this.progress = 0
    this._timer = setTimeout(() => {
      this.progress = this._progress + STEP
      this.play()
      console.log(Math.floor(this._rhythmTime * STEP))
    }, Math.floor(this._rhythmTime * STEP))
  }
  stop() {
    clearTimeout(this._timer)
  }

  set leftVolume(newVolume) {
    this._spectrum.left.volume = newVolume
  }
  get leftVolume() {
    return this._spectrum.left.volume
  }
  set rightVolume(newVolume) {
    this._spectrum.right.volume = newVolume
  }
  get rightVolume() {
    return this._spectrum.right.volume
  }
  set progress(newProgress) {
    this._progress = newProgress
    const leftEnd = !handle.call(this, this._spectrum.left)
    const rightEnd = !handle.call(this, this._spectrum.right)
    if (leftEnd && rightEnd) this.stop()

    function handle(player) {
      const pos = player.pos
      if (pos >= player.player.length) return false
      const fragment = player.player[pos]
      if (this._progress === fragment[0]) {
        for (let i = 0; i < fragment[1].length; ++i) {
          if (this._player_map.has(fragment[1][i])) {
            this._hooks?.stop?.(fragment[1][i])
            clearTimeout(fragment[1][i])
            this._player_map.delete(fragment[1][i])
          }

          this._hooks?.play?.(fragment[1][i])
          music[fragment[1][i]].start(fragment[3] != null ? fragment[3] : player.volume)

          const stopTimer = setTimeout(() => {
            this._hooks?.stop?.(fragment[1][i])
            music[fragment[1][i]].stop()
            this._player_map.delete(fragment[1][i])
          }, this._rhythmTime * fragment[2])
          this._player_map.set(fragment[1][i], stopTimer)
        }
        player.pos++
      }
      return true
    }
  }
}