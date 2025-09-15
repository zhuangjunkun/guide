import { AttractionService } from './supabase-service.js';

// 地图页面逻辑
class MapApp {
    constructor() {
        this.scale = 1;
        this.minScale = 0.5;
        this.maxScale = 3;
        this.translateX = 0;
        this.translateY = 0;
        this.isDragging = false;
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
        
        this.markers = {}; // 数据将从API加载
        this.currentMarker = null;
    }

    async init() {
        await this.loadMarkers();
        this.renderMarkers();
        this.bindEvents();
        this.initMap();
        // 初始化标记缩放
        this.updateMarkerScale();
    }
    
    async loadMarkers() {
        const response = await AttractionService.getAll();
        if (response.success && response.data) {
            this.markers = response.data.reduce((acc, attraction) => {
                // 假设 location 格式为 "lng,lat"
                const [lng, lat] = attraction.location 
                    ? attraction.location.split(',').map(Number) 
                    : [0, 0];

                acc[attraction.id] = {
                    id: attraction.id,
                    name: attraction.name,
                    description: attraction.description,
                    image: (attraction.images && attraction.images.length > 0) 
                        ? attraction.images[0] 
                        : `https://picsum.photos/300/150?random=${attraction.id}`,
                    coordinates: { lat, lng }
                };
                return acc;
            }, {});
        } else {
            console.error('Failed to load attractions:', response.message);
            alert('景点数据加载失败，请稍后重试。');
        }
    }

