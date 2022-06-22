<template>
  <div id="main">
    <div class="piano-content">
      <div id="piano">
        <!-- 钢琴单元度 start -->
        <div class="unit-degree" v-for="degree in keyMap" :key="degree.pitch">
          <!-- 钢琴键 start -->
          <div
            class="key"
            :class="{
              'high-key': degree.pitch !== 0 && index === 1,
              'white-key': key.length === 2,
              'black-key': key.length !== 2,
              'black-key1': degree.pitch === 0 && index === 1,
              'black-key2': index === 2,
              'black-key4': index === 4,
              'black-key7': index === 7,
              'black-key9': index === 9,
              'black-key11': index === 11,
              'white-down': noteHighs[key] && key.length === 2,
              'black-down': noteHighs[key] && key.length !== 2,
              'diff-left-down': diffNoteHighsLeft[key],
              'diff-right-down': diffNoteHighsRight[key],
            }"
            :style="{ background: diffNoteHighsColor[key] }"
            v-for="(key, index) in degree.keys"
            :key="key"
            @mousedown="play(key)"
          >
            <span v-show="isShowKey">{{ key }}</span>
          </div>
          <!-- 钢琴键 end -->
        </div>
        <!-- 钢琴单元度 end -->
      </div>
    </div>
    <!-- 功能扩展 start -->
    <Plugin
      :isShowKey="isShowKey"
      :curSound="curSound"
      :diffFlag="diffFlag"
      @play="
        (key, isLeft) => {
          this.noteHighs[key] = true;
          diffFlag &&
            (isLeft
              ? (this.diffNoteHighsLeft[key] = true)
              : (this.diffNoteHighsRight[key] = true));
        }
      "
      @stop="
        (key) => {
          this.noteHighs[key] = false;
          this.diffNoteHighsLeft[key] = false;
          this.diffNoteHighsRight[key] = false;
        }
      "
      @showKey="(isShowKey) => (this.isShowKey = isShowKey)"
      @changeSound="(curSound) => (this.curSound = curSound)"
      @diff="(diffFlag) => (this.diffFlag = diffFlag)"
    />
    <!-- 功能扩展 end -->
  </div>
</template>

<script>
import { keyMap, noteMap, noteFlags, noteHighs } from "../js/keys";
import { music } from "../js/music";

import Plugin from "./plugin.vue";

export default {
  name: "Piano",
  components: {
    Plugin,
  },
  data() {
    return {
      isShowKey: true, // 是否显示音符
      keyMap: Object.freeze({ ...keyMap }), // 键映射
      noteHighs: { ...noteHighs }, // 高亮标记
      diffFlag: true, // 是否开启区别手势
      diffNoteHighsColor: {}, // 单独按键高亮颜色
      diffNoteHighsLeft: { ...noteHighs }, // 区别手势左
      diffNoteHighsRight: { ...noteHighs }, // 区别手势右
      prevKey: null, // 上一次按下的键
      curSound: "", // 当前音频
    };
  },
  mounted() {
    document.addEventListener("keydown", (e) => this.keydown(e));
    document.addEventListener("keyup", (e) => this.keyup(e));
    document.addEventListener("mouseup", (e) => this.mouseup(e));
  },
  methods: {
    // 播放
    play(key) {
      this.prevKey = key;
      music[this.curSound][key].start();
      this.noteHighs[key] = true;
      if (this.diffFlag) {
        this.diffNoteHighsColor[key] = this.randomColor();
      }
    },
    // 停止
    stop() {
      if (!this.prevKey) return;

      music[this.curSound][this.prevKey].stop();
      this.noteHighs[this.prevKey] = false;
      this.diffNoteHighsColor[this.prevKey] = "";
      this.prevKey = null;
    },
    // 键盘按下
    keydown(e) {
      if (e.ctrlKey && e.code === "F5") return;
      e.preventDefault();
      const code = e.code;
      const shiftKey = e.shiftKey.toString();
      const key = code + shiftKey;
      if (noteMap[key]) {
        noteFlags[key] && music[this.curSound][noteMap[key]].start();
        noteFlags[key] = false;
        this.noteHighs[noteMap[key]] = true;
        if (this.diffFlag) {
          this.diffNoteHighsColor[noteMap[key]] = this.randomColor();
        }
      }
    },
    // 键盘松开
    keyup(e) {
      e.preventDefault();
      const code = e.code;
      const shiftKey = e.shiftKey.toString();
      const key = code + shiftKey;
      if (noteMap[key]) {
        noteFlags[key] = true;
        music[this.curSound][noteMap[key]].stop();
        this.noteHighs[noteMap[key]] = false;
        this.diffNoteHighsColor[noteMap[key]] = "";
      }
    },
    // 鼠标按下
    mouseup(e) {
      this.stop();
    },
    // 随机颜色
    randomColor() {
      return `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(
        Math.random() * 256
      )}, ${Math.floor(Math.random() * 256)})`;
    },
  },
};
</script>

