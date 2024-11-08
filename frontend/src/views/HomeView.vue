<template>
	<h1>Home</h1>
	<div class="card_list_container">
		<v-col cols="12" sm="3" v-for="n in 5" :key="n">
			<PostCard/>
		</v-col>
	</div>
</template>

<script>
import PostCard from '@/components/PostCard.vue';
import axiosInstance from '@/utils/axiosInstance';
export default {
components: {
PostCard
},
methods: {
getPosts(){
	console.log('getPosts');
	axiosInstance.get('/load_posts')
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