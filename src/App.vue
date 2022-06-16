<template>
  <div id="app">
    <Piano />
    <!-- <router-view/> -->
  </div>
</template>

<script>
import Piano from './components/Piano'

export default {
  components: {
    Piano
  }
}
</script>

<style lang="less">
#app {
  width: 100vw;
  height: 100vh;
  background: radial-gradient(at center center, rgb(59, 80, 84) 0%, rgb(0, 16, 20) 100%);
}
</style>
