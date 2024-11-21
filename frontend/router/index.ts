import { createRouter, createWebHistory } from 'vue-router';
import CharacterList from '../components/CharacterList.vue';
import Graph from '../components/Graph.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: CharacterList,
    },
    {
        path: '/graph',
        name: 'Graph',
        component: Graph,
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
