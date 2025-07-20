<template>
	<v-container fluid>
		<v-row>
			<v-col cols="12" md="8">
				<v-card class="pa-4">
					<v-data-table :items="users" :items-per-page="limit" :page.sync="page"
						:server-items-length="totalItems" :sort-by="sortBy" @update:sort-by="sortBy = $event"
						class="elevation-1 mt-2" hide-default-footer> <template v-slot:column.name="{ column }">
							<span>Name</span>
						</template>
						<template v-slot:column.surname="{ column }">
							<span>Surname</span>
						</template>
						<template v-slot:column.email="{ column }">
							<span>Email</span>
						</template>
						<template v-slot:column.postsCount="{ column }">
							<span>Posts</span>
						</template>
						<template v-slot:column.followingCount="{ column }">
							<span>Followers</span>
						</template></v-data-table>
					<div class="d-flex justify-space-between align-center mt-4">
						<v-pagination v-model="page" :length="totalPages" :total-visible="5" @input="fetchUsers"
							class="flex-grow-0"></v-pagination>
						<span class="page-number">Page {{ page }} of {{ totalPages }}</span>
					</div>
				</v-card>
			</v-col>

			<v-col cols="12" md="4">
				<v-card class="pa-4">
					<v-form>
						<v-row>
							<v-col cols="12">
								<v-text-field v-model="search.name" label="Search by Name" clearable dense />
							</v-col>
							<v-col cols="12">
								<v-text-field v-model="search.surname" label="Search by Surname" clearable dense />
							</v-col>
							<v-col cols="12">
								<v-text-field v-model="search.email" label="Search by Email" clearable dense />
							</v-col>
							<v-col cols="6" class="d-flex align-center">
								<span class="mr-2">Min Posts</span>
								<v-text-field v-model="range[0]" :min="minPosts" density="compact" style="width: 80px;"
									type="number" variant="outlined" hide-details single-line></v-text-field>
							</v-col>
							<v-col cols="6" class="d-flex align-center">
								<span class="mr-2">Max Posts</span>
								<v-text-field v-model="range[1]" :max="maxPosts" density="compact" style="width: 80px;"
									type="number" variant="outlined" hide-details single-line></v-text-field>
							</v-col>
							<v-col cols="12" class="d-flex justify-space-between">
								<v-btn color="primary" @click="onSearch">Search</v-btn>
								<v-btn color="secondary" @click="onRefresh">Refresh</v-btn>
							</v-col>
						</v-row>
					</v-form>
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
			headers: [
				{ text: 'Name', value: 'name', sortable: true },
				{ text: 'Surname', value: 'surname', sortable: true },
				{ text: 'Email', value: 'email', sortable: true },
				{ text: 'Posts', value: 'postsCount', sortable: true },
				{ text: 'Followers', value: 'followingCount', sortable: true },
			],
			range: [0, 1000],
			search: {
				name: '',
				surname: '',
				email: '',
				minPosts: 0,
				maxPosts: 1000,
			},
			totalPages: 0,
			totalItems: 0,
			users: [],
			page: 1,
			limit: 5,
			sortBy: ['followingCount'],
			sortDir: 'asc'
		};
	},
	created() {
		this.fetchUsers();
	},
	watch: {
		page() {
			this.fetchUsers();
		},
		sortBy: {
			handler() {
				this.page = 1;
				this.fetchUsers();
			},
			deep: true
		},
		sortDesc: {
			handler() {
				this.page = 1;
				this.fetchUsers();
			},
			deep: true
		}
	},
	methods: {
		fetchUsers() {
			axiosInstance.get('user/users', {
				params: {
					...this.search,
					page: this.page,
					limit: this.limit,
					sortBy: this.sortBy[0]?.key,
					sortDir: this.sortBy[0]?.order
				},
			})
				.then(response => {
					this.users = response.data.users;
					this.totalItems = response.data.totalItems;
					this.totalPages = response.data.totalPages;

					const postCounts = this.users.map(u => u.postsCount ?? 0);
					const max = Math.max(...postCounts, 0);
					this.maxPosts = isFinite(max) ? max : 3;
					if (this.range[1] > this.maxPosts || this.range[1] === 1000) {
						this.range[1] = this.maxPosts;
					}
				})
		},
		onSearch() {
			this.page = 1;
			this.search.minPosts = this.range[0];
			this.search.maxPosts = this.range[1];
			this.fetchUsers();
		},
		onRefresh() {
			this.search = {
				name: '',
				surname: '',
				email: '',
				minPosts: 0,
				maxPosts: 1000,
			};
			this.range = [0, 1000];
			this.page = 1;
			this.fetchUsers();
		},
	},
};
</script>

<style scoped>
.page-number {
	font-size: 16px;
	font-weight: bold;
	color: #4a4a4a;
}
</style>