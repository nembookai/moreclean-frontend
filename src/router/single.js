import authMiddleware from "@/middleware/auth";

export default [
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Overblik - MoreClean' } },
  { path: '/customers', name: 'customers', component: () => import('../views/Customers.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Kunder - MoreClean' } },
  { path: '/products', name: 'products', component: () => import('../views/Products.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Produkter - MoreClean' } },
  { path: '/employees', name: 'employees', component: () => import('../views/Employees.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Medarbejdere - MoreClean' } },
]