<style lang="less" scoped>
#main {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(at center 40vh, rgb(59, 80, 84) 0%, rgb(0, 16, 20) 100%);
  overflow: hidden;

  .piano-content {
    position: relative;
    height: 90vh;

    #piano {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate3d(-50%, -50%, 0);
      display: flex;
      width: 95vw;
      height: 14vw;
      font-size: 0.4vw;
      text-align: center;

      /** 钢琴单元度 start */
      .unit-degree {
        position: relative;
        display: flex;

        /** 钢琴键 start */
        .key {
          position: relative;
          border-bottom-left-radius: 0.2vw;
          border-bottom-right-radius: 0.2vw;

          span {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0.2vw;
          }

          &::after {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            border-bottom-left-radius: 0.2vw;
            border-bottom-right-radius: 0.2vw;
          }

          &::before {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            box-shadow: 0 -0.3vw 0.6vw rgba(0, 0, 0, 40%) inset;
            border-bottom-left-radius: 0.2vw;
            border-bottom-right-radius: 0.2vw;
          }
        }

        .high-key {
          color: #ff0000 !important;
        }

        /** 白键 start */
        .white-key {
          width: calc(95vw / 52);
          color: #000;
          background-color: rgb(241, 241, 241);
          border: 0.1vw solid #000;
          box-sizing: border-box;
          transition: all 0.2s;

          @media screen and (max-width: 780px) {
            span {
              opacity: 0;
            }
          }
          @media screen and (max-width: 980px) {
            span {
              transform: scale(0.7, 0.7) !important;
            }
          }
        }
        /** 白键 end */

        /** 黑键 start */
        .black-key {
          position: absolute;
          z-index: 2;
          top: 0;
          bottom: 30%;
          width: calc(95vw / 52 / 1.4);
          color: #fff;
          background-color: rgb(70, 70, 70);
          border-left: 0.1vw solid rgba(0, 0, 0, 80%);
          border-right: 0.1vw solid rgba(255, 255, 255, 10%);
          border-bottom: 0.8vw solid rgba(0, 0, 0, 20%);
          box-sizing: border-box;
          transition: all 0.2s;

          @media screen and (max-width: 980px) {
            span {
              opacity: 0;
            }
          }
          @media screen and (max-width: 1430px) {
            span {
              transform: scale(0.5, 0.5) !important;
            }
          }
          @media screen and (max-width: 1680px) {
            span {
              transform: scale(0.7, 0.7);
            }
          }

          &::after {
            content: "";
            display: block;
            width: calc(100% + 0.05vw);
            height: calc(100% + 0.7vw);
            position: absolute;
            top: 0;
            left: -0.1vw;
            border: 0.1vw solid #000;
            border-top: none;
            transition: all 0.2s;
          }

          &::before {
            content: "";
            display: block;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
            border: 0.1vw solid rgba(255, 255, 255, 40%);
            border-top: 0.1vw solid rgba(255, 255, 255, 10%);
            border-left: 0.1vw solid rgba(255, 255, 255, 10%);
            border-right: none;
            border-bottom-left-radius: 0.5vw;
            border-bottom-right-radius: 0.5vw;
            transition: all 0.2s;
          }
        }
        /** 黑键 end */

        /** 黑键定位 start */
        .black-key1 {
          left: 63%;
        }
        .black-key2 {
          left: 23%;
        }
        .black-key4 {
          left: 38%;
        }
        .black-key7 {
          left: 65%;
        }
        .black-key9 {
          left: 80.5%;
        }
        .black-key11 {
          left: 96%;
        }
        /** 黑键定位 end */

        /** 白键按下 start */
        .white-down {
          box-shadow: 0 -1.2vw 1.2vw rgba(0, 0, 0, 20%) inset;
          background-image: linear-gradient(to bottom, #fff, rgb(241, 241, 241));
          transform: rotateY(15deg);
        }
        /** 白键按下 end */

        /** 黑键按下 start */
        .black-down {
          border-bottom: 0.6vw solid rgba(0, 0, 0, 20%);
          box-shadow: 0 -1.2vw 1.2vw rgba(255, 255, 255, 20%) inset;

          &::after {
            height: calc(100% + 0.5vw);
          }
        }
        /** 黑键按下 end */

        /** 区别色 start */
        .diff-left-down {
          background: rgb(211, 255, 144) !important;
        }
        .diff-right-down {
          background: rgb(144, 170, 255) !important;
        }
        /** 区别色 end */

        /** 钢琴键 end */
      }
      /** 钢琴单元度 end */
    }
  }
}
</style>
