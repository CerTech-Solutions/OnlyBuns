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
