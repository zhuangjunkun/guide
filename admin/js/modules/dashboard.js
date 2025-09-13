// 仪表板模块
class DashboardModule {
    constructor() {
        this.stats = {
            categories: 0,
            attractions: 0,
            articles: 0,
            markers: 0
        };
        
        this.init();
    }

    async init() {
        await this.loadStats();
        this.renderStats();
        this.bindEvents();
        this.startAutoRefresh();
    }

    // 加载统计数据
    async loadStats() {
        try {
            const [
                categoriesResult,
                attractionsResult,
                articlesResult,
                markersResult
            ] = await Promise.all([
                window.apiService.categories.getStats(),
                window.apiService.attractions.getStats(),
                window.apiService.articles.getStats(),
                window.apiService.mapMarkers.getAll()
            ]);

            this.stats = {
                categories: categoriesResult.count || 0,
                attractions: attractionsResult.count || 0,
                articles: articlesResult.count || 0,
                markers: markersResult.data ? markersResult.data.length : 0
            };

        } catch (error) {
            console.error('加载统计数据失败:', error);
            this.showError('加载统计数据失败');
        }
    }

    // 渲染统计数据
    renderStats() {
        this.renderStatCard('categories', this.stats.categories, '分类', 'fas fa-folder');
        this.renderStatCard('attractions', this.stats.attractions, '景点', 'fas fa-map-marker-alt');
        this.renderStatCard('articles', this.stats.articles, '文章', 'fas fa-file-alt');
        this.renderStatCard('markers', this.stats.markers, '地图标记', 'fas fa-map-pin');
    }

    // 渲染统计卡片
    renderStatCard(id, count, title, icon) {
        const card = document.getElementById(`${id}-card`);
        if (!card) return;

        card.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="stat-content">
                    <div class="stat-number">${count}</div>
                    <div class="stat-title">${title}</div>
                </div>
            </div>
        `;
    }

    // 绑定事件
    bindEvents() {
        // 刷新按钮
        const refreshBtn = document.getElementById('refresh-stats-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshStats();
            });
        }

        // 快速操作按钮
        document.addEventListener('click', (e) => {
            const quickActionBtn = e.target.closest('.quick-action-btn');
            if (quickActionBtn) {
                const action = quickActionBtn.dataset.action;
                this.handleQuickAction(action);
            }
        });
    }

    // 处理快速操作
    handleQuickAction(action) {
        const actions = {
            'new-category': () => this.navigateTo('categories'),
            'new-attraction': () => this.navigateTo('attractions'),
            'new-article': () => this.navigateTo('articles'),
            'edit-map': () => this.navigateTo('map-editor')
        };

        if (actions[action]) {
            actions[action]();
        }
    }

    // 导航到页面
    navigateTo(page) {
        if (window.adminApp) {
            window.adminApp.navigateTo(page);
        }
    }

    // 刷新统计数据
    async refreshStats() {
        this.showLoading('正在刷新数据...');
        
        try {
            await this.loadStats();
            this.renderStats();
            this.showSuccess('数据刷新成功');
        } catch (error) {
            console.error('刷新数据失败:', error);
            this.showError('刷新数据失败');
        } finally {
            this.hideLoading();
        }
    }

    // 启动自动刷新
    startAutoRefresh() {
        // 每5分钟自动刷新一次数据
        setInterval(() => {
            this.refreshStats();
        }, 5 * 60 * 1000);
    }

    // 工具函数
    showLoading(message) {
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
}

// 初始化仪表板模块
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('dashboard-page')) {
        window.dashboardModule = new DashboardModule();
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DashboardModule;
}