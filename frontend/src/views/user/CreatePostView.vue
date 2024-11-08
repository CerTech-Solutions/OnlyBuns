<template>
	<v-container fluid class="post-container">
		<v-row justify="center" class="title-container">
			<v-chip color="primary" class="title-chip" dark>
				<v-icon left>mdi-plus-box</v-icon> Create Post
			</v-chip>
		</v-row>
		<v-form ref="postForm" class="post-form">
			<v-row>
				<v-col cols="12" sm="12" md="6" lg="5">
					<v-text-field v-model="caption" prepend-icon="mdi-pencil-outline" label="Describe the moment 🐰💬"
						:rules="captionRules" maxlength="141" counter required outlined dense class="input-field">
					</v-text-field>

					<v-file-input
    v-model="image"
    label="Show us your bunny! 🐰📸"
    :rules="imageRules"
    required
    @change="previewImage"
    @blur="validateImage"
    outlined
    dense
    class="input-field"
    :error-messages="imageError ? ['Image is required'] : []"
/>

					<v-text-field v-model="locationName" prepend-icon="mdi-map-marker-outline"
						label="Where have you seen this bunny? 🐇📍" :rules="locationRules" required outlined dense
						class="input-field" @click="openMapDialog">
					</v-text-field>

					<v-btn @click="submitForm()" color="primary" class="create-post-btn" :disabled="!createPostEnabled">
						Create Post
					</v-btn>
				</v-col>

				<v-col cols="12" sm="12" md="6" lg="7">
					<div class="preview-section">
						<v-card class="preview-card" outlined>
							<v-card-actions class="preview-header">
								<v-row class="w-100">
									<v-col cols="11">
										<v-list-item>
											<v-list-item-title class="username">@{{ username }}</v-list-item-title>
										</v-list-item>
									</v-col>
									<v-col cols="1">
										<v-btn icon disabled>
											<v-icon>mdi-dots-vertical</v-icon>
										</v-btn>
									</v-col>
								</v-row>
							</v-card-actions>

							<v-img :src="computedImagePreview" alt="Image Preview" aspect-ratio="1.5"
								class="styled-image">
								<template v-slot:placeholder>
									<div class="placeholder-content">
										<v-icon large color="grey">mdi-image-outline</v-icon>
										<p>Select an image to preview</p>
									</div>
								</template>
							</v-img>

							<v-card-text class="preview-caption">
								<p>{{ caption || "Add a caption..." }}</p>
							</v-card-text>
						</v-card>
					</div>
				</v-col>
			</v-row>

			<v-dialog v-model="mapDialog" width="600" @close="closeMapDialog">
				<v-card>
					<v-card-title>
						<span>Choose Location</span>
						<v-spacer></v-spacer>
						<v-btn icon @click="mapDialog = false">
							<v-icon>mdi-close</v-icon>
						</v-btn>
					</v-card-title>
					<v-card-text>
						<div class="search-container">
							<v-text-field v-model="searchQuery" label="Search for a location" prepend-icon="mdi-magnify"
								@input="getSuggestions" outlined dense class="input-field"></v-text-field>
							<v-list v-if="suggestions.length" class="suggestions-list">
								<v-list-item v-for="(suggestion, index) in suggestions" :key="index"
									@click="selectSuggestion(suggestion)">
									<v-list-item-title>{{ suggestion.formatted }}</v-list-item-title>
								</v-list-item>
							</v-list>
						</div>
						<div id="map" class="map-dialog"></div>
					</v-card-text>
				</v-card>
			</v-dialog>

			<v-snackbar v-model="snackbar" :timeout="3000" top right>
				{{ snackbarMessage }}
				<v-btn color="primary" text @click="snackbar = false">Close</v-btn>
			</v-snackbar>
		</v-form>
	</v-container>
</template>


<script>
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Style, Icon } from 'ol/style';
import { store } from '@/utils/store';
import { toLonLat } from 'ol/proj';
import axiosInstance from '@/utils/axiosInstance';

