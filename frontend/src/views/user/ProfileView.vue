<template>
  <v-container class="profile-container mx-auto">
    <v-row>
      <v-col>
        <v-card variant="outlined">
						<v-card-title>@{{ profile.username }}</v-card-title>
          <v-card-text>
						<br>
            <v-row>
              <v-col>
                <p><v-icon left class="mr-2">mdi-account</v-icon>{{ profile.name }} {{ profile.surname }}</p>
								<br>
                <p><v-icon left class="mr-2">mdi-email</v-icon>{{ profile.email }}</p>
								<br>
								<v-btn variant="tonal" prepend-icon="mdi-pencil"
									v-if="editVisible">
									Edit profile
								</v-btn>
								<v-btn variant="elevated" color="primary" prepend-icon="mdi-plus" @click = "followUser(profile)"
								v-if="followVisible && !profile.isFollowing">
									Follow
								</v-btn>
								<v-btn variant="elevated" color="red" prepend-icon="mdi-minus" @click = "unfollowUser(profile)"
									v-if="followVisible && profile.isFollowing">
									Unfollow
								</v-btn>
              </v-col>
              <v-col>
                <v-btn variant="text" @click="showFollowers">Followers: {{ profile.followersCount }}</v-btn>
                <br>
                <v-btn variant="text" @click="showFollowing">Following: {{ profile.followingCount }}</v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h2>Buns found</h2><br>
        <v-row>
          <v-col v-for="post in posts" :key="post.id" cols="12" md="6">
            <v-card>
              <v-card-title>{{ post.title }}</v-card-title>
              <v-card-text>{{ post.content }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>

  <v-dialog v-model="dialogWindow" max-width="500">
    <v-card style="display: flex; flex-direction: column; align-items: cent;">
      <v-card-title class="headline">Followers</v-card-title>
	  <v-data-table	:items="selectedPeople">

	  </v-data-table>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="red" text  @click="closeDialogWindow" >Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
import axiosInstance from '@/utils/axiosInstance';
import { store } from '@/utils/store';

export default {
	computed: {
		store() {
			return store;
		},
	},
  data() {
    return {
	  selectedPeople: [],
	  dialogWindow: false,
      profile: {
        name: '',
				surname: '',
				username: '',
        email: '',
				followersCount: 0,
				followingCount: 0,
      },
			followVisible: false,
			editVisible: false,
			unfollowVisible: false,
      posts: [
        { id: 1, title: 'First Post', content: 'This is the content of the first post.' },
        { id: 2, title: 'Second Post', content: 'This is the content of the second post.' },
        // Add more posts as needed
      ],
    };
  },
	mounted() {
		this.profile.username = this.$route.params.username;

		axiosInstance.get(`/user/profile/${this.profile.username}`)
			.then((response) => {
				this.profile = response.data;
				console.log('Profile: ', this.profile);
				if (store.username !== this.profile.username) {
					this.followVisible = true;
				}
				else {
					this.editVisible = true;
				}
			})
			.catch((error) => {
				console.error(error);
			});
	},
	methods: {
		followUser(profile){
			console.log('Following user: ', profile.username);
			axiosInstance.post(`/user/follow`, { username: profile.username })
				.then(response => {
					console.log('Povratna vrednost: ', response);
					if(response.status === 200){
						this.profile.followersCount = response.data.followersCount;
						this.profile.isFollowing = true;
					}
				})
				.catch((error) => {
					console.error(error);
				});
		},

		unfollowUser(profile){
			console.log('Unfollowing user: ', profile.username);
			axiosInstance.post(`/user/unfollow`, { username: profile.username })
				.then(response => {
					console.log('Povratna vrednost: ', response);
					if(response.status === 200){
						this.profile.followersCount = response.data.followersCount;
						this.profile.isFollowing = false;
					}
				})
				.catch((error) => {
					console.error(error);
				});
		},
		showFollowers(){
			console.log('Showing followers');
			axiosInstance.get(`/user/followers/${this.profile.username}`)
				.then(response => {
					console.log('Povratna vrednost: ', response);
					this.dialogWindow = true;
					this.selectedPeople = response.data;
				})
				.catch((error) => {
					console.error(error);
				});
		},
		showFollowing(){
			console.log('Showing following');
			axiosInstance.get(`/user/following/${this.profile.username}`)
				.then(response => {
					console.log('Povratna vrednost: ', response);
					this.dialogWindow = true;
					this.selectedPeople = response.data;
				})
				.catch((error) => {
					console.error(error);
				});
		},
		closeDialogWindow(){
			this.dialogWindow = false;
		},
	},
};
</script>

<style scoped>
.profile-container {
	max-width: 75%;
}
</style>