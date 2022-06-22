<template>
  <div
    id="plugin"
    v-loading.fullscreen.lock="residue !== 0"
    :element-loading-text="'音频加载中，剩余加载数：' + residue"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <!-- 音效 -->
    <div class="sound-select btn">
      <span>🎶 音效选择</span>
      <div class="selector">
        <div class="title">音效 目录</div>
        <div class="list">
          <div
            class="item"
            :class="{ 'item-high': curSound === tag }"
            v-for="(map, tag) in tags_map"
            :key="tag"
            @click="changeSound(tag)"
          >
            <span>{{ "🎵 - " + tag }}</span>
            <span>{{ curSound === tag ? "✔" : "" }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 自动弹奏 -->
    <div class="auto-play btn">
      <span>🤘 自动弹奏</span>
      <div class="selector">
        <div class="title">歌曲 目录</div>
        <div class="list">
          <div
            class="item"
            :class="{ 'item-high': scoreIndex === index }"
            v-for="(score, index) in scoreMap"
            :key="score.name"
            @click="autoPlay(score, index)"
          >
            <span>{{ Number(index) + 1 + " - " + score.name }}</span>
            <span>{{ scoreIndex === index ? "✔" : "" }}</span>
          </div>
        </div>
      </div>
    </div>
    <!-- 进度、播放、停止 -->
    <div class="progress-bar btn">
      <span class="play" @click="play">{{ isPlay ? "⏸️ 停止" : "▶️ 播放" }}</span>
      <div class="progress">
        <el-slider
          v-model="progress"
          :min="0"
          :max="maxRhythm"
          :step="0.125"
          @input="step"
        ></el-slider>
      </div>
      <span style="font-weight: bold"
        >{{ ((progress / maxRhythm) * 100).toFixed(2) }}%</span
      >
    </div>
    <!-- 音量 -->
    <div class="volume btn">
      <div class="selector">
        <el-slider
          v-model="volume"
          vertical
          height="20vh"
          :min="0"
          :max="1"
          :step="0.05"
          @input="volumeChange"
        ></el-slider>
        <div class="description">{{ volume }}</div>
      </div>
      <span>{{ volumeEmoji }} 音量</span>
    </div>
    <!-- 节拍 -->
    <div class="rhythm btn">
      <div class="selector">
        <el-slider
          v-model="rhythm"
          vertical
          height="20vh"
          :min="15"
          :max="300"
          @change="rhythmChange"
        ></el-slider>
        <div class="description">{{ rhythm }}</div>
      </div>
      <span>👏 节拍</span>
    </div>
    <!-- 按下颜色 -->
    <div class="diff btn" @click="diff">
      <span>🎹 {{ diffFlag ? "关闭" : "开启" }}按键颜色</span>
    </div>
    <!-- 音符 -->
    <div class="show-key btn" @click="showKey">
      <span>🎼 {{ isShowKey ? "隐藏音符" : "显示音符" }}</span>
    </div>
    <!-- 左手 -->
    <div class="left btn" @click="setLeftFlag">
      <span>{{ leftFlag ? "💤 关闭" : "👈 开启" }}左手</span>
    </div>
    <!-- 右手 -->
    <div class="right btn" @click="setRightFlag">
      <span>{{ rightFlag ? "💤 关闭" : "👉 开启" }}右手</span>
    </div>
    <!---->
  </div>
</template>

<script>
import { setPianoVolume, tags_map, load } from "../js/music";
import { scoreMap } from "@/assets/music-score/score-map";
import { Auto } from "../js/Auto";

let auto = null; // 播放器全局唯一

export default {
  name: "Plugin",
  props: {
    isShowKey: Boolean, // 音符显示阀
    curSound: String, // 当前音频标识
    diffFlag: Boolean, // 手颜色
  },
  data() {
    return {
      residue: 0, // 剩余加载音频数，0 表示已加载完成
      isPlay: false, // 是否播放
      leftFlag: true, // 左手弹奏
      rightFlag: true, // 右手弹奏
      rhythm: 0, // 节拍
      volume: 1, // 音量
      scoreMap: Object.freeze({ ...scoreMap }),
      scoreIndex: -1,
      tags_map: Object.freeze({ ...tags_map }),
      progress: 0, // 进度条
      maxRhythm: 9999999, // 进度条上限
    };
  },
  created() {
    this.changeSound("经典钢琴");
  },
  computed: {
    // 音量 emoji
    volumeEmoji() {
      if (this.volume <= 0) return "🔇";
      else if (this.volume <= 0.25) return "🔈";
      else if (this.volume <= 0.5) return "🔉";
      else return "🔊";
    },
  },
  methods: {
    // 检测 auto 是否存在
    isDefineAuto() {
      return auto != null;
    },
    // 显示音符
    showKey() {
      this.$emit("showKey", !this.isShowKey);
    },
    // 切换音源
    changeSound(tag) {
      if (this.curSound === tag) return;

      if (this.isDefineAuto()) {
        this.play();
        auto.sound = tag;
      }
      this.$emit("changeSound", tag);
      load(
        tag,
        (sum) => (this.residue = sum),
        (residue) => (this.residue = residue)
      );
    },
    // 自动弹奏
    autoPlay(score, index) {
      if (this.scoreIndex === index) return;

      this.isPlay && this.play();
      auto = new Auto(
        this.curSound,
        score.rhythm,
        {
          left: score.left,
          right: score.right,
        },
        {
          play: (key, isLeft) => this.$emit("play", key, isLeft),
          stop: (key) => this.$emit("stop", key),
          change: (progress) => (this.progress = progress),
          end: () => this.play(),
        }
      );
      auto.leftVolume = score.leftVolume;
      auto.rightVolume = score.rightVolume;
      auto.leftFlag = this.leftFlag;
      auto.rightFlag = this.rightFlag;
      this.rhythm = score.rhythm;
      this.maxRhythm = auto.maxRhythm;
      this.play();

      this.scoreIndex = index;
    },
    // 播放或停止
    play() {
      if (!this.isDefineAuto()) return;

      !this.isPlay ? auto.play() : auto.stop();
      this.isPlay = !this.isPlay;
    },
    // 是否开启手颜色
    diff() {
      this.$emit("diff", !this.diffFlag);
    },
    // 左手弹奏
    setLeftFlag() {
      this.leftFlag = !this.leftFlag;
      if (this.isDefineAuto()) {
        auto.leftFlag = this.leftFlag;
      }
    },
    // 右手弹奏
    setRightFlag() {
      this.rightFlag = !this.rightFlag;
      if (this.isDefineAuto()) {
        auto.rightFlag = this.rightFlag;
      }
    },
    // 改变节拍
    rhythmChange(newRhythm) {
      if (!this.isDefineAuto()) return;

      auto.rhythm = newRhythm;
    },
    // 改变音量
    volumeChange(newVolume) {
      setPianoVolume(newVolume);
    },
    // 跳转进度
    step(newProgress) {
      if (this.isDefineAuto()) {
        auto.progress = newProgress;
      }
    },
  },
};
</script>

<style lang="less" scoped>
#plugin {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  position: absolute;
  bottom: 1vh;
  width: 100vw;
  padding: 0 3vw;
  font-size: 14px;
  box-sizing: border-box;

  /** 按钮 start */
  .btn {
    position: relative;
    height: 14px;
    color: #ddd;
    background: rgba(170, 187, 170, 0.35);
    border: 1px solid #898;
    padding: 0.6vw 0.8vw;
    margin-right: 0.4vw;
    margin-top: 0.4vw;
    line-height: 14px;
    border-radius: 3px;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    white-space: nowrap;
    transition: all 0.3s;

    &:hover {
      color: #fff;
      background: rgba(230, 255, 206, 0.35);
    }
  }
  /** 按钮 end */

  /** 选择框 start */
  .selector {
    position: absolute;
    top: calc(-40vh - 0.6vw - 20px);
    left: 0;
    width: 20vw;
    height: 40vh;
    padding: 10px;
    background: #fea;
    color: #444;
    font-size: 12px;
    text-shadow: #ccc 1px 1px;
    border-radius: 6px;
    box-shadow: 2px 2px 5px rgb(0, 0, 0, 25%);
    transition: all 0.2s;
    visibility: hidden;
    opacity: 0;

    &::after {
      content: "";
      position: absolute;
      left: 0.8vw;
      bottom: -0.8vw;
      border: 0.4vw solid transparent;
      border-top: 0.4vw solid #fea;
    }

    &::before {
      content: "";
      position: absolute;
      left: 0;
      right: 0;
      bottom: -0.6vw;
      height: 0.6vw;
    }

    &:hover {
      visibility: visible;
      opacity: 1;
    }

    .title {
      border-bottom: 1px solid #f84;
      font-size: 16px;
      font-weight: bold;
      padding-bottom: 10px;
      margin-bottom: 10px;
    }

    .list {
      width: 100%;
      height: calc(100% - 35px);
      overflow: auto;

      .item {
        display: flex;
        justify-content: space-between;
        padding: 0.4vw;
        margin-bottom: 0.4vw;
        background: rgb(248, 248, 248);
        border: 1px solid rgb(248, 248, 248);
        border-radius: 6px;
        cursor: pointer;

        &:hover {
          font-weight: bold;
          background: #fff;
        }
      }
      .item-high {
        font-weight: bold;
        background: #fff;
        border: 1px solid #f84;
      }
    }
  }
  /** 选择框 end */

  .sound-select,
  .auto-play {
    &:hover > .selector {
      visibility: visible;
      opacity: 1;
    }
  }

  .rhythm,
  .volume {
    .selector {
      display: flex;
      flex-direction: column;
      align-items: center;
      top: calc(-20vh - 0.4vw - 40px - 3vh);
      width: 100%;
      height: auto;
      padding: 20px 3px;

      .description {
        height: 2vh;
        line-height: 2vh;
        margin-top: 1vh;
      }
    }
    &:hover > .selector {
      visibility: visible;
      opacity: 1;
    }
  }

  .progress-bar {
    flex: 1;
    display: flex;
    align-items: center;

    .play {
      position: absolute;
      left: 0vw;
      display: flex;
      align-items: center;
      height: 100%;
      cursor: pointer;
      width: 50px;
      padding: 0 0.8vw;
    }

    .progress {
      flex: 1;
      padding: 0 2vw;
      margin-left: calc(50px + 0.8vw + 1px);
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(50px + 1.6vw + 1px);
      width: 1px;
      background: #898;
    }
  }

  .diff, .show-key, .left, .right {
    cursor: pointer;
  }
}

/deep/ .el-slider__runway {
  background: rgb(90, 88, 88);
}
/deep/ .el-slider__bar {
  background: rgb(194, 11, 11);
}
/deep/ .el-slider__button {
  border-color: rgb(194, 11, 11);
}
</style>
