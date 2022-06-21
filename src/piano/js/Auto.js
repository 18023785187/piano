
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
      const player = []

      let progress = 0 // 进度累加
      for (let i = 0; i < hand.length; ++i) {
        player.push([progress, [...hand[i][1]], (hand[i][2] ? hand[i][2] : hand[i][0]), hand[i][3]])
        progress += hand[i][0]
      }

      return {
        volume: 1,
        player: player,
        pos: 0,
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
        this.skip(0)
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
  /**
   * 进度跳转
   * @param {number} progress 
   * @returns 
   */
  skip(progress) {
    if (progress <= 0 || progress >= this.maxRhythm) {
      this._progress = null
      this._spectrum.left.pos = 0
      this._spectrum.right.pos = 0
    } else {
      lookup(this._spectrum.left)
      lookup(this._spectrum.right)
      this.progress = progress
      this._hooks?.change?.(progress)
    }

    /**
     * 查找并修改歌谱中适合位置的索引
     * @param {*} spectrum 歌谱
     */
    function lookup(spectrum) {
      const player = spectrum.player
      let l = 0
      let r = player.length
      while (l <= r) {
        const m = Math.floor((l + r) / 2)
        if (player[m][0] === progress) {
          spectrum.pos = m
          break
        } else if (player[m][0] < progress && player[m + 1][0] >= progress) {
          spectrum.pos = m + 1
          break
        } else if (player[m][0] < progress) {
          l = m + 1
        } else {
          r = m - 1
        }
      }
    }
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
    this._progress = newProgress
    handle.call(this, this._spectrum.left)
    handle.call(this, this._spectrum.right)

    /**
     * 检索音谱当前指针位置是否达到播放要求并处理
     * @param {*} player 音谱
     */
    function handle(player) {
      if (player.pos >= player.player.length) return

      const fragment = player.player[player.pos]
      if (this._progress === fragment[0]) { // 达到条件进度，播放音阶
        player.pos++ // 该音谱播放步进一位
        for (let i = 0; i < fragment[1].length; ++i) {
          if (this._player_map.has(fragment[1][i])) { // 如果准备播放的音阶正在播放，那么先停止播放
            this._hooks?.stop?.(fragment[1][i])
            clearTimeout(this._player_map.get(fragment[1][i]))
            this._player_map.delete(fragment[1][i])
          }

          this._hooks?.play?.(fragment[1][i])
          music[this.sound][fragment[1][i]].start(fragment[3] != null ? fragment[3] : player.volume)

          const stopTimer = setTimeout(() => { // 根据时域设置停止该音阶播放的时间
            this._hooks?.stop?.(fragment[1][i])
            music[this.sound][fragment[1][i]].stop()
            this._player_map.delete(fragment[1][i])
          }, this._rhythmTime * fragment[2])
          this._player_map.set(fragment[1][i], stopTimer) // 把播放中的该音阶存入 this._player_map 中
        }
      }
    }
  }
}