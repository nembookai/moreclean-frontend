import authMiddleware from "@/middleware/auth";

export default [
  { path: '/dashboard', name: 'dashboard', component: () => import('../views/Dashboard.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Overblik - MoreClean' } },
  { path: '/products', name: 'products', component: () => import('../views/Products.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Produkter - MoreClean' } },
  { path: '/keys', name: 'keys', component: () => import('../views/Keys.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Nøgler - MoreClean' } },
  { path: '/invoices', name: 'invoices', component: () => import('../views/Invoices.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Fakturering - MoreClean' } },
  { path: '/settings', name: 'settings', component: () => import('../views/Settings.vue'), beforeEnter: [ authMiddleware() ], meta: { title: 'Indstillinger - MoreClean' } },
]