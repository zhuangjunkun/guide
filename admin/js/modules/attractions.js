// 景点管理模块
class AttractionsModule {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.searchTerm = '';
        this.categoryFilter = '';
        this.sortField = 'created_at';
        this.sortOrder = 'desc';
        this.isLoading = false;
        this.categories = [];
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadAttractions();
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('attractions-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.searchTerm = searchInput.value.trim();
                this.loadAttractions();
            }, 300));
        }

        // 分类筛选
        const categorySelect = document.getElementById('attractions-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                this.categoryFilter = categorySelect.value;
                this.loadAttractions();
            });
        }

        // 排序功能
        const sortSelect = document.getElementById('attractions-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const [field, order] = sortSelect.value.split('_');
                this.sortField = field;
                this.sortOrder = order;
                this.loadAttractions();
            });
        }

        // 分页功能
        document.addEventListener('click', (e) => {
            if (e.target.closest('.pagination-btn')) {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    this.currentPage = page;
                    this.loadAttractions();
                }
            }
        });

        // 新建景点
        const newAttractionBtn = document.getElementById('new-attraction-btn');
        if (newAttractionBtn) {
            newAttractionBtn.addEventListener('click', () => {
                this.showAttractionModal();
            });
        }

        // 编辑景点
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-attraction-btn');
            if (editBtn) {
                const attractionId = editBtn.dataset.id;
                this.showAttractionModal(attractionId);
            }
        });

        // 删除景点
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-attraction-btn');
            if (deleteBtn) {
                const attractionId = deleteBtn.dataset.id;
                const attractionName = deleteBtn.dataset.name;
                this.confirmDeleteAttraction(attractionId, attractionName);
            }
        });

        // 模态框事件
        this.bindModalEvents();
    }

    // 绑定模态框事件
    bindModalEvents() {
        const modal = document.getElementById('attraction-modal');
        if (!modal) return;

        // 关闭模态框
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close') || e.target === modal) {
                this.hideAttractionModal();
            }
        });

        // 保存景点
        const saveBtn = document.getElementById('save-attraction-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveAttraction();
            });
        }

        // 表单提交
        const form = document.getElementById('attraction-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveAttraction();
            });
        }

        // 图片上传
        const imageInput = document.getElementById('attraction-image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files[0]);
            });
        }
    }

    // 加载分类列表
    async loadCategories() {
        try {
            const result = await window.apiService.categories.getAll({
                activeOnly: true,
                orderBy: 'display_order',
                ascending: true
            });

            if (result.error) {
                throw new Error(result.error);
            }

            this.categories = result.data || [];
            this.renderCategoryFilter();

        } catch (error) {
            console.error('加载分类失败:', error);
            this.showError('加载分类失败: ' + error.message);
        }
    }

    // 渲染分类筛选器
    renderCategoryFilter() {
        const select = document.getElementById('attractions-category');
        if (!select) return;

        let html = '<option value="">所有分类</option>';
        
        this.categories.forEach(category => {
            html += `<option value="${category.id}">${this.escapeHtml(category.name)}</option>`;
        });

        select.innerHTML = html;
        
        // 设置当前筛选值
        if (this.categoryFilter) {
            select.value = this.categoryFilter;
        }
    }

    // 加载景点列表
    async loadAttractions() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();

        try {
            const result = await window.apiService.attractions.getAll({
                categoryId: this.categoryFilter || undefined,
                activeOnly: false,
                orderBy: this.sortField,
                ascending: this.sortOrder === 'asc'
            });

            if (result.error) {
                throw new Error(result.error);
            }

            this.renderAttractions(result.data || []);
            this.updatePagination(result.data.length);

        } catch (error) {
            console.error('加载景点失败:', error);
            this.showError('加载景点失败: ' + error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // 渲染景点列表
    renderAttractions(attractions) {
        const container = document.getElementById('attractions-container');
        if (!container) return;

        if (attractions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-map-marker-alt"></i>
                    <p>暂无景点数据</p>
                    <button class="btn btn-primary" id="new-attraction-empty-btn">
                        创建第一个景点
                    </button>
                </div>
            `;
            
            // 绑定空状态的创建按钮
            const btn = document.getElementById('new-attraction-empty-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.showAttractionModal();
                });
            }
            
            return;
        }

        const html = attractions.map(attraction => `
            <div class="attraction-card" data-id="${attraction.id}">
                <div class="attraction-image">
                    ${attraction.image_url ? 
                        `<img src="${attraction.image_url}" alt="${this.escapeHtml(attraction.name)}" 
                              onerror="this.src='/images/placeholder.jpg'">` :
                        `<div class="image-placeholder">
                            <i class="fas fa-image"></i>
                        </div>`
                    }
                </div>
                
                <div class="attraction-content">
                    <div class="attraction-header">
                        <h3 class="attraction-name">${this.escapeHtml(attraction.name)}</h3>
                        <span class="attraction-status ${attraction.is_active ? 'active' : 'inactive'}">
                            ${attraction.is_active ? '启用' : '停用'}
                        </span>
                    </div>
                    
                    <p class="attraction-description">${this.escapeHtml(attraction.description || '暂无描述')}</p>
                    
                    <div class="attraction-meta">
                        <span class="meta-item">
                            <i class="fas fa-tag"></i>
                            ${attraction.category ? this.escapeHtml(attraction.category.name) : '未分类'}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-map-marker"></i>
                            ${attraction.latitude ? `${attraction.latitude}, ${attraction.longitude}` : '未设置坐标'}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(attraction.created_at)}
                        </span>
                    </div>
                    
                    <div class="attraction-actions">
                        <button class="btn btn-sm btn-outline edit-attraction-btn" 
                                data-id="${attraction.id}"
                                title="编辑景点">
                            <i class="fas fa-edit"></i>
                            编辑
                        </button>
                        
                        <button class="btn btn-sm btn-outline-danger delete-attraction-btn" 
                                data-id="${attraction.id}"
                                data-name="${this.escapeHtml(attraction.name)}"
                                title="删除景点">
                            <i class="fas fa-trash"></i>
                            删除
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // 更新分页信息
    updatePagination(totalItems) {
        const pagination = document.getElementById('attractions-pagination');
        if (!pagination) return;

        const totalPages = Math.ceil(totalItems / this.pageSize);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '<div class="pagination">';
        
        // 上一页
        if (this.currentPage > 1) {
            html += `<button class="pagination-btn" data-page="${this.currentPage - 1}">
                <i class="fas fa-chevron-left"></i>
            </button>`;
        }

        // 页码
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            html += `<button class="pagination-btn ${i === this.currentPage ? 'active' : ''}" 
                            data-page="${i}">${i}</button>`;
        }

        // 下一页
        if (this.currentPage < totalPages) {
            html += `<button class="pagination-btn" data-page="${this.currentPage + 1}">
                <i class="fas fa-chevron-right"></i>
            </button>`;
        }

        html += '</div>';
        pagination.innerHTML = html;
    }

    // 显示景点模态框
    async showAttractionModal(attractionId = null) {
        const modal = document.getElementById('attraction-modal');
        if (!modal) return;

        this.currentEditingId = attractionId;
        
        if (attractionId) {
            await this.loadAttractionData(attractionId);
        } else {
            this.resetAttractionForm();
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 隐藏景点模态框
    hideAttractionModal() {
        const modal = document.getElementById('attraction-modal');
        if (!modal) return;

        modal.classList.remove('show');
        document.body.style.overflow = '';
        this.resetAttractionForm();
    }

    // 加载景点数据
    async loadAttractionData(attractionId) {
        try {
            const result = await window.apiService.attractions.getById(attractionId);
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.fillAttractionForm(result.data);

        } catch (error) {
            console.error('加载景点数据失败:', error);
            this.showError('加载景点数据失败: ' + error.message);
        }
    }

    // 填充景点表单
    fillAttractionForm(attraction) {
        const form = document.getElementById('attraction-form');
        if (!form) return;

        form.querySelector('[name="name"]').value = attraction.name || '';
        form.querySelector('[name="description"]').value = attraction.description || '';
        form.querySelector('[name="category_id"]').value = attraction.category_id || '';
        form.querySelector('[name="latitude"]').value = attraction.latitude || '';
        form.querySelector('[name="longitude"]').value = attraction.longitude || '';
        form.querySelector('[name="address"]').value = attraction.address || '';
        form.querySelector('[name="opening_hours"]').value = attraction.opening_hours || '';
        form.querySelector('[name="ticket_price"]').value = attraction.ticket_price || '';
        form.querySelector('[name="contact_phone"]').value = attraction.contact_phone || '';
        form.querySelector('[name="website"]').value = attraction.website || '';
        form.querySelector('[name="display_order"]').value = attraction.display_order || 0;
        form.querySelector('[name="is_active"]').checked = attraction.is_active || false;
        
        // 显示当前图片
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview && attraction.image_url) {
            imagePreview.innerHTML = `
                <img src="${attraction.image_url}" alt="当前图片">
                <button type="button" class="btn-remove-image" onclick="attractionsModule.removeImage()">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }

        // 更新模态框标题
        const modalTitle = document.getElementById('attraction-modal-title');
        if (modalTitle) {
            modalTitle.textContent = '编辑景点';
        }
    }

    // 重置景点表单
    resetAttractionForm() {
        const form = document.getElementById('attraction-form');
        if (!form) return;

        form.reset();
        this.currentEditingId = null;
        
        // 清空图片预览
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }

        // 更新模态框标题
        const modalTitle = document.getElementById('attraction-modal-title');
        if (modalTitle) {
            modalTitle.textContent = '新建景点';
        }
    }

    // 处理图片上传
    async handleImageUpload(file) {
        if (!file) return;

        // 验证文件类型和大小
        const config = window.appConfig.upload.images;
        if (!config.allowedTypes.includes(file.type)) {
            this.showError('不支持的文件类型');
            return;
        }

        if (file.size > config.maxSize) {
            this.showError(`文件大小不能超过 ${config.maxSize / 1024 / 1024}MB`);
            return;
        }

        this.showLoading('上传图片中...');

        try {
            const result = await window.tencentCloudService.uploadFile(file, {
                path: 'attractions/',
                onProgress: (progress) => {
                    console.log('上传进度:', progress.percent + '%');
                }
            });

            if (!result.success) {
                throw new Error('图片上传失败');
            }

            // 更新图片预览
            const imagePreview = document.getElementById('image-preview');
            if (imagePreview) {
                imagePreview.innerHTML = `
                    <img src="${result.url}" alt="上传的图片">
                    <button type="button" class="btn-remove-image" onclick="attractionsModule.removeImage()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }

            // 保存图片URL到隐藏字段
            const imageUrlInput = document.createElement('input');
            imageUrlInput.type = 'hidden';
            imageUrlInput.name = 'image_url';
            imageUrlInput.value = result.url;
            
            const form = document.getElementById('attraction-form');
            const existingInput = form.querySelector('input[name="image_url"]');
            if (existingInput) {
                existingInput.value = result.url;
            } else {
                form.appendChild(imageUrlInput);
            }

            this.showSuccess('图片上传成功');

        } catch (error) {
            console.error('图片上传失败:', error);
            this.showError('图片上传失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // 移除图片
    removeImage() {
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }

        const form = document.getElementById('attraction-form');
        const imageUrlInput = form.querySelector('input[name="image_url"]');
        if (imageUrlInput) {
            imageUrlInput.remove();
        }

        const imageInput = document.getElementById('attraction-image');
        if (imageInput) {
            imageInput.value = '';
        }
    }

    // 保存景点
    async saveAttraction() {
        const form = document.getElementById('attraction-form');
        if (!form) return;

        const formData = new FormData(form);
        const attractionData = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            category_id: formData.get('category_id') || null,
            latitude: formData.get('latitude') ? parseFloat(formData.get('latitude')) : null,
            longitude: formData.get('longitude') ? parseFloat(formData.get('longitude')) : null,
            address: formData.get('address').trim(),
            opening_hours: formData.get('opening_hours').trim(),
            ticket_price: formData.get('ticket_price').trim(),
            contact_phone: formData.get('contact_phone').trim(),
            website: formData.get('website').trim(),
            image_url: formData.get('image_url') || null,
            display_order: parseInt(formData.get('display_order')) || 0,
            is_active: formData.get('is_active') === 'on'
        };

        // 验证表单
        if (!this.validateAttractionForm(attractionData)) {
            return;
        }

        this.showLoading('正在保存...');

        try {
            let result;
            
            if (this.currentEditingId) {
                result = await window.apiService.attractions.update(this.currentEditingId, attractionData);
            } else {
                result = await window.apiService.attractions.create(attractionData);
            }

            if (result.error) {
                throw new Error(result.error);
            }

            this.showSuccess(this.currentEditingId ? '景点更新成功' : '景点创建成功');
            this.hideAttractionModal();
            await this.loadAttractions();

        } catch (error) {
            console.error('保存景点失败:', error);
            this.showError('保存景点失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // 验证景点表单
    validateAttractionForm(data) {
        const errors = [];

        if (!data.name.trim()) {
            errors.push('景点名称不能为空');
        }

        if (data.name.length > 100) {
            errors.push('景点名称不能超过100个字符');
        }

        if (data.description.length > 500) {
            errors.push('景点描述不能超过500个字符');
        }

        if (data.latitude && data.longitude) {
            const lat = parseFloat(data.latitude);
            const lng = parseFloat(data.longitude);
            
            if (isNaN(lat) || lat < -90 || lat > 90) {
                errors.push('纬度必须在-90到90之间');
            }
            
            if (isNaN(lng) || lng < -180 || lng > 180) {
                errors.push('经度必须在-180到180之间');
            }
        }

        if (errors.length > 0) {
            this.showError(errors.join('<br>'));
            return false;
        }

        return true;
    }

    // 确认删除景点
    async confirmDeleteAttraction(attractionId, attractionName) {
        const confirmed = confirm(`确定要删除景点 "${attractionName}" 吗？此操作不可撤销。`);
        
        if (confirmed) {
            await this.deleteAttraction(attractionId);
        }
    }

    // 删除景点
    async deleteAttraction(attractionId) {
        this.showLoading('正在删除...');

        try {
            const result = await window.apiService.attractions.delete(attractionId);
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.showSuccess('景点删除成功');
            await this.loadAttractions();

        } catch (error) {
            console.error('删除景点失败:', error);
            this.showError('删除景点失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // 防抖函数
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // 显示加载状态
    showLoading(message = '加载中...') {
        // 实现加载状态显示逻辑
        const loadingEl = document.createElement('div');
        loadingEl.className = 'loading-overlay';
        loadingEl.innerHTML = `
            <div class="loading-spinner"></div>
            <p>${message}</p>
        `;
        document.body.appendChild(loadingEl);
    }

    // 隐藏加载状态
    hideLoading() {
        const loadingEl = document.querySelector('.loading-overlay');
        if (loadingEl) {
            loadingEl.remove();
        }
    }

    // 显示成功消息
    showSuccess(message) {
        // 实现成功消息显示逻辑
        console.log('Success:', message);
    }

    // 显示错误消息
    showError(message) {
        // 实现错误消息显示逻辑
        console.error('Error:', message);
    }

    // HTML转义
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 格式化日期
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-CN');
    }
}

// 初始化景点模块
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('attractions-page')) {
        window.attractionsModule = new AttractionsModule();
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AttractionsModule;
}