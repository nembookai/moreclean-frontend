import { createRouter, createWebHistory } from 'vue-router'

import unauthorizedRoutes from './unauthorized';
import singleRoutes from './single';
import customerRoutes from './customer';
import employeesRoutes from './employees';
import employeeViewRoutes from './employeeView';

const routes = [
  ...unauthorizedRoutes,
  ...singleRoutes,
  ...customerRoutes,
  ...employeeViewRoutes,
  ...employeesRoutes,
  { path: '/:pathMatch(.*)*', name: 'notFound', component: () => import('../views/NotFoundView.vue'), meta: { title: 'Siden findes ikke - MoreClean' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router