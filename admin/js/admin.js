// 管理后台主应用
class AdminApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.isLoading = false;
        this.pages = {
            'dashboard': 'pages/dashboard.html',
            'categories': 'pages/categories.html',
            'attractions': 'pages/attractions.html',
            'articles': 'pages/articles.html',
            'map-editor': 'pages/map-editor.html',
            'settings': 'pages/settings.html'
        };
        
        this.init();
    }

    // 初始化应用
    async init() {
        // 跳过所有权限验证，直接进入后台
        this.currentUser = {
            id: 'admin',
            email: 'admin@example.com',
            username: '管理员',
            role: 'super_admin'
        };
        
        this.setupEventListeners();
        this.loadPage('dashboard');
        this.updateUserInfo();
    }

    // 等待authService初始化 - 已禁用
    async waitForAuthService() {
        return new Promise((resolve) => {
            // 直接解析，跳过等待
            resolve();
        });
    }

    // 设置事件监听器
    setupEventListeners() {
        // 导航菜单点击
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = item.dataset.page;
                this.loadPage(page);
            });
        });

        // 退出登录
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.logout();
        });

        // 模态框关闭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || 
                e.target.dataset.dismiss === 'modal') {
                this.hideModal(e.target.closest('.modal'));
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal.show').forEach(modal => {
                    this.hideModal(modal);
                });
            }
        });
    }

    // 更新用户信息
    updateUserInfo() {
        const usernameDisplay = document.getElementById('usernameDisplay');
        const userAvatar = document.getElementById('userAvatar');
        
        if (this.currentUser) {
            usernameDisplay.textContent = this.currentUser.email || '管理员';
            userAvatar.textContent = (this.currentUser.email || 'A').charAt(0).toUpperCase();
        }
    }

    // 加载页面
    async loadPage(pageName) {
        if (this.isLoading || this.currentPage === pageName) return;
        
        this.showLoading();
        this.currentPage = pageName;

        try {
            // 更新导航状态
            this.updateNavigation(pageName);

            // 加载页面内容 - 使用XMLHttpRequest避免CORS问题
            const pagePath = this.pages[pageName];
            const content = await this.loadPageContent(pagePath);
            document.getElementById('pageContent').innerHTML = content;
            document.getElementById('pageTitle').textContent = this.getPageTitle(pageName);

            // 初始化页面特定的功能
            await this.initPageSpecificFeatures(pageName);

        } catch (error) {
            console.error('Failed to load page:', error);
            this.showError('页面加载失败');
        } finally {
            this.hideLoading();
        }
    }

    // 更新导航状态
    updateNavigation(pageName) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.page === pageName) {
                item.classList.add('active');
            }
        });
    }

    // 获取页面标题
    getPageTitle(pageName) {
        const titles = {
            'dashboard': '仪表盘',
            'categories': '分类管理',
            'attractions': '景点管理',
            'articles': '攻略文章',
            'map-editor': '地图编辑器',
            'settings': '系统设置'
        };
        return titles[pageName] || '管理后台';
    }

    // 加载页面内容 - 使用XMLHttpRequest避免CORS问题
    loadPageContent(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        resolve(xhr.responseText);
                    } else {
                        reject(new Error('Failed to load page: ' + xhr.status));
                    }
                }
            };
            xhr.send();
        });
    }

    // 初始化页面特定功能
    async initPageSpecificFeatures(pageName) {
        switch (pageName) {
            case 'dashboard':
                await this.initDashboard();
                break;
            case 'categories':
                await this.initCategories();
                break;
            case 'attractions':
                await this.initAttractions();
                break;
            case 'articles':
                await this.initArticles();
                break;
            case 'map-editor':
                await this.initMapEditor();
                break;
            case 'settings':
                await this.initSettings();
                break;
        }
    }

    // 初始化仪表盘
    async initDashboard() {
        await this.loadDashboardStats();
        this.setupDashboardEvents();
    }

    // 加载仪表盘统计
    async loadDashboardStats() {
        try {
            // 获取分类数量
            const { count: categoryCount } = await supabase
                .from('categories')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);

            // 获取景点数量
            const { count: attractionCount } = await supabase
                .from('attractions')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);

            // 获取文章数量
            const { count: articleCount } = await supabase
                .from('articles')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'published');

            // 更新统计显示
            document.getElementById('totalCategories').textContent = categoryCount || 0;
            document.getElementById('totalAttractions').textContent = attractionCount || 0;
            document.getElementById('totalArticles').textContent = articleCount || 0;

        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }

    // 设置仪表盘事件
    setupDashboardEvents() {
        // 快速操作按钮
        document.querySelectorAll('.quick-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    }

    // 处理快速操作
    handleQuickAction(action) {
        switch (action) {
            case 'create-article':
                this.loadPage('articles');
                setTimeout(() => {
                    document.getElementById('createArticleBtn')?.click();
                }, 100);
                break;
            case 'create-attraction':
                this.loadPage('attractions');
                setTimeout(() => {
                    document.getElementById('createAttractionBtn')?.click();
                }, 100);
                break;
            case 'open-map-editor':
                this.loadPage('map-editor');
                break;
        }
    }

    // 初始化分类管理
    async initCategories() {
        await this.loadCategories();
        this.setupCategoriesEvents();
    }

    // 加载分类数据
    async loadCategories() {
        try {
            const { data: categories, error } = await supabase
                .from('categories')
                .select('*')
                .order('sort_order', { ascending: true });

            if (error) throw error;

            this.renderCategoriesTable(categories || []);

        } catch (error) {
            console.error('Failed to load categories:', error);
            this.showError('加载分类失败');
        }
    }

    // 渲染分类表格
    renderCategoriesTable(categories) {
        const tbody = document.getElementById('categoriesTable');
        
        if (categories.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">暂无分类数据</td>
                </tr>
            `;
            return;
        }

        tbody.innerHTML = categories.map(category => `
            <tr>
                <td>${category.name}</td>
                <td>${category.icon || '📁'}</td>
                <td>${category.description || '-'}</td>
                <td>${category.sort_order}</td>
                <td>
                    <span class="status-badge ${category.is_active ? 'active' : 'inactive'}">
                        ${category.is_active ? '启用' : '禁用'}
                    </span>
                </td>
                <td>${new Date(category.created_at).toLocaleDateString()}</td>
                <td>
                    <button class="btn btn-sm btn-primary" data-action="edit" data-id="${category.id}">编辑</button>
                    <button class="btn btn-sm btn-danger" data-action="delete" data-id="${category.id}">删除</button>
                </td>
            </tr>
        `).join('');
    }

    // 设置分类事件
    setupCategoriesEvents() {
        // 新建分类按钮
        document.getElementById('createCategoryBtn').addEventListener('click', () => {
            this.showCategoryModal();
        });

        // 表格操作按钮
        document.getElementById('categoriesTable').addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'edit') {
                this.editCategory(id);
            } else if (action === 'delete') {
                this.deleteCategory(id);
            }
        });

        // 保存分类表单
        document.getElementById('saveCategoryBtn').addEventListener('click', () => {
            this.saveCategory();
        });
    }

    // 显示分类模态框
    showCategoryModal(category = null) {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        
        if (category) {
            title.textContent = '编辑分类';
            this.fillCategoryForm(category);
        } else {
            title.textContent = '新建分类';
            this.resetCategoryForm();
        }

        this.showModal(modal);
    }

    // 填充分类表单
    fillCategoryForm(category) {
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryIcon').value = category.icon || '';
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categorySortOrder').value = category.sort_order;
        document.getElementById('categoryStatus').value = category.is_active.toString();
    }

    // 重置分类表单
    resetCategoryForm() {
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
        document.getElementById('categorySortOrder').value = '0';
        document.getElementById('categoryStatus').value = 'true';
    }

    // 编辑分类
    async editCategory(id) {
        try {
            const { data: category, error } = await supabase
                .from('categories')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            this.showCategoryModal(category);

        } catch (error) {
            console.error('Failed to load category:', error);
            this.showError('加载分类失败');
        }
    }

    // 保存分类
    async saveCategory() {
        const formData = {
            name: document.getElementById('categoryName').value,
            icon: document.getElementById('categoryIcon').value,
            description: document.getElementById('categoryDescription').value,
            sort_order: parseInt(document.getElementById('categorySortOrder').value),
            is_active: document.getElementById('categoryStatus').value === 'true'
        };

        const id = document.getElementById('categoryId').value;

        try {
            let error;
            if (id) {
                // 更新分类
                const { error: updateError } = await supabase
                    .from('categories')
                    .update(formData)
                    .eq('id', id);
                error = updateError;
            } else {
                // 新建分类
                const { error: insertError } = await supabase
                    .from('categories')
                    .insert([formData]);
                error = insertError;
            }

            if (error) throw error;

            this.hideModal(document.getElementById('categoryModal'));
            this.showSuccess(id ? '分类更新成功' : '分类创建成功');
            await this.loadCategories();

        } catch (error) {
            console.error('Failed to save category:', error);
            this.showError('保存分类失败');
        }
    }

    // 删除分类
    async deleteCategory(id) {
        if (!confirm('确定要删除这个分类吗？此操作不可恢复。')) return;

        try {
            const { error } = await supabase
                .from('categories')
                .delete()
                .eq('id', id);

            if (error) throw error;

            this.showSuccess('分类删除成功');
            await this.loadCategories();

        } catch (error) {
            console.error('Failed to delete category:', error);
            this.showError('删除分类失败');
        }
    }

    // 初始化景点管理
    async initAttractions() {
        await this.loadAttractions();
        this.setupAttractionsEvents();
    }

    // 加载景点数据
    async loadAttractions() {
        // 实现景点数据加载
        console.log('Loading attractions...');
    }

    // 设置景点事件
    setupAttractionsEvents() {
        // 实现景点事件设置
        console.log('Setting up attractions events...');
    }

    // 初始化文章管理
    async initArticles() {
        await this.loadArticles();
        this.setupArticlesEvents();
    }

    // 加载文章数据
    async loadArticles() {
        // 实现文章数据加载
        console.log('Loading articles...');
    }

    // 设置文章事件
    setupArticlesEvents() {
        // 实现文章事件设置
        console.log('Setting up articles events...');
    }

    // 初始化地图编辑器
    async initMapEditor() {
        await this.loadMapData();
        this.setupMapEditorEvents();
    }

    // 加载地图数据
    async loadMapData() {
        // 实现地图数据加载
        console.log('Loading map data...');
    }

    // 设置地图编辑器事件
    setupMapEditorEvents() {
        // 实现地图编辑器事件设置
        console.log('Setting up map editor events...');
    }

    // 初始化系统设置
    async initSettings() {
        await this.loadSettings();
        this.setupSettingsEvents();
    }

    // 加载设置数据
    async loadSettings() {
        // 实现设置数据加载
        console.log('Loading settings...');
    }

    // 设置设置事件
    setupSettingsEvents() {
        // 实现设置事件设置
        console.log('Setting up settings events...');
    }

    // 退出登录
    async logout() {
        // 直接重定向到当前页面，实现"刷新"效果
        window.location.reload();
    }

    // 显示模态框
    showModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // 隐藏模态框
    hideModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // 显示加载状态
    showLoading() {
        this.isLoading = true;
        document.getElementById('loadingOverlay').classList.add('show');
    }

    // 隐藏加载状态
    hideLoading() {
        this.isLoading = false;
        document.getElementById('loadingOverlay').classList.remove('show');
    }

    // 显示成功消息
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // 显示错误消息
    showError(message) {
        this.showNotification(message, 'error');
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        // 自动移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);

        // 点击关闭
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
}

// 添加通知样式
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 4000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 350px;
}

.notification.show {
    transform: translateX(0);
}

.notification-content {
    background: white;
    border-radius: 8px;
    padding: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 12px;
}

.notification-success .notification-content {
    border-left: 4px solid #10ac84;
}

.notification-error .notification-content {
    border-left: 4px solid #ee5253;
}

.notification-info .notification-content {
    border-left: 4px solid #2e86de;
}

.notification-message {
    flex: 1;
    color: #212529;
}

.notification-close {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    color: #6c757d;
}

.notification-close:hover {
    color: #212529;
}
`;

// 注入通知样式
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
});