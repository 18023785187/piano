
import { music } from './music'

const STEP = 0.125 // 由于 js 计算精度限制，最小步长为 1/32 分音符🎶

/**
 * 自动播放器
 */
export class Auto {
  constructor(sound, rhythm, spectrum, hooks) {
    this.sound = sound // 音频
    this.rhythm = rhythm // 一分钟拍数
    // this._rhythmTime = (60 / this._rhythm) * 1000 // 一拍时长
    // this._progress = 0 // 进度
    this._spectrum = this.compiler(spectrum) // 音谱
    this._hooks = hooks // 钩子
    this._player_map = new Map() // 正在播放的音阶
    this._timer = null // 播放定时器标识
    this.maxRhythm = Math.max(this._spectrum.left.maxRhythm, this._spectrum.right.maxRhythm) // 最大节拍数
  }

  /**
   * 设置拍数并计算每拍时长
   */
  set rhythm(newRhythm) {
    this._rhythm = newRhythm
    this._rhythmTime = Math.floor((60 / this._rhythm) * 1000)
  }
  get rhythm() {
    return this._rhythm
  }

  /**
   * 编译乐谱
   * @param {*} spectrum 原始音谱
   * @returns 
   */
  compiler(spectrum) {
    function handler(hand) {
      const player = {}

      let progress = 0 // 进度累加
      for (let i = 0; i < hand.length; ++i) {
        player[progress] = [[...hand[i][1]], (hand[i][2] ? hand[i][2] : hand[i][0]), hand[i][3]]
        progress += hand[i][0]
      }

      return {
        volume: 1,
        player: player,
        maxRhythm: progress
      }
    }

    return {
      left: handler(spectrum.left),
      right: handler(spectrum.right),
    }
  }
  /**
   * 播放音乐
   */
  play() {
    if (this._progress == null) this.progress = 0

    this._timer = setTimeout(() => {
      if (this._progress >= this.maxRhythm) {
        this._progress = null
        this._hooks?.end?.()
        return
      }

      this.progress = this._progress + STEP
      this._hooks?.change?.(this._progress)
      this.play()
    }, Math.floor(this._rhythmTime * STEP))
  }
  /**
   * 停止
   */
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
  /**
   * 设置进度并触发播放
   * @param {number} newProgress
   */
  set progress(newProgress) {
    if(this._progress === newProgress) return
    this._progress = newProgress
    handle.call(this, this._spectrum.left)
    handle.call(this, this._spectrum.right)

    /**
     * 检索音谱当前指针位置是否达到播放要求并处理
     * @param {*} player 音谱
     */
    function handle(player) {
      const fragment = player.player[this._progress]
      if (!fragment) return
      const sounds = fragment[0]
      for (let i = 0; i < sounds.length; ++i) {
        if (this._player_map.has(sounds[i])) { // 如果准备播放的音阶正在播放，那么先停止播放
          this._hooks?.stop?.(sounds[i])
          clearTimeout(this._player_map.get(sounds[i]))
          this._player_map.delete(sounds[i])
        }

        this._hooks?.play?.(sounds[i])
        music[this.sound][sounds[i]].start(fragment[2] != null ? fragment[2] : player.volume)

        const stopTimer = setTimeout(() => { // 根据时域设置停止该音阶播放的时间
          this._hooks?.stop?.(sounds[i])
          music[this.sound][sounds[i]].stop()
          this._player_map.delete(sounds[i])
        }, this._rhythmTime * fragment[1])
        this._player_map.set(sounds[i], stopTimer) // 把播放中的该音阶存入 this._player_map 中
      }
    }
  }
}