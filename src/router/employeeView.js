import authMiddleware from "@/middleware/auth";

export default [
  { path: '/employee', name: 'employee', beforeEnter: [ authMiddleware() ], children: [
    { path: 'dashboard', name: 'employee.dashboard', alias: '/employee/dashboard', component: () => import('../views/EmployeeView/Dashboard.vue'), meta: { title: 'Dashboard - MoreClean' } },
  ]},
]