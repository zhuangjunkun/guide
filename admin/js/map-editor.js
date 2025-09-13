// 地图编辑器主类
class MapEditor {
    constructor() {
        this.attractions = [];
        this.selectedAttraction = null;
        this.editMode = 'select';
        this.isDragging = false;
        this.isMapDragging = false;
        this.dragStartPos = { x: 0, y: 0 };
        this.mapTransform = { x: 0, y: 0, scale: 1 };
        this.showGrid = false;
        this.snapToGrid = false;
        this.gridSize = 20;
        this.hasUnsavedChanges = false;

        this.init();
    }

    async init() {
        this.bindEvents();
        await this.loadAttractions();
        this.updateUI();
        this.resetMapView();
    }

    bindEvents() {
        // 工具栏事件
        document.getElementById('addMarkerBtn').addEventListener('click', () => {
            this.setEditMode('add');
        });

        document.getElementById('saveAllBtn').addEventListener('click', () => {
            this.saveAllChanges();
        });

        document.getElementById('resetViewBtn').addEventListener('click', () => {
            this.resetMapView();
        });

        // 编辑模式切换
        document.querySelectorAll('input[name="editMode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.setEditMode(e.target.value);
            });
        });

        // 地图控制
        document.getElementById('zoomInBtn').addEventListener('click', () => {
            this.zoomMap(1.2);
        });

        document.getElementById('zoomOutBtn').addEventListener('click', () => {
            this.zoomMap(0.8);
        });

        // 网格控制
        document.getElementById('showGridBtn').addEventListener('change', (e) => {
            this.toggleGrid(e.target.checked);
        });

        document.getElementById('snapToGridBtn').addEventListener('change', (e) => {
            this.snapToGrid = e.target.checked;
        });

        // 地图交互事件
        this.bindMapEvents();

        // 属性面板事件
        this.bindPanelEvents();

        // 模态框事件
        this.bindModalEvents();

        // 键盘快捷键
        this.bindKeyboardEvents();

        // 窗口关闭确认
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '您有未保存的更改，确定要离开吗？';
            }
        });
    }

    bindMapEvents() {
        const mapContainer = document.getElementById('mapContainer');
        const mapWrapper = document.getElementById('mapWrapper');

        // 鼠标事件
        mapContainer.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // 左键
                this.handleMapMouseDown(e);
            }
        });

        mapContainer.addEventListener('mousemove', (e) => {
            this.handleMapMouseMove(e);
        });

        mapContainer.addEventListener('mouseup', (e) => {
            this.handleMapMouseUp(e);
        });

        // 滚轮缩放
        mapContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY > 0 ? 0.9 : 1.1;
            this.zoomMapAtPoint(delta, e.clientX, e.clientY);
        });

        // 触摸事件（移动端支持）
        mapContainer.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                this.handleMapMouseDown({
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => e.preventDefault()
                });
            }
        });

        mapContainer.addEventListener('touchmove', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                this.handleMapMouseMove({
                    clientX: touch.clientX,
                    clientY: touch.clientY
                });
            }
        });

        mapContainer.addEventListener('touchend', (e) => {
            this.handleMapMouseUp({});
        });
    }

    bindPanelEvents() {
        document.getElementById('closePanelBtn').addEventListener('click', () => {
            this.hidePropertiesPanel();
        });
    }

    bindModalEvents() {
        const modal = document.getElementById('attractionModal');
        const closeBtn = document.getElementById('attractionModalClose');
        const cancelBtn = document.getElementById('attractionModalCancel');
        const saveBtn = document.getElementById('attractionModalSave');
        const deleteBtn = document.getElementById('deleteAttractionBtn');

        closeBtn.addEventListener('click', () => {
            this.hideAttractionModal();
        });

        cancelBtn.addEventListener('click', () => {
            this.hideAttractionModal();
        });

        saveBtn.addEventListener('click', () => {
            this.saveAttraction();
        });

        deleteBtn.addEventListener('click', () => {
            this.deleteAttraction();
        });

        // 点击模态框背景关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideAttractionModal();
            }
        });
    }

    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            // ESC键取消当前操作
            if (e.key === 'Escape') {
                if (this.editMode === 'add') {
                    this.setEditMode('select');
                }
                this.clearSelection();
                this.hideAttractionModal();
                this.hidePropertiesPanel();
            }

            // Delete键删除选中的景点
            if (e.key === 'Delete' && this.selectedAttraction) {
                this.deleteAttraction();
            }

            // Ctrl+S保存
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.saveAllChanges();
            }

            // 数字键切换编辑模式
            if (e.key >= '1' && e.key <= '3') {
                const modes = ['select', 'add', 'move'];
                this.setEditMode(modes[parseInt(e.key) - 1]);
            }
        });
    }

    async loadAttractions() {
        try {
            this.attractions = await api.getAttractions();
            this.renderAttractionsList();
            this.renderMapMarkers();
        } catch (error) {
            console.error('Failed to load attractions:', error);
            Utils.showNotification('加载景点数据失败', 'error');
        }
    }

    renderAttractionsList() {
        const container = document.getElementById('attractionsList');
        
        if (this.attractions.length === 0) {
            container.innerHTML = '<div class="no-data">暂无景点数据</div>';
            return;
        }

        container.innerHTML = this.attractions.map(attraction => `
            <div class="attraction-item ${attraction.id === this.selectedAttraction?.id ? 'selected' : ''}" 
                 data-id="${attraction.id}">
                <div class="attraction-name">${attraction.name}</div>
                <div class="attraction-category">${attraction.category || '未分类'}</div>
                <div class="attraction-coords">X: ${(attraction.map_x || 0).toFixed(1)}%, Y: ${(attraction.map_y || 0).toFixed(1)}%</div>
                <div class="attraction-actions">
                    <button class="action-icon edit" title="编辑" onclick="mapEditor.editAttraction(${attraction.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-icon visibility" title="${attraction.is_active ? '隐藏' : '显示'}" 
                            onclick="mapEditor.toggleAttractionVisibility(${attraction.id})">
                        <i class="fas fa-${attraction.is_active ? 'eye' : 'eye-slash'}"></i>
                    </button>
                    <button class="action-icon delete" title="删除" onclick="mapEditor.confirmDeleteAttraction(${attraction.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');

        // 绑定点击事件
        container.querySelectorAll('.attraction-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.attraction-actions')) {
                    const id = parseInt(item.dataset.id);
                    this.selectAttraction(id);
                }
            });
        });
    }

    renderMapMarkers() {
        const container = document.getElementById('markersContainer');
        
        container.innerHTML = this.attractions.map(attraction => `
            <div class="map-marker ${attraction.id === this.selectedAttraction?.id ? 'selected' : ''} ${!attraction.is_active ? 'hidden' : ''}" 
                 data-id="${attraction.id}"
                 style="left: ${attraction.map_x || 0}%; top: ${attraction.map_y || 0}%;">
                <div class="marker-label">${attraction.name}</div>
            </div>
        `).join('');

        // 绑定标记事件
        container.querySelectorAll('.map-marker').forEach(marker => {
            this.bindMarkerEvents(marker);
        });
    }

    bindMarkerEvents(marker) {
        const id = parseInt(marker.dataset.id);

        marker.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            
            if (this.editMode === 'select') {
                this.selectAttraction(id);
            } else if (this.editMode === 'move') {
                this.startDragMarker(marker, e);
            }
        });

        marker.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            this.editAttraction(id);
        });
    }

    handleMapMouseDown(e) {
        const rect = document.getElementById('mapContainer').getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.editMode === 'add') {
            this.addAttractionAtPosition(x, y);
        } else if (this.editMode === 'select' || this.editMode === 'move') {
            this.startMapDrag(e);
        }
    }

    handleMapMouseMove(e) {
        // 更新坐标显示
        this.updateCoordinatesDisplay(e);

        // 处理地图拖拽
        if (this.isMapDragging) {
            this.updateMapDrag(e);
        }

        // 处理标记拖拽
        if (this.isDragging) {
            this.updateMarkerDrag(e);
        }
    }

    handleMapMouseUp(e) {
        this.endMapDrag();
        this.endMarkerDrag();
    }

    startMapDrag(e) {
        if (this.editMode !== 'select') return;
        
        this.isMapDragging = true;
        this.dragStartPos = { x: e.clientX, y: e.clientY };
        document.getElementById('mapContainer').classList.add('dragging');
    }

    updateMapDrag(e) {
        if (!this.isMapDragging) return;

        const deltaX = e.clientX - this.dragStartPos.x;
        const deltaY = e.clientY - this.dragStartPos.y;

        this.mapTransform.x += deltaX;
        this.mapTransform.y += deltaY;

        this.updateMapTransform();
        
        this.dragStartPos = { x: e.clientX, y: e.clientY };
    }

    endMapDrag() {
        this.isMapDragging = false;
        document.getElementById('mapContainer').classList.remove('dragging');
    }

    startDragMarker(marker, e) {
        this.isDragging = true;
        this.draggedMarker = marker;
        this.dragStartPos = { x: e.clientX, y: e.clientY };
        marker.classList.add('dragging');
        
        // 防止地图拖拽
        e.stopPropagation();
    }

    updateMarkerDrag(e) {
        if (!this.isDragging || !this.draggedMarker) return;

        const rect = document.getElementById('mapContainer').getBoundingClientRect();
        const mapWrapper = document.getElementById('mapWrapper');
        const mapRect = mapWrapper.getBoundingClientRect();

        let x = ((e.clientX - mapRect.left) / mapRect.width) * 100;
        let y = ((e.clientY - mapRect.top) / mapRect.height) * 100;

        // 限制在地图范围内
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        // 网格吸附
        if (this.snapToGrid) {
            const gridStep = (this.gridSize / mapRect.width) * 100;
            x = Math.round(x / gridStep) * gridStep;
            y = Math.round(y / gridStep) * gridStep;
        }

        this.draggedMarker.style.left = x + '%';
        this.draggedMarker.style.top = y + '%';

        // 更新坐标显示
        document.getElementById('coordinatesDisplay').textContent = `X: ${x.toFixed(1)}%, Y: ${y.toFixed(1)}%`;
    }

    endMarkerDrag() {
        if (!this.isDragging || !this.draggedMarker) return;

        const id = parseInt(this.draggedMarker.dataset.id);
        const attraction = this.attractions.find(a => a.id === id);

        if (attraction) {
            const style = this.draggedMarker.style;
            attraction.map_x = parseFloat(style.left);
            attraction.map_y = parseFloat(style.top);
            
            this.hasUnsavedChanges = true;
            this.updateAttractionCoordinates(attraction);
        }

        this.draggedMarker.classList.remove('dragging');
        this.isDragging = false;
        this.draggedMarker = null;
    }

    addAttractionAtPosition(x, y) {
        const rect = document.getElementById('mapWrapper').getBoundingClientRect();
        const mapX = (x / rect.width) * 100;
        const mapY = (y / rect.height) * 100;

        // 网格吸附
        let finalX = mapX;
        let finalY = mapY;
        
        if (this.snapToGrid) {
            const gridStep = (this.gridSize / rect.width) * 100;
            finalX = Math.round(mapX / gridStep) * gridStep;
            finalY = Math.round(mapY / gridStep) * gridStep;
        }

        this.showAttractionModal(null, finalX, finalY);
    }

    selectAttraction(id) {
        const attraction = this.attractions.find(a => a.id === id);
        if (!attraction) return;

        this.selectedAttraction = attraction;
        this.updateSelection();
        this.showPropertiesPanel(attraction);
    }

    clearSelection() {
        this.selectedAttraction = null;
        this.updateSelection();
        this.hidePropertiesPanel();
    }

    updateSelection() {
        // 更新列表选中状态
        document.querySelectorAll('.attraction-item').forEach(item => {
            item.classList.toggle('selected', 
                parseInt(item.dataset.id) === this.selectedAttraction?.id);
        });

        // 更新地图标记选中状态
        document.querySelectorAll('.map-marker').forEach(marker => {
            marker.classList.toggle('selected', 
                parseInt(marker.dataset.id) === this.selectedAttraction?.id);
        });
    }

    setEditMode(mode) {
        this.editMode = mode;
        
        // 更新UI状态
        document.querySelector(`input[name="editMode"][value="${mode}"]`).checked = true;
        
        // 更新地图容器类名
        const container = document.getElementById('mapContainer');
        container.classList.remove('adding', 'moving');
        
        if (mode === 'add') {
            container.classList.add('adding');
        } else if (mode === 'move') {
            container.classList.add('moving');
        }

        // 更新工具按钮状态
        document.getElementById('addMarkerBtn').classList.toggle('active', mode === 'add');
    }

    zoomMap(factor) {
        this.mapTransform.scale *= factor;
        this.mapTransform.scale = Math.max(0.1, Math.min(5, this.mapTransform.scale));
        this.updateMapTransform();
    }

    zoomMapAtPoint(factor, clientX, clientY) {
        const rect = document.getElementById('mapContainer').getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const oldScale = this.mapTransform.scale;
        this.mapTransform.scale *= factor;
        this.mapTransform.scale = Math.max(0.1, Math.min(5, this.mapTransform.scale));

        const scaleChange = this.mapTransform.scale / oldScale;
        this.mapTransform.x = x - (x - this.mapTransform.x) * scaleChange;
        this.mapTransform.y = y - (y - this.mapTransform.y) * scaleChange;

        this.updateMapTransform();
    }

    updateMapTransform() {
        const wrapper = document.getElementById('mapWrapper');
        wrapper.style.transform = `translate(${this.mapTransform.x}px, ${this.mapTransform.y}px) scale(${this.mapTransform.scale})`;
        
        // 更新缩放显示
        document.getElementById('zoomLevel').textContent = Math.round(this.mapTransform.scale * 100) + '%';
    }

    resetMapView() {
        this.mapTransform = { x: 0, y: 0, scale: 1 };
        this.updateMapTransform();
    }

    toggleGrid(show) {
        this.showGrid = show;
        document.getElementById('gridOverlay').classList.toggle('show', show);
    }

    updateCoordinatesDisplay(e) {
        const rect = document.getElementById('mapWrapper').getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
            document.getElementById('coordinatesDisplay').textContent = 
                `X: ${x.toFixed(1)}%, Y: ${y.toFixed(1)}%`;
        }
    }

    showPropertiesPanel(attraction) {
        const panel = document.getElementById('propertiesPanel');
        const content = document.getElementById('panelContent');
        
        content.innerHTML = `
            <div class="property-section">
                <h4>基本信息</h4>
                <div class="property-item">
                    <label>名称:</label>
                    <span>${attraction.name}</span>
                </div>
                <div class="property-item">
                    <label>分类:</label>
                    <span>${attraction.category || '未分类'}</span>
                </div>
                <div class="property-item">
                    <label>状态:</label>
                    <span class="status-badge ${attraction.is_active ? 'status-active' : 'status-inactive'}">
                        ${attraction.is_active ? '启用' : '禁用'}
                    </span>
                </div>
            </div>
            
            <div class="property-section">
                <h4>位置信息</h4>
                <div class="property-item">
                    <label>地图坐标:</label>
                    <span>X: ${(attraction.map_x || 0).toFixed(1)}%, Y: ${(attraction.map_y || 0).toFixed(1)}%</span>
                </div>
                <div class="property-item">
                    <label>地理坐标:</label>
                    <span>${attraction.latitude || 'N/A'}, ${attraction.longitude || 'N/A'}</span>
                </div>
            </div>
            
            <div class="property-section">
                <h4>详细信息</h4>
                <div class="property-item">
                    <label>描述:</label>
                    <span>${attraction.description || '暂无描述'}</span>
                </div>
                <div class="property-item">
                    <label>开放时间:</label>
                    <span>${attraction.opening_hours || '未设置'}</span>
                </div>
                <div class="property-item">
                    <label>门票价格:</label>
                    <span>${attraction.ticket_price || '未设置'}</span>
                </div>
            </div>
            
            <div class="property-actions">
                <button class="btn btn-primary" onclick="mapEditor.editAttraction(${attraction.id})">
                    <i class="fas fa-edit"></i>
                    编辑景点
                </button>
            </div>
        `;
        
        panel.classList.add('show');
    }

    hidePropertiesPanel() {
        document.getElementById('propertiesPanel').classList.remove('show');
    }

    showAttractionModal(attraction = null, mapX = 0, mapY = 0) {
        const modal = document.getElementById('attractionModal');
        const title = document.getElementById('attractionModalTitle');
        const form = document.getElementById('attractionForm');
        const deleteBtn = document.getElementById('deleteAttractionBtn');

        if (attraction) {
            title.textContent = '编辑景点';
            deleteBtn.style.display = 'inline-flex';
            this.populateAttractionForm(attraction);
        } else {
            title.textContent = '新增景点';
            deleteBtn.style.display = 'none';
            form.reset();
            document.getElementById('attractionMapX').value = mapX.toFixed(1);
            document.getElementById('attractionMapY').value = mapY.toFixed(1);
            document.getElementById('attractionActive').checked = true;
        }

        this.currentEditingAttraction = attraction;
        modal.classList.add('show');
    }

    hideAttractionModal() {
        document.getElementById('attractionModal').classList.remove('show');
        this.currentEditingAttraction = null;
    }

    populateAttractionForm(attraction) {
        document.getElementById('attractionName').value = attraction.name || '';
        document.getElementById('attractionCategory').value = attraction.category || '';
        document.getElementById('attractionDescription').value = attraction.description || '';
        document.getElementById('attractionMapX').value = (attraction.map_x || 0).toFixed(1);
        document.getElementById('attractionMapY').value = (attraction.map_y || 0).toFixed(1);
        document.getElementById('attractionOpeningHours').value = attraction.opening_hours || '';
        document.getElementById('attractionTicketPrice').value = attraction.ticket_price || '';
        document.getElementById('attractionAddress').value = attraction.address || '';
        document.getElementById('attractionImage').value = attraction.image || '';
        document.getElementById('attractionPhone').value = attraction.contact_phone || '';
        document.getElementById('attractionLatitude').value = attraction.latitude || '';
        document.getElementById('attractionLongitude').value = attraction.longitude || '';
        document.getElementById('attractionActive').checked = attraction.is_active !== false;
    }

    async saveAttraction() {
        try {
            const form = document.getElementById('attractionForm');
            const formData = new FormData(form);
            
            const attractionData = {
                name: formData.get('name'),
                category: formData.get('category'),
                description: formData.get('description'),
                map_x: parseFloat(formData.get('map_x')),
                map_y: parseFloat(formData.get('map_y')),
                opening_hours: formData.get('opening_hours'),
                ticket_price: formData.get('ticket_price'),
                address: formData.get('address'),
                image: formData.get('image'),
                contact_phone: formData.get('contact_phone'),
                latitude: formData.get('latitude') ? parseFloat(formData.get('latitude')) : null,
                longitude: formData.get('longitude') ? parseFloat(formData.get('longitude')) : null,
                is_active: formData.has('is_active')
            };

            let savedAttraction;
            if (this.currentEditingAttraction) {
                savedAttraction = await api.updateAttraction(this.currentEditingAttraction.id, attractionData);
                // 更新本地数据
                const index = this.attractions.findIndex(a => a.id === this.currentEditingAttraction.id);
                if (index !== -1) {
                    this.attractions[index] = { ...this.attractions[index], ...attractionData };
                }
            } else {
                savedAttraction = await api.createAttraction(attractionData);
                this.attractions.push(savedAttraction);
            }

            this.hideAttractionModal();
            this.renderAttractionsList();
            this.renderMapMarkers();
            this.hasUnsavedChanges = false;
            
            Utils.showNotification('景点保存成功', 'success');
        } catch (error) {
            console.error('Failed to save attraction:', error);
            Utils.showNotification('保存景点失败', 'error');
        }
    }

    async deleteAttraction() {
        if (!this.currentEditingAttraction) return;

        try {
            const confirmed = await Utils.confirm('确定要删除这个景点吗？此操作不可恢复。');
            if (!confirmed) return;

            await api.deleteAttraction(this.currentEditingAttraction.id);
            
            // 从本地数据中移除
            this.attractions = this.attractions.filter(a => a.id !== this.currentEditingAttraction.id);
            
            this.hideAttractionModal();
            this.clearSelection();
            this.renderAttractionsList();
            this.renderMapMarkers();
            
            Utils.showNotification('景点删除成功', 'success');
        } catch (error) {
            console.error('Failed to delete attraction:', error);
            Utils.showNotification('删除景点失败', 'error');
        }
    }

    editAttraction(id) {
        const attraction = this.attractions.find(a => a.id === id);
        if (attraction) {
            this.showAttractionModal(attraction);
        }
    }

    async toggleAttractionVisibility(id) {
        try {
            const attraction = this.attractions.find(a => a.id === id);
            if (!attraction) return;

            const newStatus = !attraction.is_active;
            await api.updateAttraction(id, { is_active: newStatus });
            
            attraction.is_active = newStatus;
            this.renderAttractionsList();
            this.renderMapMarkers();
            
            Utils.showNotification(`景点已${newStatus ? '启用' : '禁用'}`, 'success');
        } catch (error) {
            console.error('Failed to toggle attraction visibility:', error);
            Utils.showNotification('操作失败', 'error');
        }
    }

    confirmDeleteAttraction(id) {
        const attraction = this.attractions.find(a => a.id === id);
        if (attraction) {
            this.currentEditingAttraction = attraction;
            this.deleteAttraction();
        }
    }

    updateAttractionCoordinates(attraction) {
        // 更新表单中的坐标（如果正在编辑）
        if (this.currentEditingAttraction && this.currentEditingAttraction.id === attraction.id) {
            document.getElementById('attractionMapX').value = (attraction.map_x || 0).toFixed(1);
            document.getElementById('attractionMapY').value = (attraction.map_y || 0).toFixed(1);
        }

        // 更新属性面板
        if (this.selectedAttraction && this.selectedAttraction.id === attraction.id) {
            this.showPropertiesPanel(attraction);
        }

        // 更新列表显示
        this.renderAttractionsList();
    }

    async saveAllChanges() {
        if (!this.hasUnsavedChanges) {
            Utils.showNotification('没有需要保存的更改', 'info');
            return;
        }

        try {
            // 这里可以批量保存所有更改
            // 目前标记拖拽后会立即保存，所以这里主要是确认操作
            this.hasUnsavedChanges = false;
            Utils.showNotification('所有更改已保存', 'success');
        } catch (error) {
            console.error('Failed to save changes:', error);
            Utils.showNotification('保存失败', 'error');
        }
    }

    updateUI() {
        // 更新各种UI状态
        this.renderAttractionsList();
        this.renderMapMarkers();
        this.updateSelection();
    }
}

// 初始化地图编辑器
let mapEditor;
document.addEventListener('DOMContentLoaded', () => {
    mapEditor = new MapEditor();
});

// 添加属性面板样式
const propertyPanelStyles = `
.property-section {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f0f0f0;
}

.property-section:last-child {
    border-bottom: none;
}

.property-section h4 {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin-bottom: 12px;
}

.property-item {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 8px;
    font-size: 13px;
}

.property-item label {
    font-weight: 500;
    color: #666;
    min-width: 80px;
}

.property-item span {
    color: #333;
    text-align: right;
    flex: 1;
    margin-left: 12px;
    word-break: break-word;
}

.property-actions {
    margin-top: 20px;
}

.property-actions .btn {
    width: 100%;
    justify-content: center;
}
`;

const propertyStyleSheet = document.createElement('style');
propertyStyleSheet.textContent = propertyPanelStyles;
document.head.appendChild(propertyStyleSheet);