    bindEvents() {
        const mapWrapper = document.getElementById('mapWrapper');
        const mapContent = document.getElementById('mapContent');
        
        // 鼠标事件
        mapWrapper.addEventListener('mousedown', this.handleMouseDown.bind(this));
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // 触摸事件
        mapWrapper.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        document.addEventListener('touchend', this.handleTouchEnd.bind(this));
        
        // 滚轮缩放
        mapWrapper.addEventListener('wheel', this.handleWheel.bind(this), { passive: false });
        
        // 控制按钮
        document.getElementById('zoomInBtn').addEventListener('click', () => this.zoomIn());
        document.getElementById('zoomOutBtn').addEventListener('click', () => this.zoomOut());
        document.getElementById('locateBtn').addEventListener('click', () => this.resetView());
        
        // 标记点击事件 (使用事件委托)
        mapContent.addEventListener('click', (e) => {
            const marker = e.target.closest('.marker');
            if (marker && !this.dragStarted) {
                e.stopPropagation();
                const markerId = marker.dataset.id;
                this.showMarkerPopup(markerId);
            }
        });

        mapContent.addEventListener('touchend', (e) => {
            const marker = e.target.closest('.marker');
            if (marker && !this.dragStarted) {
                e.stopPropagation();
                e.preventDefault(); // 防止触发click
                const markerId = marker.dataset.id;
                this.showMarkerPopup(markerId);
            }
        });

        // 防止在标记上拖动时移动地图
        mapContent.addEventListener('touchstart', (e) => {
            if (e.target.closest('.marker')) {
                e.stopPropagation();
            }
        });

        mapContent.addEventListener('touchmove', (e) => {
            if (e.target.closest('.marker')) {
                e.stopPropagation();
            }
        });
        
        // 弹窗事件
        document.getElementById('popupClose').addEventListener('click', (e) => {
            e.stopPropagation();
            this.hideMarkerPopup();
        });
        document.getElementById('navigateBtn').addEventListener('click', (e) => {
            e.stopPropagation();
            this.navigate();
        });
        
        // 点击背景遮罩关闭弹窗
        document.getElementById('popupBackdrop').addEventListener('click', () => {
            this.hideMarkerPopup();
        });
        
        // 点击地图关闭弹窗
        mapWrapper.addEventListener('click', (e) => {
            if (e.target === mapWrapper || e.target === mapContent) {
                this.hideMarkerPopup();
            }
        });
        
        // 弹窗点击事件阻止冒泡
        document.getElementById('markerPopup').addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    initMap() {
        this.updateTransform();
    }

    renderMarkers() {
        const mapContent = document.getElementById('mapContent');
        if (!mapContent) return;

        // 清除旧的静态标记（如果存在）
        const existingMarkers = mapContent.querySelectorAll('.marker');
        existingMarkers.forEach(m => m.remove());

        for (const id in this.markers) {
            const markerData = this.markers[id];
            const { lat, lng } = markerData.coordinates;

            // 跳过无效坐标的标记
            if (typeof lat !== 'number' || typeof lng !== 'number' || lat === 0 || lng === 0) {
                console.warn(`Skipping marker "${markerData.name}" due to invalid coordinates.`);
                continue;
            }

            const position = this.convertGeoToPixels(lat, lng);

            const markerElement = document.createElement('div');
            markerElement.className = 'marker';
            markerElement.dataset.id = id;
            markerElement.style.left = `${position.x}px`;
            markerElement.style.top = `${position.y}px`;

            const markerLabel = document.createElement('span');
            markerLabel.textContent = markerData.name;
            markerElement.appendChild(markerLabel);

            mapContent.appendChild(markerElement);
        }
    }

    // 将地理坐标转换为像素坐标
    // 注意：这是一个占位符实现。您需要根据您的地图图像和地理边界进行调整。
    convertGeoToPixels(lat, lng) {
        // 示例边界 - 需要替换为实际值
        const mapBounds = {
            width: 3000,  // 地图图像宽度（像素）
            height: 2250, // 地图图像高度（像素）
            geo: {
                top: 30.33,    // 地图顶部的纬度
                bottom: 30.18, // 地图底部的纬度
                left: 120.05,  // 地图左侧的经度
                right: 120.25  // 地图右侧的经度
            }
        };

        const lngRange = mapBounds.geo.right - mapBounds.geo.left;
        const latRange = mapBounds.geo.top - mapBounds.geo.bottom;

        const x = ((lng - mapBounds.geo.left) / lngRange) * mapBounds.width;
        const y = ((mapBounds.geo.top - lat) / latRange) * mapBounds.height;

        return { x, y };
    }

    // 鼠标事件处理
    handleMouseDown(e) {
        // 如果点击的是标记，不启动拖拽
        if (e.target.closest('.marker')) {
            return;
        }
        
        this.isDragging = true;
        this.dragStarted = false;
        this.startX = e.clientX - this.translateX;
        this.startY = e.clientY - this.translateY;
        this.initialMouseX = e.clientX;
        this.initialMouseY = e.clientY;
        document.getElementById('mapWrapper').classList.add('dragging');
        e.preventDefault();
    }

    handleMouseMove(e) {
        if (!this.isDragging) return;
        
        // 检测是否真正开始拖拽（移动距离超过阈值）
        const deltaX = Math.abs(e.clientX - this.initialMouseX);
        const deltaY = Math.abs(e.clientY - this.initialMouseY);
        
        if (!this.dragStarted && (deltaX > 5 || deltaY > 5)) {
            this.dragStarted = true;
        }
        
        if (this.dragStarted) {
            this.translateX = e.clientX - this.startX;
            this.translateY = e.clientY - this.startY;
            this.updateTransform();
        }
        
        e.preventDefault();
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.dragStarted = false;
        document.getElementById('mapWrapper').classList.remove('dragging');
    }

    // 触摸事件处理
    handleTouchStart(e) {
        // 如果点击的是标记，不启动拖拽
        if (e.target.closest('.marker')) {
            return;
        }
        
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            this.isDragging = true;
            this.dragStarted = false;
            this.startX = touch.clientX - this.translateX;
            this.startY = touch.clientY - this.translateY;
            this.initialTouchX = touch.clientX;
            this.initialTouchY = touch.clientY;
            this.lastX = touch.clientX;
            this.lastY = touch.clientY;
        } else if (e.touches.length === 2) {
            // 双指缩放
            this.isDragging = false;
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            this.initialDistance = this.getDistance(touch1, touch2);
            this.initialScale = this.scale;
        }
        e.preventDefault();
    }

