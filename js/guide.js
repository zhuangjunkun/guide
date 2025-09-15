// 攻略页面逻辑
class GuideApp {
    constructor() {
        this.articles = [];
        this.page = 1;
        this.pageSize = 10;
        this.loading = false;
        
        this.init();
    }

    async init() {
        await this.getData()
        this.bindEvents();
        // this.loadMockData();
        this.renderArticles();
    }
    async getData(){
        const response = await ArticleService.getAll();
        if (response.success && response.data) {
            this.articles = response.data;
        }
    }
    bindEvents() {
        // 搜索功能
        const searchIcon = document.querySelector('.header-search');
        if (searchIcon) {
            searchIcon.addEventListener('click', () => {
                this.showSearchDialog();
            });
        }

        // 无限滚动
        window.addEventListener('scroll', Utils.throttle(() => {
            if (this.isNearBottom() && !this.loading) {
                this.loadMore();
            }
        }, 200));
    }

    // 模拟数据
    loadMockData() {
        this.articles = [
            {
                id: 1,
                title: '西湖十景完整攻略，带你领略杭州最美风光',
                summary: '西湖作为杭州的标志性景点，拥有着千年的历史文化底蕴。本攻略将带你游遍西湖十景，感受江南水乡的独特魅力...',
                category: 'scenic',
                image: 'https://picsum.photos/400/200?random=1',
                date: '2024-01-15',
                views: 1250,
                likes: 89
            },
            {
                id: 2,
                title: '杭州美食地图：本地人推荐的10家必吃餐厅',
                summary: '作为一个地道的杭州人，今天为大家推荐10家藏在街头巷尾的美食店铺，每一家都有着独特的味道和故事...',
                category: 'food',
                image: 'https://picsum.photos/400/200?random=2',
                date: '2024-01-14',
                views: 2100,
                likes: 156
            },
            {
                id: 3,
                title: '杭州精品民宿推荐，体验不一样的住宿感受',
                summary: '厌倦了千篇一律的酒店？这些精心挑选的民宿将给你带来全新的住宿体验，每一间都有着独特的设计理念...',
                category: 'hotel',
                image: 'https://picsum.photos/400/200?random=3',
                date: '2024-01-13',
                views: 890,
                likes: 67
            },
            {
                id: 4,
                title: '河坊街购物攻略：传统与现代的完美融合',
                summary: '河坊街是杭州最具特色的商业街之一，这里既有传统的手工艺品，也有现代的时尚商品，是购物的绝佳去处...',
                category: 'shopping',
                image: 'https://picsum.photos/400/200?random=4',
                date: '2024-01-12',
                views: 1560,
                likes: 98
            },
            {
                id: 5,
                title: '宋城千古情：穿越时空的文化之旅',
                summary: '宋城千古情是杭州必看的演出之一，通过精彩的表演和先进的舞台技术，为观众呈现了一场视觉盛宴...',
                category: 'culture',
                image: 'https://picsum.photos/400/200?random=5',
                date: '2024-01-11',
                views: 1890,
                likes: 134
            },
            {
                id: 6,
                title: '灵隐寺祈福指南：心灵的净化之旅',
                summary: '灵隐寺是杭州最著名的佛教寺院，这里不仅有着悠久的历史，更是心灵净化的圣地。本文将为你详细介绍参观攻略...',
                category: 'culture',
                image: 'https://picsum.photos/400/200?random=6',
                date: '2024-01-10',
                views: 1340,
                likes: 87
            },
            {
                id: 7,
                title: '千岛湖一日游攻略：山水画卷中的诗意之旅',
                summary: '千岛湖以其秀美的湖光山色闻名，是杭州周边最受欢迎的旅游目的地之一。本攻略为你规划完美的一日游路线...',
                category: 'scenic',
                image: 'https://picsum.photos/400/200?random=7',
                date: '2024-01-09',
                views: 980,
                likes: 76
            },
            {
                id: 8,
                title: '杭帮菜精选：品味正宗江南风味',
                summary: '杭帮菜以其清淡鲜美、注重原味而著称。让我们一起探索那些传承百年的经典菜品和现代创新美食...',
                category: 'food',
                image: 'https://picsum.photos/400/200?random=8',
                date: '2024-01-08',
                views: 1680,
                likes: 123
            }
        ];
    }

