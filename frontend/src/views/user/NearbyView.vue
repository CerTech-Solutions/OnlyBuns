<template>
  <div id="map" class="map"></div>
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
import { Icon, Style } from 'ol/style';
import { defaultConfig } from '@/config/config';
import axiosInstance from '@/utils/axiosInstance';
import { store } from '@/utils/store';

export default {
	computed: {
		store() {
			return store;
		}
	},
  data() {
    return {
      map: null,
      vectorSource: null,
      userAddress: null
    };
  },
  mounted() {
		const username = store.username;
		axiosInstance.get(`/user/nearby/${username}`)
			.then((response) => {
				this.userAddress = response.data.userAddress;
				this.initializeMap();
				this.addMarker(this.userAddress, 'user');

				const nearbyPost = response.data.posts;
				nearbyPost.forEach((post) => {
					this.addMarker(post.location, 'post');
				});
			})
			.catch((error) => {
				console.error(error);
			});
  },
  methods: {
    initializeMap() {
      this.vectorSource = new VectorSource();

      const vectorLayer = new VectorLayer({
        source: this.vectorSource,
        style: defaultConfig.userAddressMarkerStyle
      });

      this.map = new Map({
        target: 'map',
        layers: [
          new TileLayer({
            source: new OSM()
          }),
          vectorLayer
        ],
        view: new View({
          center: fromLonLat([this.userAddress.longitude, this.userAddress.latitude]),
          zoom: defaultConfig.mapZoom
        })
      });

			this.map.getView().on('change:resolution', () => {
        this.map.updateSize();
      });
    },
    addMarker(coordinate, type) {
			const point = fromLonLat([coordinate.longitude, coordinate.latitude])
      const marker = new Feature({
        geometry: new Point(point)
      });

			if (type === 'user') {
				marker.setStyle(defaultConfig.userAddressMarkerStyle);
			} else {
				marker.setStyle(defaultConfig.postLocationMarkerStyle);
			}

      this.vectorSource.addFeature(marker);
    }
  }
};
</script>

<style scoped>
#map {
  width: 100vw;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
}
</style>