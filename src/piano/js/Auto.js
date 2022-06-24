
import { music } from './music'

const STEP = 0.125 // 由于 js 计算精度限制，最小步长为 1/32 分音符 🎶

/**
 * 自动播放器
 */
export class Auto {
  /**
   * @typedef {{ play?: (key, isLeft) => void, stop?: (key) => void, change?: (progress) => void, end?: () => {}, rhythm?: (rhythm) => void }} Hooks
   * @param {string} sound 音频
   * @param {number} rhythm 每分钟节拍数 
   * @param {*} spectrum 曲谱
   * @param {Hooks} hooks 钩子函数，分别有 每个音符的播放、结束，进度改变，播放结束，节拍变换钩子
   */
  constructor(sound, rhythm, spectrum, hooks) {
    this.sound = sound // 音频
    this.rhythm = rhythm // 一分钟拍数
    this.autoRhythmFlag = true // 是否自动更新节拍，如果 false 那么将不能自动更新节拍
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
    if (this._rhythm === newRhythm) return
    this._rhythm = newRhythm
    this._rhythmTime = Math.floor((60 / this._rhythm) * 1000)
    this._hooks?.rhythm?.(this._rhythm)
  }
  get rhythm() {
    return this._rhythm
  }

  /**
   * 编译乐谱
   * @param {*} spectrum 原始曲谱
   * @returns 
   */
  compiler(spectrum) {
    const self = this
    const startRhythm = this._rhythm
    function handler(hand) {
      const player = {}

      let progress = 0 // 进度累加
      const rhythmMap = [] // 节拍映射，在大于或等于特定进度时变换节拍
      for (let i = 0; i < hand.length; ++i) {
        if (hand[i][4]) rhythmMap.push([progress, hand[i][4]]) // 节拍对应的进度数
        player[progress] = [[...hand[i][1]], (hand[i][2] ? hand[i][2] : hand[i][0]), hand[i][3]]
        progress += hand[i][0]
      }
      if (!rhythmMap.length || rhythmMap[0][0] !== 0) rhythmMap.unshift([0, startRhythm])

      return {
        volume: 1, // 该谱的音量
        flag: true, // 是否弹奏，false 的时候不会弹奏
        player: player, // 播放器
        maxRhythm: progress, // 最大累加拍数
        rhythmChange: () => {
          for (let i = rhythmMap.length - 1; i >= 0; --i) {
            if (self._progress >= rhythmMap[i][0]) {
              self.rhythm = rhythmMap[i][1]
              break
            }
          }
        }
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
    this._timer = setTimeout(() => {
      if (this._progress >= this.maxRhythm) { // 播放结束
        this._progress = null
        this._hooks?.end?.()
        return
      }

      this.progress = this._progress == null ? 0 : this._progress + STEP
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
  set leftFlag(newLeftFlag) {
    this._spectrum.left.flag = newLeftFlag
  }
  get leftFlag() {
    return this._spectrum.left.flag
  }
  set rightFlag(newRightFlag) {
    this._spectrum.right.flag = newRightFlag
  }
  get rightFlag() {
    return this._spectrum.right.flag
  }
  /**
   * 设置进度并触发播放
   * @param {number} newProgress
   */
  set progress(newProgress) {
    if (this._progress === newProgress) return
    this._progress = newProgress
    this._spectrum.left.flag && handle.call(this, this._spectrum.left, true)
    this._spectrum.right.flag && handle.call(this, this._spectrum.right, false)

    /**
     * 处理曲谱
     * @param {*} player 曲谱
     */
    function handle(player, isLeft) {
      const fragment = player.player[this._progress] // 取出片段
      if (!fragment) return // 没有匹配片段，返回
      this.autoRhythmFlag && player.rhythmChange()

      const sounds = fragment[0] // 取出音符数组
      for (let i = 0; i < sounds.length; ++i) {
        if (this._player_map.has(sounds[i])) { // 如果准备播放的音阶正在播放，那么先停止播放，避免冲突
          this._hooks?.stop?.(sounds[i])
          clearTimeout(this._player_map.get(sounds[i]))
          this._player_map.delete(sounds[i])
        }

        this._hooks?.play?.(sounds[i], isLeft)
        music[this.sound][sounds[i]].start(fragment[2] != null ? fragment[2] : player.volume)

        const stopTimer = setTimeout(() => { // 根据时域设置停止该音阶播放的时间
          this._hooks?.stop?.(sounds[i])
          music[this.sound][sounds[i]].stop()
          this._player_map.delete(sounds[i])
        }, this._rhythmTime * fragment[1])
        this._player_map.set(sounds[i], stopTimer) // 把该播放中的音阶存入 this._player_map 中
      }
    }
  }
}
