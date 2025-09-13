// 地图编辑器模块 - 基础功能
class MapEditorModule {
    constructor() {
        this.map = null;
        this.markers = [];
        this.markerLayers = [];
        this.selectedMarker = null;
        this.isEditing = false;
        this.attractions = [];
        
        this.init();
    }

    async init() {
        await this.loadAttractions();
        await this.loadMapMarkers();
        this.initMap();
        this.bindEvents();
    }

    // 初始化地图
    initMap() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        // 创建地图实例
        this.map = L.map('map-container').setView([39.90923, 116.397428], 13);

        // 添加地图图层
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        // 加载手绘地图
        this.loadHandDrawnMap();

        // 绑定地图事件
        this.bindMapEvents();
    }

    // 加载手绘地图
    async loadHandDrawnMap() {
        try {
            const mapImage = await this.checkMapImage();
            
            if (mapImage) {
                const imageBounds = this.calculateImageBounds(mapImage);
                L.imageOverlay(mapImage, imageBounds).addTo(this.map);
                this.map.fitBounds(imageBounds);
            }

        } catch (error) {
            console.error('加载手绘地图失败:', error);
        }
    }

    // 检查地图图片
    async checkMapImage() {
        const mapImages = [
            '/assets/map.jpg',
            '/assets/map.png',
            '/images/map.jpg',
            '/images/map.png'
        ];

        for (const imageUrl of mapImages) {
            try {
                const response = await fetch(imageUrl, { method: 'HEAD' });
                if (response.ok) return imageUrl;
            } catch (error) {
                continue;
            }
        }
        return null;
    }

    // 计算图片边界
    calculateImageBounds(imageUrl) {
        return [
            [39.75, 116.15],
            [40.05, 116.65]
        ];
    }

    // 绑定地图事件
    bindMapEvents() {
        if (!this.map) return;

        this.map.on('click', (e) => {
            if (this.isEditing) this.addMarker(e.latlng);
        });

        this.map.on('contextmenu', (e) => {
            if (this.isEditing) this.showContextMenu(e);
        });
    }

    // 绑定UI事件
    bindEvents() {
        const editToggle = document.getElementById('edit-mode-toggle');
        if (editToggle) {
            editToggle.addEventListener('change', (e) => {
                this.isEditing = e.target.checked;
                this.updateEditMode();
            });
        }

        const saveBtn = document.getElementById('save-markers-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.saveMarkers());
        }

        const resetBtn = document.getElementById('reset-markers-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.confirmResetMarkers());
        }

        const attractionSelect = document.getElementById('marker-attraction');
        if (attractionSelect) {
            attractionSelect.addEventListener('change', (e) => {
                this.updateSelectedMarkerAttraction(e.target.value);
            });
        }
    }

    // 更新编辑模式
    updateEditMode() {
        const mapContainer = document.getElementById('map-container');
        if (!mapContainer) return;

        mapContainer.classList.toggle('editing-mode', this.isEditing);
        this.showToast(this.isEditing ? '编辑模式已启用' : '编辑模式已禁用', 'info');
    }

    // 加载景点数据
    async loadAttractions() {
        try {
            const result = await window.apiService.attractions.getAll({
                activeOnly: true,
                orderBy: 'name',
                ascending: true
            });

            if (result.error) throw new Error(result.error);
            this.attractions = result.data || [];
            this.renderAttractionSelect();

        } catch (error) {
            console.error('加载景点数据失败:', error);
            this.showError('加载景点数据失败: ' + error.message);
        }
    }

    // 渲染景点选择器
    renderAttractionSelect() {
        const select = document.getElementById('marker-attraction');
        if (!select) return;

        let html = '<option value="">选择关联景点</option>';
        this.attractions.forEach(attraction => {
            html += `<option value="${attraction.id}">${this.escapeHtml(attraction.name)}</option>`;
        });
        select.innerHTML = html;
    }

    // 加载地图标记
    async loadMapMarkers() {
        try {
            const result = await window.apiService.mapMarkers.getAll();
            if (result.error) throw new Error(result.error);
            this.markers = result.data || [];
            this.renderMarkers();

        } catch (error) {
            console.error('加载地图标记失败:', error);
            this.showError('加载地图标记失败: ' + error.message);
        }
    }

    // 渲染地图标记
    renderMarkers() {
        if (!this.map) return;
        this.clearMarkers();

        this.markers.forEach(markerData => {
            this.createMarker(markerData);
        });
    }

    // 清除所有标记
    clearMarkers() {
        this.markerLayers.forEach(marker => this.map.removeLayer(marker));
        this.markerLayers = [];
    }

    // 创建标记
    createMarker(markerData) {
        if (!this.map || !markerData.latitude || !markerData.longitude) return;

        const latlng = [markerData.latitude, markerData.longitude];
        const marker = L.marker(latlng, {
            draggable: this.isEditing,
            icon: this.createCustomIcon(markerData)
        }).addTo(this.map);

        marker.bindPopup(this.createPopupContent(markerData));
        
        marker.on('click', () => this.selectMarker(markerData));
        marker.on('dragend', (e) => {
            if (this.isEditing) this.updateMarkerPosition(markerData, e.target.getLatLng());
        });

        marker._markerData = markerData;
        this.markerLayers.push(marker);
    }

    // 创建自定义图标
    createCustomIcon(markerData) {
        return L.divIcon({
            className: 'custom-marker',
            html: this.getMarkerHtml(markerData),
            iconSize: [32, 32],
            iconAnchor: [16, 32]
        });
    }

    // 获取标记HTML
    getMarkerHtml(markerData) {
        const color = this.getMarkerColor(markerData);
        return `
            <div class="marker-icon" style="background-color: ${color}">
                <i class="fas fa-map-marker-alt"></i>
            </div>
        `;
    }

    // 获取标记颜色
    getMarkerColor(markerData) {
        const colors = ['#2D9596', '#9AD0C2', '#F1FADA', '#265073', '#FF6B6B'];
        return colors[(markerData.attraction_id || 0) % colors.length];
    }

    // 创建弹出内容
    createPopupContent(markerData) {
        const { attraction } = markerData;
        if (!attraction) return '<div class="marker-popup">未关联景点</div>';

        return `
            <div class="marker-popup">
                <h3>${this.escapeHtml(attraction.name)}</h3>
                ${attraction.description ? `<p>${this.escapeHtml(attraction.description)}</p>` : ''}
                <div class="popup-actions">
                    <button class="btn btn-sm btn-primary" onclick="mapEditor.navigateToAttraction(${attraction.id})">
                        查看详情
                    </button>
                </div>
            </div>
        `;
    }

    // 添加标记
    addMarker(latlng) {
        const markerData = {
            latitude: latlng.lat,
            longitude: latlng.lng,
            attraction_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        this.createMarker(markerData);
        this.markers.push(markerData);
        this.selectMarker(markerData);
    }

    // 选择标记
    selectMarker(markerData) {
        this.selectedMarker = markerData;
        this.updateMarkerDetails();
        
        this.markerLayers.forEach(marker => {
            const isSelected = marker._markerData.id === markerData.id;
            marker.getElement().classList.toggle('selected', isSelected);
        });
    }

    // 更新标记详情
    updateMarkerDetails() {
        if (!this.selectedMarker) return;

        const detailsPanel = document.getElementById('marker-details');
        if (!detailsPanel) return;

        const { attraction } = this.selectedMarker;
        detailsPanel.innerHTML = `
            <h3>标记详情</h3>
            <div class="marker-info">
                <p><strong>坐标:</strong> ${this.selectedMarker.latitude}, ${this.selectedMarker.longitude}</p>
                ${attraction ? `<p><strong>关联景点:</strong> ${this.escapeHtml(attraction.name)}</p>` : ''}
            </div>
        `;
    }

    // 保存标记
    async saveMarkers() {
        this.showLoading('正在保存标记...');

        try {
            const result = await window.apiService.mapMarkers.batchUpdate(this.markers);
            if (result.error) throw new Error(result.error);
            
            this.showSuccess('标记保存成功');
            await this.loadMapMarkers();

        } catch (error) {
            console.error('保存标记失败:', error);
            this.showError('保存标记失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // 显示确认重置对话框
    confirmResetMarkers() {
        const confirmed = confirm('确定要重置所有标记吗？此操作不可撤销。');
        if (confirmed) this.resetMarkers();
    }

    // 重置标记
    async resetMarkers() {
        this.showLoading('正在重置标记...');

        try {
            // 删除所有现有标记
            for (const marker of this.markers) {
                if (marker.id) {
                    await window.apiService.mapMarkers.delete(marker.id);
                }
            }

            this.markers = [];
            this.clearMarkers();
            this.showSuccess('标记重置成功');

        } catch (error) {
            console.error('重置标记失败:', error);
            this.showError('重置标记失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // 工具函数
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showLoading(message = '加载中...') {
        console.log('Loading:', message);
    }

    hideLoading() {
        console.log('Loading hidden');
    }

    showSuccess(message) {
        console.log('Success:', message);
    }

    showError(message) {
        console.error('Error:', message);
    }

    showToast(message, type = 'info') {
        console.log(`Toast [${type}]:`, message);
    }
}

// 初始化地图编辑器
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('map-editor-page')) {
        window.mapEditor = new MapEditorModule();
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MapEditorModule;
}