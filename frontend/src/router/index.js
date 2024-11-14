import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue';
import SignUpView from '../views/SignUpView.vue';
import CreatePostView from '../views/user/CreatePostView.vue';
import ProfileView from '@/views/user/ProfileView.vue';
import UsersView from '@/views/admin/UsersView.vue';
import AnalyticsView from '@/views/admin/AnalyticsView.vue';
import NearbyView from '@/views/user/NearbyView.vue';
import TrendsView from '@/views/user/TrendsView.vue';

import { store } from '@/utils/store';

// Define your routes
const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/signup', name: 'SignUp', component: SignUpView },
  { path: '/signup/admin', name: 'SignUpAdmin', component: SignUpView, meta: { role: ['admin'], requiresAuth: true } },
  { path: '/create-post', name: 'CreatePost', component: CreatePostView, meta: { requiresAuth: true } },
  { path: '/profile/:username', name: 'Profile', component: ProfileView },
  { path: '/users', name: 'Users', component: UsersView, meta: { role: ['admin'], requiresAuth: true } },
  { path: '/analytics', name: 'Analytics', component: AnalyticsView, meta: { role: ['admin'], requiresAuth: true } },
  { path: '/nearby', name: 'Nearby', component: NearbyView, meta: { requiresAuth: true } },
  { path: '/trends', name: 'Trends', component: TrendsView, meta: { requiresAuth: true } }
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  const userRole = store.role;
  const isLoggedIn = store.role !== 'guest';

  // Check if the route requires authentication
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next('/login');
  }

  // Check if the route has specific role requirements
  if (to.meta.role && !to.meta.role.includes(userRole)) {
    return next('/');
  }

  // Prevent logged-in users from accessing login and signup pages
  if (isLoggedIn && (to.path === '/login' || to.path === '/signup')) {
    return next('/');
  }

  // Route to home if path doesn't exist in router paths
  if (!routes.some(route => route.path === to.path)) {
    return next('/');
  }

  next();
});

export default router;
