import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue';
import SignUpView from '../views/SignUpView.vue';
import CreatePostView from '../views/CreatePostView.vue';
import ProfileView from '@/views/ProfileView.vue';

// Define your routes
const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/signup', name: 'SignUp', component: SignUpView },
  { path: '/create-post', name: 'CreatePost', component: CreatePostView },
  { path: '/profile', name: 'Profile', component: ProfileView }
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
