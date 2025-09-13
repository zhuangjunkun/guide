// 通用工具函数
class Utils {
    // 防抖函数
    static debounce(func, wait) {
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

    // 节流函数
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // 格式化日期
    static formatDate(date) {
        const now = new Date();
        const target = new Date(date);
        const diff = now - target;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days === 0) {
            return '今天';
        } else if (days === 1) {
            return '昨天';
        } else if (days < 7) {
            return `${days}天前`;
        } else {
            return target.toLocaleDateString('zh-CN', {
                month: 'short',
                day: 'numeric'
            });
        }
    }

    // 格式化数字
    static formatNumber(num) {
        if (num < 1000) {
            return num.toString();
        } else if (num < 10000) {
            return (num / 1000).toFixed(1) + 'k';
        } else {
            return (num / 10000).toFixed(1) + 'w';
        }
    }

    // 生成随机ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 图片懒加载
    static lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }
}

// 底部导航切换
class Navigation {
    constructor() {
        this.init();
    }

    init() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.switchPage(page);
            });
        });
    }

    switchPage(page) {
        // 移除所有active状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // 添加当前页面active状态
        document.querySelector(`[data-page="${page}"]`).classList.add('active');

        // 页面跳转逻辑
        if (page === 'map') {
            window.location.href = 'map.html';
        } else if (page === 'guide') {
            window.location.href = 'index.html';
        }
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    new Navigation();
    Utils.lazyLoadImages();
});