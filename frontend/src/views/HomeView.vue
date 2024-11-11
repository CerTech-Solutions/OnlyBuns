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
import { store } from '@/utils/store';
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
computed:{
	store(){
		return store;
	}
},

methods: {

handlePostDeleted(postId){
	this.posts = this.posts.filter(post => post.id !== postId);
	this.snackbar = true;
},

getPosts(){
	if(this.store.role === 'guest'){
		axiosInstance.get('/post/guest-posts')
		.then(response => {
			this.posts = response.data;
			console.log(this.posts);
		})
	}
	else{
		axiosInstance.get('/post/followed-posts')
		.then(response => {
			this.posts = response.data;
		})
	}
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
}	

</style>