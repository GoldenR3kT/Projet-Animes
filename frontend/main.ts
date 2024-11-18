import { createApp } from 'vue';
import './style.css'
import App from './App.vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles'; // Importer les styles de base
import '@mdi/font/css/materialdesignicons.css'; // (Facultatif) Importer les icônes

const vuetify = createVuetify({
    components,
    directives,
});

const app = createApp(App);
app.use(vuetify);
app.mount('#app');
