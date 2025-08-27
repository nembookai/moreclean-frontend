import authMiddleware from "@/middleware/auth";

export default [
  { path: '/employees', name: 'employees', beforeEnter: [ authMiddleware('owner') ], children: [
    { path: '', name: 'employees.index', alias: '/employees', component: () => import('../views/Employees/Index.vue'), meta: { title: 'Medarbejdere - MoreClean' } },
    { path: ':id', name: 'employees.single', component: () => import('../views/Employees/Single.vue'), meta: { title: 'Medarbejder - MoreClean' } },
  ]},
]