    handleTouchMove(e) {
        if (e.touches.length === 1 && this.isDragging) {
            const touch = e.touches[0];
            
            // 检测是否真正开始拖拽
            const deltaX = Math.abs(touch.clientX - this.initialTouchX);
            const deltaY = Math.abs(touch.clientY - this.initialTouchY);
            
            if (!this.dragStarted && (deltaX > 10 || deltaY > 10)) {
                this.dragStarted = true;
            }
            
            if (this.dragStarted) {
                this.translateX = touch.clientX - this.startX;
                this.translateY = touch.clientY - this.startY;
                this.updateTransform();
            }
        } else if (e.touches.length === 2) {
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const distance = this.getDistance(touch1, touch2);
            const scaleChange = distance / this.initialDistance;
            this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.initialScale * scaleChange));
            this.updateTransform();
        }
        e.preventDefault();
    }

    handleTouchEnd(e) {
        this.isDragging = false;
        this.dragStarted = false;
    }

    // 滚轮缩放
    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.scale + delta));
        
        if (newScale !== this.scale) {
            this.scale = newScale;
            this.updateTransform();
        }
    }

    // 工具函数
    getDistance(touch1, touch2) {
        const dx = touch1.clientX - touch2.clientX;
        const dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    updateTransform() {
        const mapContent = document.getElementById('mapContent');
        mapContent.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
        
        // 更新标记缩放（与地图缩放相反）
        this.updateMarkerScale();
    }

    updateMarkerScale() {
        const markers = document.querySelectorAll('.marker');
        // 标记缩放与地图缩放相反，范围在0.6到1.4之间
        const markerScale = Math.max(0.6, Math.min(1.4, 1 / this.scale));
        
        markers.forEach(marker => {
            marker.style.transform = `translate(-50%, -100%) scale(${markerScale})`;
        });
    }

    // 缩放控制
    zoomIn() {
        if (this.scale < this.maxScale) {
            this.scale = Math.min(this.maxScale, this.scale + 0.2);
            this.updateTransform();
        }
    }

    zoomOut() {
        if (this.scale > this.minScale) {
            this.scale = Math.max(this.minScale, this.scale - 0.2);
            this.updateTransform();
        }
    }

    resetView() {
        this.scale = 1;
        this.translateX = 0;
        this.translateY = 0;
        this.updateTransform();
    }

    // 标记弹窗
    showMarkerPopup(markerId) {
        const marker = this.markers[markerId];
        if (!marker) return;

        const popup = document.getElementById('markerPopup');
        const backdrop = document.getElementById('popupBackdrop');
        const title = document.getElementById('popupTitle');
        const description = document.getElementById('popupDescription');

        title.textContent = marker.name;
        description.textContent = marker.description;

        backdrop.classList.add('show');
        popup.classList.add('show');
        this.currentMarker = marker;
    }

    hideMarkerPopup() {
        const popup = document.getElementById('markerPopup');
        const backdrop = document.getElementById('popupBackdrop');
        popup.classList.remove('show');
        backdrop.classList.remove('show');
        this.currentMarker = null;
    }

    // 导航功能
    navigate() {
        if (!this.currentMarker) return;
        
        const { lat, lng } = this.currentMarker.coordinates;
        
        // 检测设备类型并选择合适的地图应用
        const userAgent = navigator.userAgent;
        let mapUrl;
        
        if (/iPhone|iPad|iPod/.test(userAgent)) {
            // iOS设备 - 优先使用Apple Maps
            mapUrl = `maps://maps.google.com/maps?daddr=${lat},${lng}&amp;ll=`;
        } else if (/Android/.test(userAgent)) {
            // Android设备 - 使用Google Maps
            mapUrl = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(this.currentMarker.name)})`;
        } else {
            // 桌面设备 - 使用高德地图网页版
            mapUrl = `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(this.currentMarker.name)}`;
        }
        
        // 尝试打开原生应用，失败则使用网页版
        const link = document.createElement('a');
        link.href = mapUrl;
        link.target = '_blank';
        
        try {
            link.click();
        } catch (error) {
            // 如果原生应用打开失败，使用高德地图网页版
            const webMapUrl = `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(this.currentMarker.name)}`;
            window.open(webMapUrl, '_blank');
        }
        
        console.log(`导航到: ${this.currentMarker.name} (${lat}, ${lng})`);
    }

    showDetail() {
        if (!this.currentMarker) return;
        
        // 这里可以跳转到详情页面
        console.log(`查看详情: ${this.currentMarker.name}`);
        // window.location.href = `detail.html?id=${this.currentMarker.id}`;
        
        // 临时显示详细信息
        alert(`${this.currentMarker.name}\n\n${this.currentMarker.description}`);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    const app = new MapApp();
    app.init();
    console.log('123',app)
});