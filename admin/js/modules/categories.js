// 分类管理模块
class CategoriesModule {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.searchTerm = '';
        this.sortField = 'created_at';
        this.sortOrder = 'desc';
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('categories-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.searchTerm = searchInput.value.trim();
                this.loadCategories();
            }, 300));
        }

        // 排序功能
        const sortSelect = document.getElementById('categories-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const [field, order] = sortSelect.value.split('_');
                this.sortField = field;
                this.sortOrder = order;
                this.loadCategories();
            });
        }

        // 分页功能
        document.addEventListener('click', (e) => {
            if (e.target.closest('.pagination-btn')) {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    this.currentPage = page;
                    this.loadCategories();
                }
            }
        });

        // 新建分类
        const newCategoryBtn = document.getElementById('new-category-btn');
        if (newCategoryBtn) {
            newCategoryBtn.addEventListener('click', () => {
                this.showCategoryModal();
            });
        }

        // 编辑分类
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-category-btn');
            if (editBtn) {
                const categoryId = editBtn.dataset.id;
                this.showCategoryModal(categoryId);
            }
        });

        // 删除分类
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-category-btn');
            if (deleteBtn) {
                const categoryId = deleteBtn.dataset.id;
                const categoryName = deleteBtn.dataset.name;
                this.confirmDeleteCategory(categoryId, categoryName);
            }
        });

        // 模态框事件
        this.bindModalEvents();
    }

    // 绑定模态框事件
    bindModalEvents() {
        const modal = document.getElementById('category-modal');
        if (!modal) return;

        // 关闭模态框
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close') || e.target === modal) {
                this.hideCategoryModal();
            }
        });

        // 保存分类
        const saveBtn = document.getElementById('save-category-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveCategory();
            });
        }

        // 表单提交
        const form = document.getElementById('category-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveCategory();
            });
        }
    }

    // 加载分类列表
    async loadCategories() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();

        try {
            const result = await window.apiService.categories.getAll({
                activeOnly: false,
                orderBy: this.sortField,
                ascending: this.sortOrder === 'asc'
            });

            if (result.error) {
                throw new Error(result.error);
            }

            this.renderCategories(result.data || []);
            this.updatePagination(result.data.length);

        } catch (error) {
            console.error('加载分类失败:', error);
            this.showError('加载分类失败: ' + error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // 渲染分类列表
    renderCategories(categories) {
        const container = document.getElementById('categories-container');
        if (!container) return;

        if (categories.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>暂无分类数据</p>
                    <button class="btn btn-primary" id="new-category-empty-btn">
                        创建第一个分类
                    </button>
                </div>
            `;
            
            // 绑定空状态的创建按钮
            const btn = document.getElementById('new-category-empty-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.showCategoryModal();
                });
            }
            
            return;
        }

        const html = categories.map(category => `
            <div class="category-card" data-id="${category.id}">
                <div class="category-header">
                    <h3 class="category-name">${this.escapeHtml(category.name)}</h3>
                    <span class="category-status ${category.is_active ? 'active' : 'inactive'}">
                        ${category.is_active ? '启用' : '停用'}
                    </span>
                </div>
                
                <div class="category-body">
                    <p class="category-description">${this.escapeHtml(category.description || '暂无描述')}</p>
                    
                    <div class="category-meta">
                        <span class="meta-item">
                            <i class="fas fa-sort-numeric-down"></i>
                            排序: ${category.display_order || 0}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(category.created_at)}
                        </span>
                    </div>
                </div>
                
                <div class="category-actions">
                    <button class="btn btn-sm btn-outline edit-category-btn" 
                            data-id="${category.id}"
                            title="编辑分类">
                        <i class="fas fa-edit"></i>
                        编辑
                    </button>
                    
                    <button class="btn btn-sm btn-outline-danger delete-category-btn" 
                            data-id="${category.id}"
                            data-name="${this.escapeHtml(category.name)}"
                            title="删除分类">
                        <i class="fas fa-trash"></i>
                        删除
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // 更新分页信息
    updatePagination(totalItems) {
        const pagination = document.getElementById('categories-pagination');
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

    // 显示分类模态框
    async showCategoryModal(categoryId = null) {
        const modal = document.getElementById('category-modal');
        if (!modal) return;

        this.currentEditingId = categoryId;
        
        if (categoryId) {
            await this.loadCategoryData(categoryId);
        } else {
            this.resetCategoryForm();
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 隐藏分类模态框
    hideCategoryModal() {
        const modal = document.getElementById('category-modal');
        if (!modal) return;

        modal.classList.remove('show');
        document.body.style.overflow = '';
        this.resetCategoryForm();
    }

    // 加载分类数据
    async loadCategoryData(categoryId) {
        try {
            const result = await window.apiService.categories.getById(categoryId);
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.fillCategoryForm(result.data);

        } catch (error) {
            console.error('加载分类数据失败:', error);
            this.showError('加载分类数据失败: ' + error.message);
        }
    }

    // 填充分类表单
    fillCategoryForm(category) {
        const form = document.getElementById('category-form');
        if (!form) return;

        form.querySelector('[name="name"]').value = category.name || '';
        form.querySelector('[name="description"]').value = category.description || '';
        form.querySelector('[name="display_order"]').value = category.display_order || 0;
        form.querySelector('[name="is_active"]').checked = category.is_active || false;
        
        // 更新模态框标题
        const modalTitle = document.getElementById('category-modal-title');
        if (modalTitle) {
            modalTitle.textContent = '编辑分类';
        }
    }

    // 重置分类表单
    resetCategoryForm() {
        const form = document.getElementById('category-form');
        if (!form) return;

        form.reset();
        this.currentEditingId = null;
        
        // 更新模态框标题
        const modalTitle = document.getElementById('category-modal-title');
        if (modalTitle) {
            modalTitle.textContent = '新建分类';
        }
    }

    // 保存分类
    async saveCategory() {
        const form = document.getElementById('category-form');
        if (!form) return;

        const formData = new FormData(form);
        const categoryData = {
            name: formData.get('name').trim(),
            description: formData.get('description').trim(),
            display_order: parseInt(formData.get('display_order')) || 0,
            is_active: formData.get('is_active') === 'on'
        };

        // 验证表单
        if (!this.validateCategoryForm(categoryData)) {
            return;
        }

        this.showLoading('正在保存...');

        try {
            let result;
            
            if (this.currentEditingId) {
                result = await window.apiService.categories.update(this.currentEditingId, categoryData);
            } else {
                result = await window.apiService.categories.create(categoryData);
            }

            if (result.error) {
                throw new Error(result.error);
            }

            this.showSuccess(this.currentEditingId ? '分类更新成功' : '分类创建成功');
            this.hideCategoryModal();
            await this.loadCategories();

        } catch (error) {
            console.error('保存分类失败:', error);
            this.showError('保存分类失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // 验证分类表单
    validateCategoryForm(data) {
        const errors = [];

        if (!data.name.trim()) {
            errors.push('分类名称不能为空');
        }

        if (data.name.length > 50) {
            errors.push('分类名称不能超过50个字符');
        }

        if (data.description.length > 200) {
            errors.push('分类描述不能超过200个字符');
        }

        if (errors.length > 0) {
            this.showError(errors.join('<br>'));
            return false;
        }

        return true;
    }

    // 确认删除分类
    async confirmDeleteCategory(categoryId, categoryName) {
        const confirmed = confirm(`确定要删除分类 "${categoryName}" 吗？此操作不可撤销。`);
        
        if (confirmed) {
            await this.deleteCategory(categoryId);
        }
    }

    // 删除分类
    async deleteCategory(categoryId) {
        this.showLoading('正在删除...');

        try {
            const result = await window.apiService.categories.delete(categoryId);
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.showSuccess('分类删除成功');
            await this.loadCategories();

        } catch (error) {
            console.error('删除分类失败:', error);
            this.showError('删除分类失败: ' + error.message);
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

// 初始化分类模块
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('categories-page')) {
        window.categoriesModule = new CategoriesModule();
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoriesModule;
}