import authMiddleware from "@/middleware/auth";

export default [
  { path: '/customers', name: 'customers', beforeEnter: [ authMiddleware('owner') ], children: [
    { path: '', name: 'customers.index', alias: '/customers', component: () => import('../views/Customers/Index.vue'), meta: { title: 'Kunder - MoreClean' } },
    { path: ':id', name: 'customers.single', component: () => import('../views/Customers/Single.vue'), meta: { title: 'Kunde - MoreClean' } },
  ]},
]