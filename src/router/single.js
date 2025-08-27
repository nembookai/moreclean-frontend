import authMiddleware from "@/middleware/auth";

export default [
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), beforeEnter: [ authMiddleware('owner') ], meta: { title: 'Overblik - Nembookingai' } },
  { path: '/products', name: 'products', component: () => import('../views/Products.vue'), beforeEnter: [ authMiddleware('owner') ], meta: { title: 'Produkter - Nembookingai' } },
  { path: '/keys', name: 'keys', component: () => import('../views/Keys.vue'), beforeEnter: [ authMiddleware('owner') ], meta: { title: 'Nøgler - Nembookingai' } },
  { path: '/invoices', name: 'invoices', component: () => import('../views/Invoices.vue'), beforeEnter: [ authMiddleware('owner') ], meta: { title: 'Fakturering - Nembookingai' } },
  { path: '/settings', name: 'settings', component: () => import('../views/Settings.vue'), beforeEnter: [ authMiddleware('owner') ], meta: { title: 'Indstillinger - Nembookingai' } },
]