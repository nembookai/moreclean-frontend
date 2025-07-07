import { createRouter, createWebHistory } from 'vue-router'

import unauthorizedRoutes from './unauthorized';
import singleRoutes from './single';

const routes = [
  ...unauthorizedRoutes,
  ...singleRoutes,
  { path: '/:pathMatch(.*)*', name: 'notFound', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Siden findes ikke - MoreClean' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router