export default {
	data() {
		return {
			username: store.username,
			caption: '',
			captionRules: [v => !!v || 'Caption is required'],
			image: null,
			imageRules: [v => !!v || 'Image is required'],
			imageError: false,
			imagePreview: null,
			location: { longitude: 19.833549, latitude: 45.267136 },
			locationName: '',
			locationRules: [v => !!v || 'Address is required'],
			snackbar: false,
			snackbarMessage: '',
			createPostEnabled: true,
			mapDialog: false,
			map: null,
			vectorSource: null,
			searchQuery: '',
			suggestions: []
		};
	},
	computed: {
		computedImagePreview() {
			return this.imagePreview || 'https://via.placeholder.com/350x200?text=Image+Preview';
		}
	},
	methods: {
		previewImage() {
            if (this.image) {
                this.imagePreview = URL.createObjectURL(this.image);
                this.imageError = false; 
            }
        },
        validateImage() {
            this.imageError = !this.image; 
        },
        submitForm() {
            this.validateImage();
            if (this.$refs.postForm.validate() && !this.imageError) {
                this.createPost();
            } else {
                this.snackbarMessage = "You must fill in all required fields! 🤓";
                this.snackbar = true;
            }
        },
		createPost() {
			const formData = new FormData();

			formData.append("caption", this.caption);
			formData.append("location", JSON.stringify(this.location));

			if (this.image) {
				formData.append("image", this.image);
			}

			axiosInstance.post(`/post/create`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			})
				.then((response) => {
					this.createPostEnabled = false;
					this.snackbarMessage = "Successfully created post! 🐰";
					this.snackbar = true;
					setTimeout(() => {
						this.$router.push({ name: 'Home' });
					}, 3000);
				})
				.catch((error) => {
					console.error("Error posting this post", error);
				});
		},
		openMapDialog() {
			this.mapDialog = true;
			this.$nextTick(() => {
				setTimeout(() => {
					this.initializeMap();
				}, 100);
			});
		},
		closeMapDialog() {
			if (this.map) {
				this.map.setTarget(null);
				this.map = null;
			}
		},
		initializeMap() {
			this.vectorSource = new VectorSource();
			const vectorLayer = new VectorLayer({ source: this.vectorSource });
			this.map = new Map({
				target: 'map',
				layers: [new TileLayer({ source: new OSM() }), vectorLayer],
				view: new View({
					center: fromLonLat([this.location.longitude, this.location.latitude]),
					zoom: 12
				})
			});

			this.map.on('click', (event) => {
				const coordinates = event.coordinate;
				this.addMarker(coordinates);
			});
		},
		addMarker(coordinates) {
			this.vectorSource.clear();
			const marker = new Feature({ geometry: new Point(coordinates) });
			marker.setStyle(new Style({
				image: new Icon({
					src: '../../icons/rabbit-marker.png',
					scale: 0.15,
					anchor: [0.48, 0.75]
				})
			}));
			this.vectorSource.addFeature(marker);
			const [longitude, latitude] = toLonLat(coordinates);

			this.location.latitude = latitude;
			this.location.longitude = longitude;
			this.fetchLocationName(latitude, longitude);
		},
		fetchLocationName(latitude, longitude) {
			axiosInstance.get(`/location/locationName/${latitude}/${longitude}`)
				.then((response) => {
					this.locationName = response.data.code;
				})
				.catch((error) => {
					console.error("Error fetching location name:", error);
				});
		},
		async getSuggestions() {
			if (this.searchQuery.length > 2) {
				try {
					const response = await axiosInstance.get(`/location/suggestions`, {
						params: { query: this.searchQuery }
					});
					this.suggestions = response.data;
				} catch (error) {
					console.error("Error fetching location suggestions:", error);
				}
			} else {
				this.suggestions = [];
			}
		},
		selectSuggestion(suggestion) {
			const lat = suggestion.geometry.lat;
			const lng = suggestion.geometry.lng;
			this.map.getView().setCenter(fromLonLat([lng, lat]));
			this.map.getView().setZoom(12);
			this.location.latitude = lat;
			this.location.longitude = lng;
			this.locationName = suggestion.formatted;
			this.suggestions = [];
			this.searchQuery = '';
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
.title-container {
	margin-bottom: 24px;
}

.title-chip {
	font-size: 1.8rem;
	font-weight: bold;
	padding: 16px 28px;
	border-radius: 12px;
	box-shadow: 0 6px 14px rgba(0, 0, 0, 0.2);
}

.post-container {
	max-width: 1200px;
	margin: auto;
	padding: 20px;
}

.post-form {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.input-field {
	width: 100%;
	margin-bottom: 10px;
}

.create-post-btn {
	margin-top: 16px;
	width: 100%;
}

.preview-section {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 10px;
}

.preview-card {
	width: 100%;
	max-width: 400px;
	padding: 16px;
	border-radius: 8px;
}

.styled-image {
	border-radius: 8px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.search-container {
	position: relative;
}

.suggestions-list {
	max-height: 150px;
	overflow-y: auto;
	position: absolute;
	top: 50px;
	left: 0;
	right: 0;
	z-index: 10;
	background-color: white;
	border: 1px solid #ddd;
	border-radius: 4px;
}

.map-dialog {
	width: 100%;
	height: 400px;
	margin-top: 10px;
}
</style>
