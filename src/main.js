import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 导入element-ui插件
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

// 导入树形表格库
import TreeTable from 'vue-table-with-tree-grid'
// 全局注册tree-table组件
Vue.component('tree-table', TreeTable);

// 导入富文本编辑器组件
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器组件样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

Vue.use(VueQuillEditor)

// 导入axios
import axios from 'axios';
// 配置请求根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'

// 设置axios请求拦截器，每次请求在请求头中加上token
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token');
  return config;
})

// 全局挂载axios
Vue.prototype.$http = axios

// 导入全局样式
import './style/global.css'
// 导入dayjs库用于时间格式化
import dayjs from 'dayjs'
// 注册全局时间格式化过滤器
Vue.filter('dateFormat', function(originTime, format='YYYY年MM月DD日 HH:mm:ss'){
  return dayjs(originTime).format(format);
})


Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router,
}).$mount('#app')
