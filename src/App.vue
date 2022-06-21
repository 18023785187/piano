<template>
  <div id="app">
    <Piano />
  </div>
</template>

<script>
import Piano from './piano/components/piano.vue'

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
}
</style>
