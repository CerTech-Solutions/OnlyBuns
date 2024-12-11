<template>
	<v-app-bar :elevation="1" color="primary">
		<v-btn class="navbar-title" text @click="$router.push('/')">
			OnlyBuns
		</v-btn>
		<v-spacer></v-spacer>
		<v-btn icon="mdi-menu" @click="drawer = !drawer" v-if="store.role !== 'guest'">
		</v-btn>
		<v-btn size="large" prepend-icon="mdi-login" v-if="store.role === 'guest'" to="/login">Login</v-btn>
	</v-app-bar>

	<v-navigation-drawer v-model="drawer" temporary location="right" v-if="store.role !== 'guest'">
		<v-list>
			<v-list-item size="large" prepend-icon="mdi-plus-box" to="/create-post">
				Post
			</v-list-item>

			<v-list-item size="large" prepend-icon="mdi-map-marker" to="/nearby">
				Nearby
			</v-list-item>

			<v-list-item size="large" prepend-icon="mdi-account" @click="showUserProfile">
				Profile
			</v-list-item>

			<v-list-item size="large" prepend-icon="mdi-trending-up" to="/trends">
				Trends
			</v-list-item>

			<v-list-item size="large" prepend-icon="mdi-account-group" to="/users" v-if="store.role === 'admin'">
				Users
			</v-list-item>

			<v-list-item size="large" prepend-icon="mdi-account-tie-hat" to="/signup/admin" v-if="store.role === 'admin'">
				Admin registration
			</v-list-item>

			<v-list-item size="large" prepend-icon="mdi-google-analytics" to="/analytics" v-if="store.role === 'admin'">
				Analytics
			</v-list-item>
		</v-list>

		<template v-slot:append>
			<v-btn block prepend-icon="mdi-logout" v-if="store.role !== 'guest'" to="/" @click="logout">
				Logout
			</v-btn>
		</template>
	</v-navigation-drawer>
</template>

<script>
import { store } from '@/utils/store';
import axiosInstance from '@/utils/axiosInstance';
import { nextTick } from 'vue';

export default {
	computed: {
		store() {
			return store;
		}
	},
	data() {
		return {
			drawer: false,
		}
	},
	methods: {
		logout() {
			axiosInstance.post('/user/logout')
				.then(() => {
          store.clearUser();
					this.$router.push('/');
				})
		},
		showUserProfile() {
			this.$router.push(`/profile/${store.username}`);
		},
	},
};

</script>

<style scoped>
.navbar-title {
	font-size: 1.7rem;
	font-weight: bold;
	color: #FFFFFF;
	text-transform: none;
	letter-spacing: 1px;
	transition: background-color 0.3s, color 0.3s;
	padding: 0 16px;
}

.navbar-title:hover {
	background-color: rgba(255, 255, 255, 0.1);
	border-radius: 8px;
	color: #BBDEFB;
	cursor: pointer;
}
</style>