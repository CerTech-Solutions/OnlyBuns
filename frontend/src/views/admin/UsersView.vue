<template>
	<v-container fluid>
	  <v-row>
		<v-col cols="12" md="8">
		  <v-card class="pa-4">
			<v-data-table
			  :items="users"
			  item-value="name"
			  :items-per-page="5"
			  :sort-by="['followers']"
			  :sort-desc="[false]"
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
				  <span class="mr-2">Min Followers</span>
				  <v-text-field
					v-model="range[0]"
					density="compact"
					style="width: 80px;"
					type="number"
					variant="outlined"
					hide-details
					single-line
				  ></v-text-field>
				</v-col>
				<v-col cols="6" class="d-flex align-center">
				  <span class="mr-2">Max Followers</span>
				  <v-text-field
					v-model="range[1]"
					density="compact"
					style="width: 80px;"
					type="number"
					variant="outlined"
					hide-details
					single-line
				  ></v-text-field>
				</v-col>
				<v-col cols="12">
					<v-range-slider
						v-model="range"
						:max="1000"
						:min="0"
						:step="10"
						thumb-size="40"
						track-size="8"
						color="primary"
						class="mt-4"
						hide-details
					>
					</v-range-slider>
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
		  minPosts: '',
		  maxPosts: '',
		},
		users: [],
	  };
	},
	created(){
		this.fetchUsers();

	},
	methods: {
	
		fetchUsers(){
			axiosInstance.get('user/users')
			.then(response => {
				console.log(response.data);
				this.users = response.data;
			})
		},
	  onSearch() {
		this.search.minPosts = this.range[0];
		this.search.maxPosts = this.range[1];
		console.log('Search triggered with:', this.search);
		axiosInstance.get('user/users', { params: this.search })
		  .then(response => {
			console.log('Response:', response.data);
				this.users = response.data;
		  });
	  },
	},
  };
  </script>
  
  <style scoped>
  </style>
  