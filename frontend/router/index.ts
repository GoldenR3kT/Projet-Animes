import { createRouter, createWebHistory } from 'vue-router';
import CharacterList from '../views/CharacterList.vue';
import Graph from '../views/Graph.vue';

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
