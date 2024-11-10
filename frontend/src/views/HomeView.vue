<template>
	<h1>Home</h1>
	<div class="card_list_container">
		<v-col cols="12" sm="3" v-for="post in posts">
			<PostCard :post = "post" @postDeleted="handlePostDeleted"/>
		</v-col>
	</div>

<v-snackbar v-model="snackbar" :timeout="3000">
	Successfully deleted post! 🐰
</v-snackbar>

</template>

<script>
import PostCard from '@/components/PostCard.vue';
import axiosInstance from '@/utils/axiosInstance';
export default {
components: {
PostCard
},
data(){
	return{
		posts: [],
		snackbar: false
	}
},
methods: {

handlePostDeleted(postId){
	this.posts = this.posts.filter(post => post.id !== postId);
	this.snackbar = true;
},

getPosts(){
	axiosInstance.get('/post/followed-posts')
	.then(response => {
		this.posts = response.data;
	})
}
},
mounted(){
this.getPosts();
},
	
};
</script>

<style scoped> 
.card_list_container {
display: flex;
flex-wrap: wrap;
justify-content: space-around;
flex-direction: row;
border: 1px solid black;
}	

</style>