    renderArticles() {
        const container = document.getElementById('articleList');
        
        if (this.articles.length === 0) {
            container.innerHTML = this.renderEmptyState();
            return;
        }

        // 按分类分组显示所有文章
        const groupedArticles = this.groupArticlesByCategory();
        const groupedHtml = this.renderGroupedArticles(groupedArticles);
        container.innerHTML = groupedHtml;
        
        // 绑定文章点击事件
        this.bindArticleEvents();
    }

    groupArticlesByCategory() {
        const groups = {};
        
        this.articles.forEach(article => {
            const categoryId = article.category_id;
            const categoryName = article.categories?.name || '其他';
            
            if (!groups[categoryId]) {
                groups[categoryId] = {
                    name: categoryName,
                    articles: []
                };
            }
            groups[categoryId].articles.push(article);
        });

        return groups;
    }

    renderGroupedArticles(groupedArticles) {
        let html = '';
        
        // 按分类ID排序显示
        Object.keys(groupedArticles).sort().forEach(categoryId => {
            const group = groupedArticles[categoryId];
            if (group.articles.length > 0) {
                html += `
                    <div class="category-group">
                        <div class="category-header">
                            <h2 class="category-title">${group.name}</h2>
                        </div>
                        <div class="category-articles">
                            ${group.articles.map(article => this.renderArticleCard(article)).join('')}
                        </div>
                    </div>
                `;
            }
        });

        return html;
    }

    renderArticleCard(article) {
        return `
            <div class="article-card" data-url="${article.summary}">
                <div class="article-image-container">
                    <img class="article-image" src="${article.cover_image}" alt="${article.title}" loading="lazy">
                    <div class="article-category">${article.categories?.name || '其他'}</div>
                </div>
                <div class="article-content">
                    <h3 class="article-title">${article.title}</h3>
                    <p class="article-summary">${article.content}</p>
                    <div class="article-meta" style="display:none;">
                        <div class="article-date">
                            <svg class="stat-icon" viewBox="0 0 24 24">
                                <path fill="currentColor" d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                            </svg>
                            ${Utils.formatDate(article.published_at)}
                        </div>
                        <div class="article-stats">
                            <div class="stat-item">
                                <svg class="stat-icon" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                                ${Utils.formatNumber(article.views)}
                            </div>
                            <div class="stat-item">
                                <svg class="stat-icon" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                                ${Utils.formatNumber(article.likes)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderEmptyState() {
        return `
            <div class="empty-state">
                <svg class="empty-icon" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <div class="empty-title">暂无相关攻略</div>
                <div class="empty-desc">敬请期待更多精彩内容</div>
            </div>
        `;
    }

    bindArticleEvents() {
        const articleCards = document.querySelectorAll('.article-card');
        articleCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const url = e.currentTarget.dataset.url;
                this.openArticle(url);
            });
        });
    }

    openArticle(url) {
        // 这里可以跳转到文章详情页
        window.location.href = url;
    }

    showSearchDialog() {
        // 简单的搜索实现
        const keyword = prompt('请输入搜索关键词：');
        if (keyword && keyword.trim()) {
            this.searchArticles(keyword.trim());
        }
    }

    searchArticles(keyword) {
        const filteredArticles = this.articles.filter(article => 
            article.title.includes(keyword) || 
            article.content.includes(keyword)
        );
        
        // 临时替换文章数据进行搜索结果显示
        const originalArticles = this.articles;
        this.articles = filteredArticles;
        this.renderArticles();
        
        // 如果需要恢复原始数据，可以保存originalArticles
    }

    isNearBottom() {
        return window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000;
    }

    loadMore() {
        // 模拟加载更多数据
        this.loading = true;
        setTimeout(() => {
            // 这里可以加载更多数据
            this.loading = false;
        }, 1000);
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new GuideApp();
});