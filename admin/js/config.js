// 系统配置文件
const AppConfig = {
    // Supabase配置
    supabase: {
        url: 'https://xaoxaodcqcqjhydkrnfd.supabase.co',
        anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhhb3hhb2RjcWNxamh5ZGtybmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2OTAxNjksImV4cCI6MjA3MjI2NjE2OX0.t01Dyealn85iCLvv26iAm-G3UJbqj8v5WWrG1sUVmMY'
    },

    // 腾讯云配置
    tencentCloud: {
        // COS存储桶配置
        bucket: 'guide-app',
        region: 'ap-guangzhou',
        appId: '1300000000', // 需要替换为实际的AppId
        
        // 可选：自定义域名
        domain: null,
        
        // 安全密钥（建议使用临时密钥，这里仅用于演示）
        secretId: null,
        secretKey: null,
        token: null
    },

    // 应用配置
    app: {
        name: '旅游导览管理系统',
        version: '1.0.0',
        description: '旅游导览H5+管理后台系统',
        author: '开发团队',
        
        // 主题配置
        theme: {
            primaryColor: '#2D9596',
            secondaryColor: '#9AD0C2',
            accentColor: '#F1FADA',
            textColor: '#265073',
            backgroundColor: '#FFFFFF'
        },
        
        // 功能开关
        features: {
            mapEditor: true,
            fileUpload: true,
            realtimeUpdates: true,
            analytics: false
        }
    },

    // API配置
    api: {
        baseURL: '/api',
        timeout: 30000,
        retryAttempts: 3,
        
        // 第三方API
        amap: {
            key: null, // 高德地图API Key
            version: '2.0'
        },
        
        baiduMap: {
            key: null, // 百度地图API Key
            version: '3.0'
        }
    },

    // 上传配置
    upload: {
        // 图片上传配置
        images: {
            maxSize: 10 * 1024 * 1024, // 10MB
            allowedTypes: [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'image/svg+xml'
            ],
            maxWidth: 3840,
            maxHeight: 2160,
            quality: 80
        },
        
        // 文件上传配置
        files: {
            maxSize: 50 * 1024 * 1024, // 50MB
            allowedTypes: [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/plain',
                'application/zip',
                'application/x-rar-compressed'
            ]
        },
        
        // 视频上传配置
        videos: {
            maxSize: 200 * 1024 * 1024, // 200MB
            allowedTypes: [
                'video/mp4',
                'video/mpeg',
                'video/quicktime',
                'video/x-msvideo',
                'video/x-ms-wmv'
            ]
        }
    },

    // 地图配置
    map: {
        // 默认地图中心点坐标（示例：某个旅游景点的坐标）
        center: [116.397428, 39.90923], // 北京天安门
        zoom: 13,
        minZoom: 3,
        maxZoom: 18,
        
        // 地图样式
        style: 'amap://styles/normal',
        
        // 标记点样式
        marker: {
            icon: '/images/map-marker.png',
            size: [32, 32],
            anchor: [16, 32]
        },
        
        // 地图控件
        controls: {
            zoom: true,
            scale: true,
            toolbar: true,
            geolocation: true
        }
    },

    // 页面配置
    pages: {
        // 列表页配置
        list: {
            pageSize: 20,
            pageSizes: [10, 20, 50, 100],
            defaultSort: 'created_at',
            defaultOrder: 'desc'
        },
        
        // 搜索配置
        search: {
            debounce: 300,
            minLength: 2,
            maxResults: 10
        }
    },

    // 缓存配置
    cache: {
        // 本地存储配置
        localStorage: {
            prefix: 'guide_',
            expire: 7 * 24 * 60 * 60 * 1000 // 7天
        },
        
        // 会话存储配置
        sessionStorage: {
            prefix: 'guide_session_'
        },
        
        // 内存缓存配置
        memory: {
            maxSize: 100,
            expire: 5 * 60 * 1000 // 5分钟
        }
    },

    // 错误处理配置
    error: {
        // 显示错误消息的持续时间
        messageDuration: 5000,
        
        // 自动重试配置
        autoRetry: {
            enabled: true,
            maxAttempts: 3,
            delay: 1000
        },
        
        // 忽略的错误类型
        ignoreErrors: [
            'Network Error',
            'Request aborted'
        ]
    },

    // 性能监控配置
    performance: {
        enabled: true,
        sampleRate: 0.1, // 10%的请求采样率
        longTaskThreshold: 100, // 100ms以上的任务视为长任务
        memoryWarningThreshold: 80 // 内存使用率超过80%发出警告
    },

    // 安全配置
    security: {
        // XSS防护
        xss: {
            enabled: true,
            strict: false
        },
        
        // CSRF防护
        csrf: {
            enabled: true,
            tokenHeader: 'X-CSRF-Token'
        },
        
        // 内容安全策略
        csp: {
            enabled: false,
            directives: {
                'default-src': ["'self'"],
                'script-src': ["'self'", "'unsafe-inline'"],
                'style-src': ["'self'", "'unsafe-inline'"],
                'img-src': ["'self'", "data:", "https:"],
                'connect-src': ["'self'", "https:"]
            }
        }
    },

    // 国际化配置
    i18n: {
        defaultLanguage: 'zh-CN',
        supportedLanguages: ['zh-CN', 'en-US'],
        fallbackLanguage: 'zh-CN'
    },

    // 日志配置
    logging: {
        level: 'info', // debug, info, warn, error
        console: {
            enabled: true,
            level: 'debug'
        },
        remote: {
            enabled: false,
            url: '/api/logs',
            level: 'error'
        }
    },

    // 开发调试配置
    debug: {
        enabled: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
        features: {
            reduxDevTools: true,
            vueDevTools: true,
            performanceMonitor: true
        }
    },

    // 环境检测
    get environment() {
        return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? 'development' 
            : 'production';
    },

    // 是否是开发环境
    get isDevelopment() {
        return this.environment === 'development';
    },

    // 是否是生产环境
    get isProduction() {
        return this.environment === 'production';
    },

    // 获取配置值（支持路径访问）
    get(path, defaultValue = null) {
        const parts = path.split('.');
        let value = this;
        
        for (const part of parts) {
            if (value === null || value === undefined) {
                return defaultValue;
            }
            value = value[part];
        }
        
        return value !== undefined ? value : defaultValue;
    },

    // 设置配置值
    set(path, value) {
        const parts = path.split('.');
        let obj = this;
        
        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!obj[part] || typeof obj[part] !== 'object') {
                obj[part] = {};
            }
            obj = obj[part];
        }
        
        obj[parts[parts.length - 1]] = value;
        return true;
    },

    // 合并配置
    merge(newConfig) {
        return Object.assign({}, this, newConfig);
    },

    // 重置为默认配置
    reset() {
        Object.keys(this).forEach(key => {
            if (typeof this[key] === 'object' && this[key] !== null) {
                this[key] = { ...this[key] };
            }
        });
    },

    // 验证配置
    validate() {
        const errors = [];
        
        // 验证Supabase配置
        if (!this.supabase.url || !this.supabase.anonKey) {
            errors.push('Supabase配置不完整');
        }
        
        // 验证腾讯云配置
        if (this.tencentCloud.bucket && !this.tencentCloud.region) {
            errors.push('腾讯云存储桶配置不完整');
        }
        
        return errors;
    },

    // 加载远程配置
    async loadRemoteConfig(url = '/api/config') {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`加载配置失败: ${response.status}`);
            }
            
            const remoteConfig = await response.json();
            this.merge(remoteConfig);
            
            return true;
            
        } catch (error) {
            console.warn('加载远程配置失败，使用本地配置:', error);
            return false;
        }
    },

    // 保存配置到本地存储
    saveToLocalStorage() {
        try {
            localStorage.setItem('app_config', JSON.stringify(this));
            return true;
        } catch (error) {
            console.error('保存配置到本地存储失败:', error);
            return false;
        }
    },

    // 从本地存储加载配置
    loadFromLocalStorage() {
        try {
            const savedConfig = localStorage.getItem('app_config');
            if (savedConfig) {
                const parsedConfig = JSON.parse(savedConfig);
                this.merge(parsedConfig);
                return true;
            }
        } catch (error) {
            console.error('从本地存储加载配置失败:', error);
        }
        return false;
    }
};

// 设置全局配置对象
window.appConfig = AppConfig;

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AppConfig;
}