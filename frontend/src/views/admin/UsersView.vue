<template>
	<v-container fluid>
	  <v-row>
		<v-col cols="12" md="8">
		  <v-card class="pa-4">
			<v-data-table
			  :items="users"
			  item-value="name"
			  :items-per-page="limit"
			  :sort-by.sync="[sortBy]"
			  :sort-desc.sync="[sortDesc]"
			  :page.sync="page"
			  :total-items="totalItems"
			  @update:sort-by="onSortChange"
              @update:sort-desc="onSortChange"
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
				  />
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
      totalItems: 0,
      totalPages: 0,
      page: 1, // Current page
      limit: 5, // Number of items per page
      sortBy: 'followingCount', // Default sorting field
      sortDesc: true, // Default sorting direction (false = ascending)
	  headers: [
  { title: 'Name', value: 'name', sortable: true },
  { title: 'Surname', value: 'surname', sortable: true },
  { title: 'Email', value: 'email', sortable: true },
  { title: 'Posts', value: 'postsCount', sortable: true },
  { title: 'Followers', value: 'followers', sortable: true }
]

    };
  },
  created() {
    this.fetchUsers();
  },
  watch: {
    page(newPage) {
      this.fetchUsers();
    },
    sortBy(newSortBy) {
      this.fetchUsers();
    },
    sortDesc(newSortDesc) {
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
          sortBy: this.sortBy, // Include sorting parameters
          sortDesc: this.sortDesc, // Include sorting parameters
        },
      })
      .then(response => {
        this.users = response.data.users;
        this.totalItems = response.data.totalItems;
        this.totalPages = response.data.totalPages;
		console.log(Array.isArray(this.headers)); // Should be true
      });
    },
    onSearch() {
      this.page = 1; // Reset to first page on search
      this.fetchUsers();
    },
    onSortChange() {
		console.log(this.sortBy); // Should be the field name
		console.log(this.sortDesc); // Should be the sorting direction	
      this.fetchUsers();
    },
  },
};
</script>

  