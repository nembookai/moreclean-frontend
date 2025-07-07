import { createApp } from 'vue'
import { createPinia } from 'pinia'
import vClickOutside from "click-outside-vue3"
import VueDatePicker from '@vuepic/vue-datepicker';
import axios from 'axios'
import router from './router'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL;

import App from './App.vue'
import moment from 'moment';
import 'moment/dist/locale/da';
moment.locale('da');

const app = createApp(App)

app.component('VueDatePicker', VueDatePicker);

app.use(createPinia())
app.use(router)
app.use(vClickOutside)
app.component('QuillEditor', QuillEditor)

app.mount('#app')
