<template>
	<v-app-bar :elevation="1" color="primary">
		<v-toolbar-title>OnlyBuns</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-btn v-if="role !== 'guest'" to="/" @click="logout">Logout</v-btn>
		<v-btn v-if="role === 'guest'" to="/login">Login</v-btn>
	</v-app-bar>
</template>

<script>
import { store } from '@/utils/store';
import axiosInstance from '@/utils/axiosInstance';

export default {
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