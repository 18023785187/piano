import Vue from 'vue'
import App from './App.vue'

import { Slider, Loading } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/assets/style/base.css'

Vue.config.productionTip = false

Vue.use(Slider)
Vue.use(Loading)

new Vue({
  render: h => h(App)
}).$mount('#app')

console.log('%c👋 Welcome to my developer console', 'font-size: 20px; color: #f00;')
console.log('👽 Github: https://github.com/18023785187/piano')
console.log('💬 Weixin: 18023785187')
