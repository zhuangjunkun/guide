// 腾讯云服务配置
window.TencentCloudConfig = {
    // COS对象存储配置
    cos: {
        bucket: 'guide-1234567890',  // 替换为实际的存储桶名称
        region: 'ap-guangzhou',      // 替换为实际的地域
        appId: 'your-app-id'         // 替换为实际的应用ID
    },
    
    // 云开发配置
    tcb: {
        env: 'your-env-id'           // 替换为实际的环境ID
    },
    
    // 临时密钥服务配置
    sts: {
        url: '/api/get-temp-key',    // 获取临时密钥的接口地址
        durationSeconds: 7200        // 临时密钥有效期（秒）
    },
    
    // 上传配置
    upload: {
        maxSize: 10 * 1024 * 1024,   // 最大上传大小（10MB）
        allowedTypes: [              // 允许的文件类型
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ],
        paths: {
            images: 'images/',       // 图片存储路径
            documents: 'documents/', // 文档存储路径
            temp: 'temp/'            // 临时文件存储路径
        }
    }
};

// 工具函数
window.TencentCloudUtils = {
    // 生成唯一文件名
    generateUniqueFileName(originalName) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        const ext = originalName.split('.').pop();
        return `${timestamp}_${random}.${ext}`;
    },
    
    // 获取文件类型
    getFileType(file) {
        if (file.type.startsWith('image/')) {
            return 'image';
        } else if (file.type.startsWith('video/')) {
            return 'video';
        } else if (file.type.startsWith('audio/')) {
            return 'audio';
        } else if (file.type.includes('pdf') || file.type.includes('word') || file.type.includes('document')) {
            return 'document';
        } else {
            return 'other';
        }
    },
    
    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    // 检查文件是否允许上传
    isFileAllowed(file) {
        const config = window.TencentCloudConfig.upload;
        
        // 检查文件大小
        if (file.size > config.maxSize) {
            return {
                allowed: false,
                reason: `文件大小超过限制（最大 ${this.formatFileSize(config.maxSize)}）`
            };
        }
        
        // 检查文件类型
        if (!config.allowedTypes.includes(file.type)) {
            return {
                allowed: false,
                reason: '不支持的文件类型'
            };
        }
        
        return {
            allowed: true
        };
    },
    
    // 获取文件存储路径
    getStoragePath(file) {
        const fileType = this.getFileType(file);
        const config = window.TencentCloudConfig.upload.paths;
        
        switch (fileType) {
            case 'image':
                return config.images;
            case 'document':
                return config.documents;
            default:
                return config.temp;
        }
    }
};