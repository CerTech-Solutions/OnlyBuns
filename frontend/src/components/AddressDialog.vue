<template>
  <div>
    <v-dialog v-model="dialog" max-width="800px" :persistent="!addressSelected">
      <v-card>
        <v-card-title class="headline">Select your address</v-card-title>
        <v-card-text>
          <div id="map" class="map"></div>
          <div>
            <label for="latitude">Latitude:</label>
            <input type="text" id="latitude" v-model="latitude" readonly>
          </div>
          <div>
            <label for="longitude">Longitude:</label>
            <input type="text" id="longitude" v-model="longitude" readonly>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeDialog" :disabled="!addressSelected">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { defaultConfig } from '@/config/config';

export default {
  data() {
    return {
      dialog: false,
      map: null,
      vectorSource: null,
      latitude: '',
      longitude: '',
      addressSelected: false
    };
  },
  watch: {
    dialog(val) {
      if (val) {
        this.$nextTick(() => {
          this.initializeMap();
        });
      } else {
        this.destroyMap();
      }
    }
  },
  methods: {
    initializeMap() {
      if (!this.map) {
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
            center: fromLonLat(defaultConfig.mapLocation),
            zoom: defaultConfig.mapZoom
          })
        });

        if (this.latitude && this.longitude) {
          const coordinates = fromLonLat([this.longitude, this.latitude]);
          this.addMarker(coordinates);
        }

        this.map.on('click', (event) => {
          const coordinates = toLonLat(event.coordinate);
          this.latitude = parseFloat(coordinates[1].toFixed(8));
          this.longitude = parseFloat(coordinates[0].toFixed(8));
          this.addressSelected = true;

          this.$emit('address-selected', {
            latitude: this.latitude,
            longitude: this.longitude
          });

          this.addMarker(event.coordinate);
        });
      }
    },
    destroyMap() {
      if (this.map) {
        this.map.setTarget(null);
        this.map = null;
        this.vectorSource = null;
      }
    },
    addMarker(coordinate) {
      this.vectorSource.clear();

      const marker = new Feature({
        geometry: new Point(coordinate)
      });

      this.vectorSource.addFeature(marker);
    },
    closeDialog() {
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
#map {
  width: 100%;
  height: 400px;
}
</style>