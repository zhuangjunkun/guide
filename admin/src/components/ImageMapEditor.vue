<template>
  <div class="map-editor-container">
    <!-- 地图容器 -->
    <div class="map-wrapper" ref="mapWrapper">
      <div class="map-content" ref="mapContent">
        <!-- 地图图片 -->
        <img 
          class="map-image" 
          ref="mapImage" 
          :src="imageUrl" 
          alt="地图" 
          draggable="false"
          @load="onImageLoad"
        >
        
        <!-- 标记容器 -->
        <div class="markers-container" ref="markersContainer"></div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="editor-controls">
      <button class="control-btn" @click="zoomIn" title="放大">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
        </svg>
      </button>
      <button class="control-btn" @click="zoomOut" title="缩小">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M19 13H5v-2h14v2z"/>
        </svg>
      </button>
      <button class="control-btn" @click="resetView" title="重置视图">
        <svg viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
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
      scale: 1,
      minScale: 0.5,
      maxScale: 3,
      translateX: 0,
      translateY: 0,
      isDragging: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      imageNaturalWidth: 0,
      imageNaturalHeight: 0,
      dragStarted: false,
    };
  },
  watch: {
    imageUrl(newUrl) {
      if (newUrl) {
        this.$nextTick(() => {
          const img = this.$refs.mapImage;
          if (img) {
            img.src = newUrl;
          }
        });
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
    this.bindEvents();
    if (this.imageUrl && this.$refs.mapImage) {
      this.$refs.mapImage.src = this.imageUrl;
    }
  },
  methods: {
    onImageLoad() {
      const img = this.$refs.mapImage;
      this.imageNaturalWidth = img.naturalWidth;
      this.imageNaturalHeight = img.naturalHeight;
      this.resetView();
      this.renderMarkers(this.markers);
    },

    bindEvents() {
      const mapWrapper = this.$refs.mapWrapper;
      if (!mapWrapper) return;

      // 鼠标事件
      mapWrapper.addEventListener('mousedown', this.handleMouseDown);
      document.addEventListener('mousemove', this.handleMouseMove);
      document.addEventListener('mouseup', this.handleMouseUp);
      
      // 触摸事件
      mapWrapper.addEventListener('touchstart', this.handleTouchStart, { passive: false });
      document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
      document.addEventListener('touchend', this.handleTouchEnd);
      
      // 滚轮缩放
      mapWrapper.addEventListener('wheel', this.handleWheel, { passive: false });
    },

    handleMouseDown(e) {
      e.preventDefault();
      this.isDragging = true;
      this.startX = e.clientX - this.translateX;
      this.startY = e.clientY - this.translateY;
      this.dragStarted = false;
    },

    handleMouseMove(e) {
      if (!this.isDragging) return;
      
      this.dragStarted = true;
      this.translateX = e.clientX - this.startX;
      this.translateY = e.clientY - this.startY;
      this.updateTransform();
    },

    handleMouseUp(e) {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      if (!this.dragStarted && this.$refs.mapContent) {
        // 点击事件处理
        const rect = this.$refs.mapContent.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // 转换为相对坐标 (0-1)
        const relativeX = clickX / rect.width;
        const relativeY = clickY / rect.height;
        
        this.$emit('map-click', { 
          longitude: relativeX, 
          latitude: relativeY 
        });
      }
    },

    handleTouchStart(e) {
      if (e.touches.length === 1) {
        e.preventDefault();
        this.isDragging = true;
        this.startX = e.touches[0].clientX - this.translateX;
        this.startY = e.touches[0].clientY - this.translateY;
        this.dragStarted = false;
      }
    },

    handleTouchMove(e) {
      if (!this.isDragging || e.touches.length !== 1) return;
      
      this.dragStarted = true;
      this.translateX = e.touches[0].clientX - this.startX;
      this.translateY = e.touches[0].clientY - this.startY;
      this.updateTransform();
    },

    handleTouchEnd(e) {
      if (!this.isDragging) return;
      
      this.isDragging = false;
      if (!this.dragStarted && this.$refs.mapContent && e.changedTouches.length === 1) {
        // 触摸点击事件处理
        const rect = this.$refs.mapContent.getBoundingClientRect();
        const touch = e.changedTouches[0];
        const clickX = touch.clientX - rect.left;
        const clickY = touch.clientY - rect.top;
        
        // 转换为相对坐标 (0-1)
        const relativeX = clickX / rect.width;
        const relativeY = clickY / rect.height;
        
        this.$emit('map-click', { 
          longitude: relativeX, 
          latitude: relativeY 
        });
      }
    },

    handleWheel(e) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));
      this.updateTransform();
    },

    zoomIn() {
      this.scale = Math.min(this.maxScale, this.scale + 0.2);
      this.updateTransform();
    },

    zoomOut() {
      this.scale = Math.max(this.minScale, this.scale - 0.2);
      this.updateTransform();
    },

    resetView() {
      this.scale = 1;
      this.translateX = 0;
      this.translateY = 0;
      this.updateTransform();
    },

    updateTransform() {
      const mapContent = this.$refs.mapContent;
      if (mapContent) {
        mapContent.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
      }
    },

    renderMarkers(markers) {
      const markersContainer = this.$refs.markersContainer;
      if (!markersContainer) return;

      // 清空现有标记
      markersContainer.innerHTML = '';

      markers.forEach(markerData => {
        if (typeof markerData.map_x === 'number' && typeof markerData.map_y === 'number') {
          const marker = document.createElement('div');
          marker.className = 'marker';
          marker.style.position = 'absolute';
          marker.style.left = `${markerData.map_x * 100}%`;
          marker.style.top = `${markerData.map_y * 100}%`;
          marker.style.transform = 'translate(-50%, -50%)';
          marker.style.cursor = 'pointer';
          marker.style.zIndex = '10';
          
          // 标记样式
          marker.innerHTML = `
            <div style="
              width: 20px;
              height: 20px;
              background: #ff4444;
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            "></div>
          `;

          // 点击事件
          marker.addEventListener('click', (e) => {
            e.stopPropagation();
            this.$emit('marker-click', markerData);
          });

          markersContainer.appendChild(marker);
        }
      });
    },
  },

  beforeDestroy() {
    // 清理事件监听器
    const mapWrapper = this.$refs.mapWrapper;
    if (mapWrapper) {
      mapWrapper.removeEventListener('mousedown', this.handleMouseDown);
      mapWrapper.removeEventListener('touchstart', this.handleTouchStart);
      mapWrapper.removeEventListener('wheel', this.handleWheel);
    }
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
  },
};
</script>

<style scoped>
.map-editor-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f0f0f0;
}

.map-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  touch-action: none;
}

.map-content {
  width: 100%;
  height: 100%;
  position: relative;
  transform-origin: center center;
  transition: transform 0.1s ease-out;
}

.map-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  user-select: none;
  -webkit-user-drag: none;
}

.markers-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.markers-container > * {
  pointer-events: auto;
}

.editor-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 100;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #f5f5f5;
  transform: scale(1.05);
}

.control-btn:active {
  transform: scale(0.95);
}
</style>
