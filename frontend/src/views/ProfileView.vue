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
								<v-btn variant="tonal">
							<v-icon left>mdi-pencil</v-icon>
							Edit profile
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
</template>

<script>
export default {
  data() {
    return {
      profile: {
        name: 'John',
				surname: 'Doe',
				username: 'johndoe',
        email: 'john.doe@example.com',
				followersCount: 100,
				followingCount: 50,
      },
      posts: [
        { id: 1, title: 'First Post', content: 'This is the content of the first post.' },
        { id: 2, title: 'Second Post', content: 'This is the content of the second post.' },
        // Add more posts as needed
      ],
    };
  },
	methods: {
		showFollowers() {
			// Implement the method to show the followers
		},
		showFollowing() {
			// Implement the method to show the following
		},
	},
};
</script>

<style scoped>
.profile-container {
	max-width: 75%;
}
</style>