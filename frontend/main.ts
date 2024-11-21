import { createApp } from 'vue';
import './style.css'
import App from './App.vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles'; // Importer les styles de base
import '@mdi/font/css/materialdesignicons.css';
import CharacterList from "./components/CharacterList.vue";
import Graph from "./components/Graph.vue";
import {createRouter, createWebHistory} from "vue-router";

const vuetify = createVuetify({
    components,
    directives,
});

const routes = [
    { path: '/', component: CharacterList },
    { path: '/graph', component: Graph },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.mount('#app');
