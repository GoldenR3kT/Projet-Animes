import { createApp } from 'vue';
import './style.css'
import App from './App.vue';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles'; // Importer les styles de base
import '@mdi/font/css/materialdesignicons.css';
import CharacterList from "./views/CharacterList.vue";
import Graph from "./views/Graph.vue";
import CharacterDetail from './views/CharacterDetail.vue';
import {createRouter, createWebHistory} from "vue-router";
import AddCharacter from "./views/AddCharacter.vue";
import RandomCharacter from "./views/RandomCharacter.vue";

const vuetify = createVuetify({
    components,
    directives,
});

const routes = [
    { path: '/', component: CharacterList },
    { path: '/graph', component: Graph },
    { path: '/addCharacter', component: AddCharacter },
    {
        path: '/details/:anime/:character',
        name: 'CharacterDetail',
        component: CharacterDetail,
        props: true,
    },
    {path: '/randomCharacter', component: RandomCharacter},
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const app = createApp(App);
app.use(vuetify);
app.use(router);
app.mount('#app');
