import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '../views/LoginView.vue';
import HomeView from '../views/HomeView.vue';
import SignUpView from '../views/SignUpView.vue';
import CreatePostView from '../views/CreatePostView.vue';
import ProfileView from '@/views/ProfileView.vue';
import UsersView from '@/views/UsersView.vue';
import AnalyticsView from '@/views/AnalyticsView.vue';
import NearbyView from '@/views/NearbyView.vue';
import TrendsView from '@/views/TrendsView.vue';

// Define your routes
const routes = [
  { path: '/', name: 'Home', component: HomeView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/signup', name: 'SignUp', component: SignUpView },
  { path: '/create-post', name: 'CreatePost', component: CreatePostView },
  { path: '/profile/:username', name: 'Profile', component: ProfileView },
  { path: '/users', name: 'Users', component: UsersView },
  { path: '/analytics', name: 'Analytics', component: AnalyticsView },
  { path: '/nearby', name: 'Nearby', component: NearbyView },
  { path: '/trends', name: 'Trends', component: TrendsView }
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
