<template>
	<v-container fluid>
	  <v-row>
		<v-col cols="12" md="8">
		  <v-card class="pa-4">
			<v-data-table
  :items="users"
  item-value="name"
  :items-per-page="limit"
  :sort-by="['followers']"
  :sort-desc="[false]"
  :page.sync="page"
  :total-items="totalItems"
  class="elevation-1 mt-2"
  hide-default-footer
>
			  <template v-slot:column.name="{ column }">
				<span>Name</span>
			  </template>
			  <template v-slot:column.surname="{ column }">
				<span>Surname</span>
			  </template>
			  <template v-slot:column.email="{ column }">
				<span>Email</span>
			  </template>
			  <template v-slot:column.posts="{ column }">
				<span>Posts</span>
			  </template>
			  <template v-slot:column.followers="{ column }">
				<span>Followers</span>
			  </template>
			</v-data-table>
  
			<!-- Pagination Controls with Page Number Display -->
			<div class="d-flex justify-space-between align-center mt-4">
			  <v-pagination
				v-model="page"
				:length="totalPages"
				:total-visible="5"
				@input="fetchUsers"
				class="flex-grow-0"
			  ></v-pagination>
  
			  <!-- Page Number Display -->
			  <span class="page-number">
				Page {{ page }} of {{ totalPages }}
			  </span>
			</div>
		  </v-card>
		</v-col>
  
		<v-col cols="12" md="4">
		  <v-card class="pa-4">
			<v-form>
			  <v-row>
				<v-col cols="12">
				  <v-text-field
					v-model="search.name"
					label="Search by Name"
					clearable
					dense
				  />
				</v-col>
				<v-col cols="12">
				  <v-text-field
					v-model="search.surname"
					label="Search by Surname"
					clearable
					dense
				  />
				</v-col>
				<v-col cols="12">
				  <v-text-field
					v-model="search.email"
					label="Search by Email"
					clearable
					dense
				  />
				</v-col>
				<v-col cols="6" class="d-flex align-center">
				  <span class="mr-2">Min Posts</span>
				  <v-text-field
					v-model="range[0]"
					:min = "minPosts"
					density="compact"
					style="width: 80px;"
					type="number"
					variant="outlined"
					hide-details
					single-line
				  ></v-text-field>
				</v-col>
				<v-col cols="6" class="d-flex align-center">
				  <span class="mr-2">Max Posts</span>
				  <v-text-field
					v-model="range[1]"
					:max="maxPosts"
					density="compact"
					style="width: 80px;"
					type="number"
					variant="outlined"
					hide-details
					single-line
				  ></v-text-field>
				</v-col>
				<v-col cols="12">
				  <v-btn color="primary" @click="onSearch">Search</v-btn>
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
		range: [0, 1000],
		search: {
		  name: '',
		  surname: '',
		  email: '',
		  minPosts: 0,
		  maxPosts: 1000,

		},
		totalPages: 0,
		users: [],
		totalItems: 0,
		page: 1, // Current page
		limit: 5, // Number of items per page
	  };
	},
	created() {
	  this.fetchUsers();
	},
	watch: {
	  page(newPage) {
		this.fetchUsers();
	  },
	},
	methods: {
	  fetchUsers() {
		axiosInstance.get('user/users', {
		  params: {
			...this.search,
			page: this.page,
			limit: this.limit,
		  },
		})
		.then(response => {
		  this.users = response.data.users;
		  this.totalItems = response.data.totalItems;
		  this.totalPages = response.data.totalPages;
			console.log('Fetched users:', this.users);
			const postCounts = this.users.map(u => u.postsCount ?? 0);
    		const max = Math.max(...postCounts, 0); // fallback na 0 ako prazno

    		this.maxPosts = isFinite(max) ? max : 3;
    
    if (this.range[1] > this.maxPosts || this.range[1] === 1000) {
      this.range[1] = this.maxPosts;
    }


		});
	  },
	  onSearch() {
		this.page = 1; // Reset to first page on search
		this.search.minPosts = this.range[0];
		this.search.maxPosts = this.range[1];
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
  