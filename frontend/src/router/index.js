import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';

// Define your routes
const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  }
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
