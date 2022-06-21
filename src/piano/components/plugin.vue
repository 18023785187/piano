<template>
  <div
    id="plugin"
    v-loading.fullscreen.lock="soundLoading"
    element-loading-text="音频加载中"
    element-loading-background="rgba(0, 0, 0, 0.8)"
  >
    <!---->
    <div class="show-key btn" @click="showKey">
      <span>{{ isShowKey ? "隐藏音符" : "显示音符" }}</span>
    </div>
    <!---->
    <div class="sound-select btn">
      <span>音效选择</span>
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
            {{ "🎵 - " + tag }}
          </div>
        </div>
      </div>
    </div>
    <!---->
    <div class="auto-play btn">
      <span>自动弹奏</span>
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
            {{ Number(index) + 1 + " - " + score.name }}
          </div>
        </div>
      </div>
    </div>
    <!---->
    <div class="play btn" @click="play">
      <span>{{ isPlay ? "停止" : "播放" }}</span>
    </div>
    <!---->
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
      </div>
      <span>节拍器</span>
    </div>
    <!---->
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
      </div>
      <span>音量</span>
    </div>
    <!---->
    <div class="progress-bar btn">
      <span>进度：</span>
      <div class="progress">
        <el-slider
          v-model="progress"
          :min="0"
          :max="maxRhythm"
          :step="0.125"
          @input="step"
        ></el-slider>
      </div>
    </div>
    <!---->
  </div>
</template>

<script>
import { setPianoVolume, tags_map, load } from "../js/music";
import { scoreMap } from "@/assets/music-score/score-map";
import { Auto } from "../js/Auto";

let auto = null;

export default {
  name: "Plugin",
  props: {
    isShowKey: Boolean, // 音符显示阀
    curSound: String, // 当前音频标识
  },
  data() {
    return {
      soundLoading: false, // 加载音频阀
      isPlay: false, // 是否播放
      rhythm: 0, // 节拍
      volume: 1, // 音量
      scoreMap: Object.freeze({ ...scoreMap }),
      scoreIndex: -1,
      tags_map: Object.freeze({ ...tags_map }),
      progress: 0, // 进度条
      maxRhythm: 0, // 进度条上限
    };
  },
  created() {
    this.changeSound("经典钢琴");
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

      this.soundLoading = true;
      if (this.isDefineAuto()) {
        this.play();
        auto.sound = tag;
      }
      this.$emit("changeSound", tag);
      load(tag, (residue) => {
        if (residue === 0) this.soundLoading = false;
      });
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
          play: (key) => this.$emit("play", key),
          stop: (key) => this.$emit("stop", key),
          change: (progress) => this.progress = progress,
          end: () => this.play(),
        }
      );
      auto.leftVolume = score.leftVolume;
      auto.rightVolume = score.rightVolume;
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
      if(this.isDefineAuto()) {
        auto.progress = newProgress
      }
    },
  },
};
</script>

<style lang="less" scoped>
#plugin {
  display: flex;
  align-items: center;
  position: relative;
  width: 100vw;
  height: 5vh;
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
    padding: 0.4vw;
    margin-right: 0.4vw;
    line-height: 14px;
    border-radius: 3px;
    -webkit-border-radius: 3px;
    -moz-border-radius: 3px;
    width: 100px;
    white-space: nowrap;
    transition: all 0.3s;

    &:hover {
      color: #fff;
      background: rgba(187, 204, 170, 0.35);
    }
  }
  /** 按钮 end */

  /** 选择框 start */
  .selector {
    display: none;
    position: absolute;
    top: calc(-40vh - 0.4vw - 20px);
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
      bottom: -0.4vw;
      height: 0.4vw;
    }

    &:hover {
      display: block;
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
      display: block;
    }
  }

  .rhythm,
  .volume {
    .selector {
      top: calc(-20vh - 0.4vw - 40px);
      width: auto;
      height: auto;
      padding: 20px 3px;
    }
    &:hover > .selector {
      display: block;
    }
  }

  .progress-bar {
    flex: 1;
    display: flex;
    align-items: center;

    .progress {
      flex: 1;
      padding: 0 1vw;
    }
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
