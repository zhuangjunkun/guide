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
        
        this.markers = {
            1: {
                id: 1,
                name: '西湖',
                description: '西湖，位于浙江省杭州市西湖区龙井路1号，杭州市区西部，景区总面积49平方千米，汇水面积21.22平方千米，湖面面积6.38平方千米。',
                image: 'https://picsum.photos/300/150?random=11',
                coordinates: { lat: 30.2741, lng: 120.1551 }
            },
            2: {
                id: 2,
                name: '灵隐寺',
                description: '灵隐寺，又名云林寺，位于浙江省杭州市，背靠北高峰，面朝飞来峰，始建于东晋咸和元年（326年），占地面积约87000平方米。',
                image: 'https://picsum.photos/300/150?random=12',
                coordinates: { lat: 30.2408, lng: 120.1014 }
            },
            3: {
                id: 3,
                name: '宋城',
                description: '杭州宋城景区是中国大陆人气最旺的主题公园，年游客逾700万人次。秉承"建筑为形，文化为魂"的经营理念。',
                image: 'https://picsum.photos/300/150?random=13',
                coordinates: { lat: 30.1957, lng: 120.0778 }
            },
            4: {
                id: 4,
                name: '河坊街',
                description: '河坊街位于吴山脚下，是清河坊的一部分，属于杭州老城区，旧时，与中山中路相交得"清河坊四拐角"，自民国以来，分别为孔凤春香粉店、宓大昌旱烟、万隆火腿店、张允升帽庄四家各踞一角，成为当时远近闻名得区片。',
                image: 'https://picsum.photos/300/150?random=14',
                coordinates: { lat: 30.2467, lng: 120.1707 }
            }
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.initMap();
        // 初始化标记缩放
        this.updateMarkerScale();
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
        
        // 标记点击事件
        const markers = document.querySelectorAll('.marker');
        markers.forEach(marker => {
            // 使用 touchend 和 click 事件
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // 如果正在拖拽，不触发点击
                if (this.dragStarted) {
                    return;
                }
                
                const markerId = marker.dataset.id;
                this.showMarkerPopup(markerId);
            });
            
            // 添加触摸事件处理
            marker.addEventListener('touchend', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // 如果正在拖拽，不触发点击
                if (this.dragStarted) {
                    return;
                }
                
                const markerId = marker.dataset.id;
                this.showMarkerPopup(markerId);
            });
            
            // 防止标记上的触摸事件冒泡
            marker.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            });
            
            marker.addEventListener('touchmove', (e) => {
                e.stopPropagation();
            });
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
    new MapApp();
});