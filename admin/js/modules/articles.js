// 文章管理模块
class ArticlesModule {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.searchTerm = '';
        this.categoryFilter = '';
        this.statusFilter = '';
        this.sortField = 'created_at';
        this.sortOrder = 'desc';
        this.isLoading = false;
        this.categories = [];
        
        this.init();
    }

    async init() {
        await this.loadCategories();
        await this.loadArticles();
        this.bindEvents();
    }

    // 绑定事件
    bindEvents() {
        // 搜索功能
        const searchInput = document.getElementById('articles-search');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.searchTerm = searchInput.value.trim();
                this.loadArticles();
            }, 300));
        }

        // 分类筛选
        const categorySelect = document.getElementById('articles-category');
        if (categorySelect) {
            categorySelect.addEventListener('change', () => {
                this.categoryFilter = categorySelect.value;
                this.loadArticles();
            });
        }

        // 状态筛选
        const statusSelect = document.getElementById('articles-status');
        if (statusSelect) {
            statusSelect.addEventListener('change', () => {
                this.statusFilter = statusSelect.value;
                this.loadArticles();
            });
        }

        // 排序功能
        const sortSelect = document.getElementById('articles-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const [field, order] = sortSelect.value.split('_');
                this.sortField = field;
                this.sortOrder = order;
                this.loadArticles();
            });
        }

        // 分页功能
        document.addEventListener('click', (e) => {
            if (e.target.closest('.pagination-btn')) {
                const page = parseInt(e.target.dataset.page);
                if (!isNaN(page)) {
                    this.currentPage = page;
                    this.loadArticles();
                }
            }
        });

        // 新建文章
        const newArticleBtn = document.getElementById('new-article-btn');
        if (newArticleBtn) {
            newArticleBtn.addEventListener('click', () => {
                this.showArticleModal();
            });
        }

        // 编辑文章
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-article-btn');
            if (editBtn) {
                const articleId = editBtn.dataset.id;
                this.showArticleModal(articleId);
            }
        });

        // 删除文章
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-article-btn');
            if (deleteBtn) {
                const articleId = deleteBtn.dataset.id;
                const articleTitle = deleteBtn.dataset.title;
                this.confirmDeleteArticle(articleId, articleTitle);
            }
        });

        // 发布/取消发布
        document.addEventListener('click', (e) => {
            const toggleBtn = e.target.closest('.toggle-status-btn');
            if (toggleBtn) {
                const articleId = toggleBtn.dataset.id;
                const currentStatus = toggleBtn.dataset.status;
                const newStatus = currentStatus === 'published' ? 'draft' : 'published';
                this.toggleArticleStatus(articleId, newStatus);
            }
        });

        // 模态框事件
        this.bindModalEvents();
    }

    // 绑定模态框事件
    bindModalEvents() {
        const modal = document.getElementById('article-modal');
        if (!modal) return;

        // 关闭模态框
        modal.addEventListener('click', (e) => {
            if (e.target.closest('.modal-close') || e.target === modal) {
                this.hideArticleModal();
            }
        });

        // 保存文章
        const saveBtn = document.getElementById('save-article-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveArticle();
            });
        }

        // 表单提交
        const form = document.getElementById('article-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveArticle();
            });
        }

        // 图片上传
        const imageInput = document.getElementById('article-image');
        if (imageInput) {
            imageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e.target.files[0]);
            });
        }

        // 富文本编辑器初始化
        this.initEditor();
    }

    // 初始化富文本编辑器
    initEditor() {
        const contentTextarea = document.getElementById('article-content');
        if (!contentTextarea) return;

        // 简单的富文本编辑器实现
        // 实际项目中可以使用专业的编辑器如Quill、TinyMCE等
        const editorContainer = document.createElement('div');
        editorContainer.className = 'article-editor';
        
        const toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';
        toolbar.innerHTML = `
            <button type="button" class="editor-btn" data-command="bold"><i class="fas fa-bold"></i></button>
            <button type="button" class="editor-btn" data-command="italic"><i class="fas fa-italic"></i></button>
            <button type="button" class="editor-btn" data-command="underline"><i class="fas fa-underline"></i></button>
            <button type="button" class="editor-btn" data-command="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
            <button type="button" class="editor-btn" data-command="insertOrderedList"><i class="fas fa-list-ol"></i></button>
            <button type="button" class="editor-btn" data-command="createLink"><i class="fas fa-link"></i></button>
        `;

        const editor = document.createElement('div');
        editor.className = 'editor-content';
        editor.contentEditable = true;
        editor.innerHTML = contentTextarea.value;

        // 替换textarea
        contentTextarea.parentNode.insertBefore(editorContainer, contentTextarea);
        editorContainer.appendChild(toolbar);
        editorContainer.appendChild(editor);
        contentTextarea.style.display = 'none';

        // 绑定工具栏事件
        toolbar.addEventListener('click', (e) => {
            const btn = e.target.closest('.editor-btn');
            if (btn) {
                const command = btn.dataset.command;
                this.execEditorCommand(command);
            }
        });

        // 同步内容到textarea
        editor.addEventListener('input', () => {
            contentTextarea.value = editor.innerHTML;
        });

        this.editor = editor;
    }

    // 执行编辑器命令
    execEditorCommand(command) {
        if (!this.editor) return;

        this.editor.focus();
        
        switch (command) {
            case 'createLink':
                const url = prompt('请输入链接地址:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
                break;
            default:
                document.execCommand(command, false, null);
                break;
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
        const select = document.getElementById('articles-category');
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

    // 加载文章列表
    async loadArticles() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();

        try {
            const result = await window.apiService.articles.getAll({
                categoryId: this.categoryFilter || undefined,
                status: this.statusFilter || undefined,
                orderBy: this.sortField,
                ascending: this.sortOrder === 'asc'
            });

            if (result.error) {
                throw new Error(result.error);
            }

            this.renderArticles(result.data || []);
            this.updatePagination(result.data.length);

        } catch (error) {
            console.error('加载文章失败:', error);
            this.showError('加载文章失败: ' + error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // 渲染文章列表
    renderArticles(articles) {
        const container = document.getElementById('articles-container');
        if (!container) return;

        if (articles.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>暂无文章数据</p>
                    <button class="btn btn-primary" id="new-article-empty-btn">
                        创建第一篇文章
                    </button>
                </div>
            `;
            
            // 绑定空状态的创建按钮
            const btn = document.getElementById('new-article-empty-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    this.showArticleModal();
                });
            }
            
            return;
        }

        const html = articles.map(article => `
            <div class="article-card" data-id="${article.id}">
                <div class="article-image">
                    ${article.image_url ? 
                        `<img src="${article.image_url}" alt="${this.escapeHtml(article.title)}" 
                              onerror="this.src='/images/placeholder.jpg'">` :
                        `<div class="image-placeholder">
                            <i class="fas fa-image"></i>
                        </div>`
                    }
                </div>
                
                <div class="article-content">
                    <div class="article-header">
                        <h3 class="article-title">${this.escapeHtml(article.title)}</h3>
                        <span class="article-status ${article.status}">
                            ${this.getStatusText(article.status)}
                        </span>
                    </div>
                    
                    <div class="article-meta">
                        <span class="meta-item">
                            <i class="fas fa-tag"></i>
                            ${article.category ? this.escapeHtml(article.category.name) : '未分类'}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-user"></i>
                            ${article.author ? this.escapeHtml(article.author.full_name || article.author.username) : '未知作者'}
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-eye"></i>
                            ${article.view_count || 0} 阅读
                        </span>
                        <span class="meta-item">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(article.created_at)}
                        </span>
                    </div>
                    
                    <p class="article-excerpt">${this.escapeHtml(this.getExcerpt(article.content))}</p>
                    
                    <div class="article-actions">
                        <button class="btn btn-sm btn-outline edit-article-btn" 
                                data-id="${article.id}"
                                title="编辑文章">
                            <i class="fas fa-edit"></i>
                            编辑
                        </button>
                        
                        <button class="btn btn-sm ${article.status === 'published' ? 'btn-warning' : 'btn-success'} toggle-status-btn" 
                                data-id="${article.id}"
                                data-status="${article.status}"
                                data-title="${this.escapeHtml(article.title)}"
                                title="${article.status === 'published' ? '取消发布' : '发布文章'}">
                            <i class="fas ${article.status === 'published' ? 'fa-eye-slash' : 'fa-eye'}"></i>
                            ${article.status === 'published' ? '取消发布' : '发布'}
                        </button>
                        
                        <button class="btn btn-sm btn-outline-danger delete-article-btn" 
                                data-id="${article.id}"
                                data-title="${this.escapeHtml(article.title)}"
                                title="删除文章">
                            <i class="fas fa-trash"></i>
                            删除
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            draft: '草稿',
            published: '已发布',
            archived: '已归档'
        };
        return statusMap[status] || status;
    }

    // 获取文章摘要
    getExcerpt(content, length = 100) {
        if (!content) return '暂无内容';
        
        // 移除HTML标签
        const text = content.replace(/<[^>]*>/g, '');
        
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }

    // 更新分页信息
    updatePagination(totalItems) {
        const pagination = document.getElementById('articles-pagination');
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

    // 显示文章模态框
    async showArticleModal(articleId = null) {
        const modal = document.getElementById('article-modal');
        if (!modal) return;

        this.currentEditingId = articleId;
        
        if (articleId) {
            await this.loadArticleData(articleId);
        } else {
            this.resetArticleForm();
        }

        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 隐藏文章模态框
    hideArticleModal() {
        const modal = document.getElementById('article-modal');
        if (!modal) return;

        modal.classList.remove('show');
        document.body.style.overflow = '';
        this.resetArticleForm();
    }

    // 加载文章数据
    async loadArticleData(articleId) {
        try {
            const result = await window.apiService.articles.getById(articleId);
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.fillArticleForm(result.data);

        } catch (error) {
            console.error('加载文章数据失败:', error);
            this.showError('加载文章数据失败: ' + error.message);
        }
    }

    // 填充文章表单
    fillArticleForm(article) {
        const form = document.getElementById('article-form');
        if (!form) return;

        form.querySelector('[name="title"]').value = article.title || '';
        form.querySelector('[name="content"]').value = article.content || '';
        form.querySelector('[name="category_id"]').value = article.category_id || '';
        form.querySelector('[name="status"]').value = article.status || 'draft';
        form.querySelector('[name="display_order"]').value = article.display_order || 0;
        
        // 更新富文本编辑器内容
        if (this.editor) {
            this.editor.innerHTML = article.content || '';
        }

        // 显示当前图片
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview && article.image_url) {
            imagePreview.innerHTML = `
                <img src="${article.image_url}" alt="当前图片">
                <button type="button" class="btn-remove-image" onclick="articlesModule.removeImage()">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }

        // 更新模态框标题
        const modalTitle = document.getElementById('article-modal-title');
        if (modalTitle) {
            modalTitle.textContent = '编辑文章';
        }
    }

    // 重置文章表单
    resetArticleForm() {
        const form = document.getElementById('article-form');
        if (!form) return;

        form.reset();
        this.currentEditingId = null;
        
        // 清空富文本编辑器
        if (this.editor) {
            this.editor.innerHTML = '';
        }

        // 清空图片预览
        const imagePreview = document.getElementById('image-preview');
        if (imagePreview) {
            imagePreview.innerHTML = '';
        }

        // 更新模态框标题
        const modalTitle = document.getElementById('article-modal-title');
        if (modalTitle) {
            modalTitle.textContent = '新建文章';
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
                path: 'articles/',
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
                    <button type="button" class="btn-remove-image" onclick="articlesModule.removeImage()">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }

            // 保存图片URL到隐藏字段
            const imageUrlInput = document.createElement('input');
            imageUrlInput.type = 'hidden';
            imageUrlInput.name = 'image_url';
            imageUrlInput.value = result.url;
            
            const form = document.getElementById('article-form');
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

        const form = document.getElementById('article-form');
        const imageUrlInput = form.querySelector('input[name="image_url"]');
        if (imageUrlInput) {
            imageUrlInput.remove();
        }

        const imageInput = document.getElementById('article-image');
        if (imageInput) {
            imageInput.value = '';
        }
    }

    // 保存文章
    async saveArticle() {
        const form = document.getElementById('article-form');
        if (!form) return;

        const formData = new FormData(form);
        const articleData = {
            title: formData.get('title').trim(),
            content: formData.get('content').trim(),
            category_id: formData.get('category_id') || null,
            image_url: formData.get('image_url') || null,
            status: formData.get('status') || 'draft',
            display_order: parseInt(formData.get('display_order')) || 0
        };

        // 验证表单
        if (!this.validateArticleForm(articleData)) {
            return;
        }

        this.showLoading('正在保存...');

        try {
            let result;
            
            if (this.currentEditingId) {
                result = await window.apiService.articles.update(this.currentEditingId, articleData);
            } else {
                result = await window.apiService.articles.create(articleData);
            }

            if (result.error) {
                throw new Error(result.error);
            }

            this.showSuccess(this.currentEditingId ? '文章更新成功' : '文章创建成功');
            this.hideArticleModal();
            await this.loadArticles();

        } catch (error) {
            console.error('保存文章失败:', error);
            this.showError('保存文章失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // 验证文章表单
    validateArticleForm(data) {
        const errors = [];

        if (!data.title.trim()) {
            errors.push('文章标题不能为空');
        }

        if (data.title.length > 200) {
            errors.push('文章标题不能超过200个字符');
        }

        if (!data.content.trim()) {
            errors.push('文章内容不能为空');
        }

        if (errors.length > 0) {
            this.showError(errors.join('<br>'));
            return false;
        }

        return true;
    }

    // 切换文章状态
    async toggleArticleStatus(articleId, newStatus) {
        this.showLoading('正在更新状态...');

        try {
            const result = await window.apiService.articles.update(articleId, {
                status: newStatus
            });

            if (result.error) {
                throw new Error(result.error);
            }

            this.showSuccess(`文章已${newStatus === 'published' ? '发布' : '转为草稿'}`);
            await this.loadArticles();

        } catch (error) {
            console.error('更新文章状态失败:', error);
            this.showError('更新文章状态失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // 确认删除文章
    async confirmDeleteArticle(articleId, articleTitle) {
        const confirmed = confirm(`确定要删除文章 "${articleTitle}" 吗？此操作不可撤销。`);
        
        if (confirmed) {
            await this.deleteArticle(articleId);
        }
    }

    // 删除文章
    async deleteArticle(articleId) {
        this.showLoading('正在删除...');

        try {
            const result = await window.apiService.articles.delete(articleId);
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.showSuccess('文章删除成功');
            await this.loadArticles();

        } catch (error) {
            console.error('删除文章失败:', error);
            this.showError('删除文章失败: ' + error.message);
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

// 初始化文章模块
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('articles-page')) {
        window.articlesModule = new ArticlesModule();
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ArticlesModule;
}