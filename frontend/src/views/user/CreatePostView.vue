<template>
	<v-container>
	  <h1>Create post</h1>
	  <v-form>
		<v-text-field
		  v-model="caption"
		  label="Caption"
		  :rules="captionRules"
		  maxlength="40"
		  counter
		  required
		></v-text-field>
		
		<v-file-input
		  v-model="image"
		  label="Image"
		  :rules="imageRules"
		  required
		  @change="previewImage"
		></v-file-input>
		
		<v-text-field
		  v-model="location"
		  label="Location"
		  :rules="locationRules"
		  required
		></v-text-field>
  
		<div class="centered-container">
		  <v-card class="preview-card" outlined>
			<v-card-title class="preview-label">Preview</v-card-title>
  
			<v-card-subtitle class="username">@{{ username }}</v-card-subtitle>
			<v-card-subtitle class="caption">
			  {{ caption || "Add a caption..." }}
			</v-card-subtitle>
			
			<v-img :src="imagePreview" alt="Image Preview" aspect-ratio="1.5" class="styled-image">
			  <template v-slot:placeholder>
				<div class="placeholder-content">
				  <v-icon large color="grey">mdi-image-outline</v-icon>
				  <p>Select an image to preview</p>
				</div>
			  </template>
			</v-img>
			<v-overlay v-if="imagePreview" absolute opacity="0.3" class="image-overlay">
			  <v-card-text class="overlay-label">Uploaded Image</v-card-text>
			</v-overlay>
		  </v-card>
		</div>
		
		<v-btn @click="createPost">Create post</v-btn>
	  </v-form>
	</v-container>
</template>
  
<script>
  import axios from '@/utils/axiosInstance';
  import { store } from '@/utils/store';
  
  export default {
	data() {
	  return {
		username: store.username || "trksi123", // default username if store.username is undefined
		caption: '',
		captionRules: [
		  v => !!v || 'Caption is required',
		],
		image: null,
		imageRules: [
		  v => !!v || 'Image is required',
		],
		imagePreview: null,
		location: null,
		locationRules: [
		  v => !!v || 'Address is required',
		],
		createdAt: '',
		likes: 0
	  };
	},
	methods: {
	  previewImage() {
		if (this.image) {
		  this.imagePreview = URL.createObjectURL(this.image);
		}
	  }
	},
	watch: {
	  image(newImage) {
		if (!newImage) {
		  this.imagePreview = null;
		}
	  }
	}
  };
</script>
  
<style scoped>
  .v-container {
	margin-top: 2vh;
	padding-inline: 20%;
  }
  
  .centered-container {
	display: flex;
	justify-content: center;
	margin-top: 16px;
  }
  
  .preview-card {
	width: 350px;
	position: relative;
	padding: 16px;
  }
  
  .preview-label {
	font-size: 20px;
	font-weight: bold;
	text-align: center;
	margin-bottom: 8px;
  }
  
  .username {
	font-weight: bold;
	color: #555;
	text-align: center;
	margin-bottom: 4px;
  }
  
  .caption {
	font-size: 14px;
	color: #777;
	text-align: center;
	max-width: 300px;
	word-break: break-word;
	padding: 0 16px;
	margin-bottom: 12px;
  }
  
  .styled-image {
	border-radius: 12px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .placeholder-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 100%;
	color: grey;
	font-size: 14px;
  }
  
  .image-overlay {
	display: flex;
	align-items: center;
	justify-content: center;
	background-color: rgba(0, 0, 0, 0.4);
	border-radius: 12px;
  }
  
  .overlay-label {
	color: #fff;
	font-weight: bold;
	font-size: 16px;
	text-align: center;
  }
</style>
  