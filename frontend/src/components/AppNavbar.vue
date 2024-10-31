<template>
	<v-app-bar :elevation="1" color="primary">
		<v-toolbar-title>OnlyBuns</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-btn icon="mdi-menu" @click="drawer = !drawer" v-if="role !== 'guest'">
		</v-btn>
		<v-btn size="large" prepend-icon="mdi-login" v-if="role === 'guest'" to="/login">Login</v-btn>
	</v-app-bar>

	<v-navigation-drawer v-model="drawer" temporary location="right" v-if="role !== 'guest'">
			<v-list>
				<v-list-item size="large" prepend-icon="mdi-plus-box"
					to="/create-post">
					Post
				</v-list-item>

				<v-list-item size="large" prepend-icon="mdi-map-marker"
					to="/nearby">
					Nearby
				</v-list-item>

				<v-list-item size="large" prepend-icon="mdi-account"
					to="/profile">
					Profile
				</v-list-item>

				<v-list-item size="large" prepend-icon="mdi-trending-up"
					to="/trends">
					Trends
				</v-list-item>

				<v-list-item size="large" prepend-icon="mdi-account-group"
					to="/users" v-if="role === 'admin'">
					Users
				</v-list-item>

				<v-list-item size="large" prepend-icon="mdi-google-analytics"
					to="/analytics" v-if="role === 'admin'">
					Analytics
				</v-list-item>
			</v-list>

			<template v-slot:append>
				<v-btn block prepend-icon="mdi-logout"
					v-if="role !== 'guest'" to="/" @click="logout">
          Logout
        </v-btn>
			</template>
		</v-navigation-drawer>
</template>

<script>
import { store } from '@/utils/store';
import axiosInstance from '@/utils/axiosInstance';

export default {
	data() {
		return {
			drawer: false
		}
	},
	computed: {
		role() {
			return store.role;
		}
	},
	methods: {
		logout() {
			axiosInstance.post('/user/logout')
				.then(() => {
					store.setRole('guest');
					this.$router.push('/');
				})
		}
	}
};

</script>

<style scoped></style>