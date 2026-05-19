import { createRouter, createWebHistory } from 'vue-router';
import GameView from '../App.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: GameView, // Esto le dice a Vue qué mostrar al iniciar
    },
  ],
});

export default router;
