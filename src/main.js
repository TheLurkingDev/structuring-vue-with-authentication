import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import { TokenService } from '../services/storage.service';
import { ApiService } from '../services/api.service';

Vue.config.productionTip = false

// Set base url of api
ApiService.init(process.env.VUE_APP_ROOT_API);

// If token exists, set header
if(TokenService.getToken()) {
  ApiService.setHeader();
}

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
