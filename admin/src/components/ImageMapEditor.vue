<template>
  <div ref="mapContainer" class="map-editor-container"></div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default icon issue with webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default {
  name: 'ImageMapEditor',
  props: {
    imageUrl: {
      type: String,
      required: true,
    },
    markers: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      map: null,
      imageOverlay: null,
      markerLayer: null,
      imageDimensions: { width: 0, height: 0 },
    };
  },
  watch: {
    imageUrl(newUrl) {
      if (newUrl) {
        this.loadImageAndInitMap();
      }
    },
    markers: {
      handler(newMarkers) {
        this.renderMarkers(newMarkers);
      },
      deep: true,
    },
  },
  mounted() {
    if (this.imageUrl) {
      this.loadImageAndInitMap();
    }
  },
  beforeDestroy() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    loadImageAndInitMap() {
      const img = new Image();
      img.onload = () => {
        this.imageDimensions.width = img.width;
        this.imageDimensions.height = img.height;
        this.initMap();
      };
      img.src = this.imageUrl;
    },

    initMap() {
      if (this.map) {
        this.map.remove();
      }

      const { width, height } = this.imageDimensions;
      if (!width || !height) return;

      this.map = L.map(this.$refs.mapContainer, {
        crs: L.CRS.Simple,
        minZoom: -5,
        maxZoom: 5,
        center: [height / 2, width / 2],
        zoom: 0,
      });

      const bounds = [[0, 0], [height, width]];
      this.imageOverlay = L.imageOverlay(this.imageUrl, bounds).addTo(this.map);
      this.map.fitBounds(bounds);

      this.markerLayer = L.layerGroup().addTo(this.map);
      this.renderMarkers(this.markers);

      this.map.on('click', this.onMapClick);
    },

    renderMarkers(markers) {
      if (!this.map || !this.markerLayer) return;
      this.markerLayer.clearLayers();

      const { width, height } = this.imageDimensions;
      if (!width || !height) return;

      markers.forEach(markerData => {
        // Using longitude for X, latitude for Y
        const lat = markerData.latitude * height;
        const lng = markerData.longitude * width;

        const marker = L.marker([lat, lng], {
          draggable: true,
          ...markerData.iconOptions,
        });

        marker.markerId = markerData.id;

        if (markerData.name) {
          marker.bindPopup(`<b>${markerData.name}</b><br>${markerData.description || ''}`);
        }

        marker.on('dragend', this.onMarkerDragEnd);
        this.markerLayer.addLayer(marker);
      });
    },

    onMapClick(e) {
      const { lat, lng } = e.latlng;
      const { width, height } = this.imageDimensions;

      // Using longitude for X, latitude for Y
      const relativeX = Math.max(0, Math.min(1, lng / width));
      const relativeY = Math.max(0, Math.min(1, lat / height));

      this.$emit('map-click', { longitude: relativeX, latitude: relativeY });
    },

    onMarkerDragEnd(e) {
      const marker = e.target;
      const { lat, lng } = marker.getLatLng();
      const { width, height } = this.imageDimensions;

      // Using longitude for X, latitude for Y
      const relativeX = Math.max(0, Math.min(1, lng / width));
      const relativeY = Math.max(0, Math.min(1, lat / height));

      this.$emit('marker-drag', {
        id: marker.markerId,
        longitude: relativeX,
        latitude: relativeY,
      });
    },
  },
};
</script>

<style scoped>
.map-editor-container {
  width: 100%;
  height: 100%;
  background-color: #f0f0f0;
}
</style>
