// 系统常量配置
const Constants = {
    // API 端点
    API_ENDPOINTS: {
        CATEGORIES: '/categories',
        ARTICLES: '/articles',
        ATTRACTIONS: '/attractions',
        MAP_MARKERS: '/map-markers',
        SETTINGS: '/settings',
        UPLOAD: '/upload',
        AUTH: '/auth'
    },

    // 文件上传配置
    UPLOAD_CONFIG: {
        MAX_FILE_SIZE: parseInt(import.meta.env.VITE_UPLOAD_MAX_SIZE) || 10 * 1024 * 1024, // 10MB
        ALLOWED_TYPES: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif').split(','),
        MAX_FILES: 10
    },

    // 地图配置
    MAP_CONFIG: {
        CENTER: {
            lat: parseFloat(import.meta.env.VITE_MAP_CENTER_LAT) || 39.90923,
            lng: parseFloat(import.meta.env.VITE_MAP_CENTER_LNG) || 116.397428
        },
        ZOOM: parseInt(import.meta.env.VITE_MAP_ZOOM) || 13,
        PROVIDER: import.meta.env.VITE_MAP_PROVIDER || 'openstreetmap'
    },

    // 分页配置
    PAGINATION: {
        DEFAULT_PAGE_SIZE: 20,
        PAGE_SIZES: [10, 20, 50, 100],
        MAX_PAGES: 10
    },

    // 缓存配置
    CACHE: {
        DEFAULT_TTL: 5 * 60 * 1000, // 5分钟
        MAX_ITEMS: 1000
    },

    // 错误消息
    ERROR_MESSAGES: {
        NETWORK_ERROR: '网络连接失败，请检查网络设置',
        FORBIDDEN: '操作被拒绝',
        NOT_FOUND: '请求的资源不存在',
        SERVER_ERROR: '服务器内部错误',
        TIMEOUT: '请求超时，请稍后重试',
        VALIDATION_ERROR: '数据验证失败'
    },

    // 成功消息
    SUCCESS_MESSAGES: {
        CREATE_SUCCESS: '创建成功',
        UPDATE_SUCCESS: '更新成功',
        DELETE_SUCCESS: '删除成功',
        UPLOAD_SUCCESS: '上传成功',
        LOGIN_SUCCESS: '登录成功',
        LOGOUT_SUCCESS: '登出成功'
    },

    // 状态码
    STATUS_CODES: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        INTERNAL_ERROR: 500
    },

    // 本地存储键名
    STORAGE_KEYS: {
        AUTH_TOKEN: 'auth_token',
        USER_INFO: 'user_info',
        SETTINGS: 'app_settings',
        CACHE: 'app_cache'
    },

    // 正则表达式
    REGEX: {
        EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE: /^1[3-9]\d{9}$/,
        PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
        URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        IMAGE_URL: /\.(jpg|jpeg|png|gif|webp)$/i
    },

    // 日期格式
    DATE_FORMATS: {
        DISPLAY: 'YYYY-MM-DD HH:mm:ss',
        SHORT: 'YYYY-MM-DD',
        TIME: 'HH:mm:ss'
    },

    // 角色权限
    ROLES: {
        ADMIN: 'admin',
        EDITOR: 'editor',
        VIEWER: 'viewer'
    },

    // 权限映射
    PERMISSIONS: {
        admin: ['read', 'write', 'delete', 'manage'],
        editor: ['read', 'write'],
        viewer: ['read']
    }
};

// 导出常量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Constants;
} else {
    window.Constants = Constants;
}