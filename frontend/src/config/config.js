import { Icon, Style, Stroke } from 'ol/style';

export const defaultConfig = {
	baseURL: 'http://localhost:3000/api',
	mapZoom: 13.5,
	mapLocation: [19.823182951442245, 45.23942501835891],
	mapProjection: 'EPSG:3857',
	userAddressMarkerStyle: new Style({
		image: new Icon({
			anchor: [32, 35],
			anchorXUnits: 'pixels',
			anchorYUnits: 'pixels',
			scale: 0.65,
			src: 'https://maps.google.com/mapfiles/kml/shapes/ranger_station.png'
		})
	}),
	postLocationMarkerStyle: new Style({
		image: new Icon({
			anchor: [16, 64],
			anchorXUnits: 'pixels',
			anchorYUnits: 'pixels',
			scale: 0.5,
			src: 'https://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png'
		})
	}),
	nearbyCircleStyle: new Style({
		stroke: new Stroke({
			color: 'black',
			width: 2,
			lineDash: [20, 25]
		}),
	}),
	nearbyCircleRadius: 4500, // NOTE: this is in meaters, but is bigger then actual size that backend uses to calculate nearby posts
};