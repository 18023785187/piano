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
