import { createRouter, createWebHistory } from 'vue-router'
import { getAuth } from '../utils/auth'

import HomePage from '../views/HomePage.vue'
import AboutPage from '../views/AboutPage.vue'
import ContactsPage from '../views/ContactsPage.vue'
import LoginPage from '../views/LoginPage.vue'
import AdminLayout from '../components/admin/layout/AdminLayout.vue'
import AdminDashboard from '../views/admin/AdminDashboard.vue'
import AdminUsersPage from '../views/admin/AdminUsersPage.vue'
import AdminContactRequestsPage from '../views/admin/AdminContactRequestsPage.vue'
import ClientLayout from '../components/client/layout/ClientLayout.vue'
import ClientHomePage from '../views/client/ClientHomePage.vue'
import ClientRealEstateRequestsPage from '../views/client/ClientRealEstateRequestsPage.vue'
import ClientVehicleRequestsPage from '../views/client/ClientVehicleRequestsPage.vue'
import ClientFixedAssetsRequestsPage from '../views/client/ClientFixedAssetsRequestsPage.vue'
import ClientRequestCreatePage from '../views/client/ClientRequestCreatePage.vue'
import ClientRequestEditPage from '../views/client/ClientRequestEditPage.vue'
import CompanyLayout from '../components/company/layout/CompanyLayout.vue'
import CompanyDashboard from '../views/company/CompanyDashboard.vue'
import CompanyRequestsListPage from '../views/company/CompanyRequestsListPage.vue'
import CompanyRequestDetailPage from '../views/company/CompanyRequestDetailPage.vue'
import CompanyReportsPage from '../views/company/CompanyReportsPage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomePage,
  },
  {
    path: '/about',
    name: 'about',
    component: AboutPage,
  },
  {
    path: '/contacts',
    name: 'contacts',
    component: ContactsPage,
  },
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, role: 'ADMIN' },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard,
      },
      {
        path: 'users',
        name: 'admin-users',
        component: AdminUsersPage,
      },
      {
        path: 'contact-requests',
        name: 'admin-contact-requests',
        component: AdminContactRequestsPage,
      },
    ],
  },
  {
    path: '/client',
    component: ClientLayout,
    meta: { requiresAuth: true, role: 'CLIENT_EMPLOYEE' },
    children: [
      {
        path: '',
        name: 'client-home',
        component: ClientHomePage,
      },
      {
        path: 'requests',
        name: 'client-requests',
        component: ClientRealEstateRequestsPage,
      },
      {
        path: 'vehicle-requests',
        name: 'client-vehicle-requests',
        component: ClientVehicleRequestsPage,
      },
      {
        path: 'fixed-assets-requests',
        name: 'client-fixed-assets-requests',
        component: ClientFixedAssetsRequestsPage,
      },
      {
        path: 'requests/new',
        name: 'client-request-new',
        component: ClientRequestCreatePage,
      },
      {
        path: 'request/:id',
        name: 'client-request-edit',
        component: ClientRequestEditPage,
      },
    ],
  },
  {
    path: '/company',
    component: CompanyLayout,
    meta: { requiresAuth: true, role: ['COMPANY_EMPLOYEE', 'ADMIN'] },
    children: [
      {
        path: '',
        name: 'company-dashboard',
        component: CompanyDashboard,
      },
      {
        path: 'requests',
        name: 'company-requests',
        component: CompanyRequestsListPage,
      },
      {
        path: 'requests/:id',
        name: 'company-request-detail',
        component: CompanyRequestDetailPage,
      },
      {
        path: 'reports',
        name: 'company-reports',
        component: CompanyReportsPage,
      },
    ],
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

router.beforeEach((to, from, next) => {
  const auth = getAuth()
  const isAuthenticated = !!auth.token

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  const requiredRole = to.meta.role
  if (to.meta.requiresAuth && requiredRole) {
    const allowed = Array.isArray(requiredRole)
      ? requiredRole.includes(auth.role)
      : auth.role === requiredRole
    if (!allowed) {
      if (auth.role === 'ADMIN') next({ name: 'admin-dashboard' })
      else if (auth.role === 'CLIENT_EMPLOYEE') next({ name: 'client-home' })
      else if (auth.role === 'COMPANY_EMPLOYEE') next({ name: 'company-dashboard' })
      else next({ name: 'login' })
      return
    }
  }

  next()
})

export default router

