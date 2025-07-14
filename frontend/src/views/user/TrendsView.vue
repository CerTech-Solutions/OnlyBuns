<template>
	<v-container fluid>
		<v-row justify="center">
			<v-col cols="12" class="text-center">
				<h1 class="text-h3 mb-6 font-weight-bold">Current trends 📈</h1>
			</v-col>
		</v-row>

		<v-row justify="center">
			<v-col cols="12" sm="6" md="4" lg="3">
				<v-card elevation="2" class="text-center">
					<v-card-text>
						<div class="text-h2 font-weight-bold">
							{{ trends.totalPostsCount }}
						</div>
						<div class="text-subtitle-1 mt-2">
							<v-icon>mdi-post</v-icon>
							Total posts
						</div>
					</v-card-text>
				</v-card>
			</v-col>

			<v-col cols="12" sm="6" md="4" lg="3">
				<v-card elevation="2" class="text-center">
					<v-card-text>
						<div class="text-h2 font-weight-bold">
							{{ trends.recentPostsCount }}
						</div>
						<div class="text-subtitle-1 mt-2">
							<v-icon>mdi-clock-outline</v-icon>
							Total posts this month
						</div>
					</v-card-text>
				</v-card>
			</v-col>
		</v-row>

		<br><br>
		<v-row justify="center">
			<v-col cols="12" sm="12" md="10" lg="8" class="text-center">
				<h2 class="text-h5 mb-4">Trending posts (last week) ⭐</h2>
			</v-col>
		</v-row>

		<v-row justify="center">
			<v-col cols="12" sm="12" md="10" lg="8">
				<v-infinite-scroll direction="horizontal" mode="manual">
					<div class="post-card" v-for="post in trends.recentMostLiked">
						<PostCard :post="post" :simplified="true"/>
					</div>
				</v-infinite-scroll>
			</v-col>
		</v-row>

		<br><br>
		<v-row justify="center">
			<v-col cols="12" sm="12" md="10" lg="8" class="text-center">
				<h2 class="text-h5 mb-4">Most liked of all time 🌟</h2>
			</v-col>
		</v-row>

		<v-row justify="center">
			<v-col cols="12" sm="12" md="10" lg="8">
				<v-infinite-scroll direction="horizontal" mode="manual">
					<div class="post-card" v-for="post in trends.totalMostLiked">
						<PostCard :post="post" :simplified="true"/>
					</div>
				</v-infinite-scroll>
			</v-col>
		</v-row>

		<br><br>
		<v-row justify="center">
			<v-col cols="12" sm="12" md="10" lg="8" class="text-center">
				<h2 class="text-h5 mb-4">Most active users 👤</h2>
			</v-col>
		</v-row>

		<v-row justify="center">
			<v-col cols="12" sm="12" md="10" lg="8">
				<v-card elevation="2">
					<v-table>
						<thead>
							<tr>
								<th class="text-center font-weight-bold">User</th>
								<th class="text-center font-weight-bold">Likes given</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="user in trends.recentActiveUsers" :key="user.username">
								<td class="py-3 text-center">{{ user.username }}</td>
								<td class="py-3 text-center">{{ user.likesCount }}</td>
							</tr>
						</tbody>
					</v-table>
				</v-card>
			</v-col>
		</v-row>

	</v-container>
</template>

<script>

import axiosInstance from '@/utils/axiosInstance';

export default {
	data() {
		return {
			trends: {
				totalPostsCount: 0,
				recentPostsCount: 0,
				recentMostLiked: [],
				totalMostLiked: [],
				recentActiveUsers: [],
			},
		}
	},
	mounted() {
		axiosInstance.get('/stats/trends')
			.then(response => {
				this.trends = response.data;
			})
			.catch(error => {
				console.log(error);
			});
	},
}

</script>

<style scoped>

.post-card {
	min-width: 400px;
	margin-right: 10px;
	display: inline-block;
}
</style>