import authMiddleware from "@/middleware/auth";
import guest from '@/middleware/guest.js';

export default [
  { path: '/', alias: '/login', name: 'login', component: () => import('../views/Unauthorized/Login.vue'), beforeEnter: [ guest ], meta: { title: 'Login - Nembookingai' } },
  { path: '/register', name: 'register', component: () => import('../views/Unauthorized/Register.vue'), beforeEnter: [ guest ], meta: { title: 'Opret bruger - Nembookingai' } },
  { path: '/logout', name: 'logout', component: () => import('../views/Unauthorized/Logout.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Log ud - Nembookingai' } },
]