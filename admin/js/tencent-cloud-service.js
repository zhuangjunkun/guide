// 腾讯云服务集成
class TencentCloudService {
    constructor() {
        this.cos = null;
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            // 检查是否在浏览器环境中
            if (typeof window === 'undefined') {
                console.warn('腾讯云服务只能在浏览器环境中使用');
                return;
            }

            // 动态加载腾讯云COS SDK
            await this.loadCOSSDK();
            
            // 初始化COS实例
            await this.initCOS();
            
            this.isInitialized = true;
            console.log('腾讯云服务初始化成功');

        } catch (error) {
            console.warn('腾讯云服务初始化失败，文件上传功能将不可用:', error.message);
            this.isInitialized = false;
            // 即使腾讯云服务失败，也继续运行其他功能
        }
    }

    // 动态加载腾讯云COS SDK
    async loadCOSSDK() {
        return new Promise((resolve, reject) => {
            // 检查是否已加载
            if (window.COS) {
                resolve();
                return;
            }

            // 创建script标签
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/cos-js-sdk-v5/dist/cos-js-sdk-v5.min.js';
            script.onload = () => {
                if (window.COS) {
                    resolve();
                } else {
                    reject(new Error('腾讯云COS SDK加载失败'));
                }
            };
            script.onerror = () => reject(new Error('腾讯云COS SDK加载失败'));
            
            document.head.appendChild(script);
        });
    }

    // 初始化COS实例
    async initCOS() {
        try {
            // 从配置获取腾讯云凭证
            const config = window.TencentCloudConfig || {};
            
            if (!config.bucket || !config.region || !config.appId) {
                console.warn('腾讯云配置不完整，文件上传功能将不可用');
                return;
            }

            // 创建COS实例
            this.cos = new COS({
                // 建议使用临时密钥进行前端直传，这里使用配置的密钥（仅用于演示）
                SecretId: config.secretId,
                SecretKey: config.secretKey,
                SecurityToken: config.token,
                
                // 简单的上传重试机制
                UploadCheckContentMd5: true,
                Timeout: 60 * 1000,
                
                // 上传队列配置
                ChunkParallelLimit: 3,
                ChunkSize: 8 * 1024 * 1024,
                ProgressInterval: 1000
            });

            console.log('腾讯云COS实例创建成功');

        } catch (error) {
            console.error('创建腾讯云COS实例失败:', error);
            throw error;
        }
    }

    // 检查服务是否可用
    isAvailable() {
        return this.isInitialized && this.cos !== null;
    }

    // 上传文件到腾讯云COS
    async uploadFile(file, options = {}) {
        if (!this.isAvailable()) {
            throw new Error('腾讯云服务未初始化');
        }

        const {
            path = 'uploads/',
            onProgress = null,
            onError = null
        } = options;

        try {
            // 生成唯一的文件名
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 8);
            const fileExt = file.name.split('.').pop();
            const fileName = `${path}${timestamp}_${randomStr}.${fileExt}`;

            // 上传参数
            const params = {
                Bucket: this.getBucketName(),
                Region: this.getRegion(),
                Key: fileName,
                Body: file,
                onProgress: (progressData) => {
                    if (onProgress) {
                        onProgress({
                            loaded: progressData.loaded,
                            total: progressData.total,
                            percent: Math.round(progressData.percent * 100)
                        });
                    }
                }
            };

            // 执行上传
            const result = await this.cos.putObject(params);

            if (result.statusCode === 200) {
                const fileUrl = this.getFileUrl(fileName);
                return {
                    success: true,
                    url: fileUrl,
                    key: fileName,
                    etag: result.ETag,
                    size: file.size,
                    name: file.name
                };
            } else {
                throw new Error(`上传失败: ${result.statusCode}`);
            }

        } catch (error) {
            console.error('文件上传失败:', error);
            
            if (onError) {
                onError(error);
            }
            
            throw error;
        }
    }

    // 批量上传文件
    async uploadFiles(files, options = {}) {
        const uploads = await Promise.all(
            files.map(file => this.uploadFile(file, options))
        );
        
        return {
            success: true,
            files: uploads,
            total: files.length,
            successful: uploads.filter(u => u.success).length,
            failed: uploads.filter(u => !u.success).length
        };
    }

    // 删除文件
    async deleteFile(key) {
        if (!this.isAvailable()) {
            throw new Error('腾讯云服务未初始化');
        }

        try {
            const result = await this.cos.deleteObject({
                Bucket: this.getBucketName(),
                Region: this.getRegion(),
                Key: key
            });

            return {
                success: result.statusCode === 204 || result.statusCode === 200,
                key: key
            };

        } catch (error) {
            console.error('文件删除失败:', error);
            throw error;
        }
    }

    // 批量删除文件
    async deleteFiles(keys) {
        if (!this.isAvailable()) {
            throw new Error('腾讯云服务未初始化');
        }

        try {
            const objects = keys.map(key => ({ Key: key }));
            
            const result = await this.cos.deleteMultipleObject({
                Bucket: this.getBucketName(),
                Region: this.getRegion(),
                Objects: objects
            });

            return {
                success: result.statusCode === 200,
                deleted: result.Deleted || [],
                errors: result.Error || []
            };

        } catch (error) {
            console.error('批量删除文件失败:', error);
            throw error;
        }
    }

    // 获取文件列表
    async listFiles(prefix = '', options = {}) {
        if (!this.isAvailable()) {
            throw new Error('腾讯云服务未初始化');
        }

        const {
            limit = 100,
            marker = '',
            delimiter = ''
        } = options;

        try {
            const result = await this.cos.getBucket({
                Bucket: this.getBucketName(),
                Region: this.getRegion(),
                Prefix: prefix,
                Marker: marker,
                MaxKeys: limit,
                Delimiter: delimiter
            });

            return {
                files: result.Contents || [],
                folders: result.CommonPrefixes || [],
                isTruncated: result.IsTruncated,
                nextMarker: result.NextMarker,
                total: result.Contents ? result.Contents.length : 0
            };

        } catch (error) {
            console.error('获取文件列表失败:', error);
            throw error;
        }
    }

    // 获取文件信息
    async getFileInfo(key) {
        if (!this.isAvailable()) {
            throw new Error('腾讯云服务未初始化');
        }

        try {
            const result = await this.cos.headObject({
                Bucket: this.getBucketName(),
                Region: this.getRegion(),
                Key: key
            });

            return {
                exists: result.statusCode === 200,
                size: result.headers['content-length'],
                type: result.headers['content-type'],
                lastModified: result.headers['last-modified'],
                etag: result.headers.etag
            };

        } catch (error) {
            if (error.statusCode === 404) {
                return { exists: false };
            }
            console.error('获取文件信息失败:', error);
            throw error;
        }
    }

    // 生成预签名URL（用于临时访问）
    async getPresignedUrl(key, expires = 3600) {
        if (!this.isAvailable()) {
            throw new Error('腾讯云服务未初始化');
        }

        try {
            const url = await this.cos.getObjectUrl({
                Bucket: this.getBucketName(),
                Region: this.getRegion(),
                Key: key,
                Expires: expires,
                Sign: true
            });

            return {
                url: url,
                expires: expires,
                expiresAt: Date.now() + expires * 1000
            };

        } catch (error) {
            console.error('生成预签名URL失败:', error);
            throw error;
        }
    }

    // 获取Bucket名称（包含AppId）
    getBucketName() {
        const config = window.tencentCloudConfig || {};
        return `${config.bucket}-${config.appId}`;
    }

    // 获取地域
    getRegion() {
        const config = window.tencentCloudConfig || {};
        return config.region;
    }

    // 获取文件访问URL
    getFileUrl(key) {
        const config = window.tencentCloudConfig || {};
        const bucket = this.getBucketName();
        const region = this.getRegion();
        
        // 如果配置了自定义域名，使用自定义域名
        if (config.domain) {
            return `https://${config.domain}/${key}`;
        }
        
        // 否则使用腾讯云默认域名
        return `https://${bucket}.cos.${region}.myqcloud.com/${key}`;
    }

    // 检查文件类型是否允许
    isFileTypeAllowed(file, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) {
        return allowedTypes.includes(file.type);
    }

    // 检查文件大小是否允许
    isFileSizeAllowed(file, maxSize = 10 * 1024 * 1024) { // 默认10MB
        return file.size <= maxSize;
    }

    // 生成缩略图URL（COS自动处理）
    getThumbnailUrl(key, options = {}) {
        const {
            width = 200,
            height = 200,
            mode = 'lfit', // lfit: 等比缩放, mfit: 等比填充, fill: 固定尺寸
            format = 'webp',
            quality = 80
        } = options;

        const imageUrl = this.getFileUrl(key);
        const processingParams = [
            `imageMogr2/thumbnail/${width}x${height}r`,
            `imageMogr2/gravity/center`,
            `imageMogr2/crop/${width}x${height}`,
            `imageMogr2/format/${format}`,
            `imageMogr2/quality/${quality}`
        ].join('|');

        return `${imageUrl}?${processingParams}`;
    }

    // 清理过期文件（基于命名规则）
    async cleanupExpiredFiles(prefix = 'temp/', maxAge = 24 * 60 * 60 * 1000) { // 默认24小时
        try {
            const files = await this.listFiles(prefix);
            const now = Date.now();
            const filesToDelete = [];

            for (const file of files.files) {
                const fileName = file.Key;
                const timestamp = this.extractTimestampFromFileName(fileName);
                
                if (timestamp && now - timestamp > maxAge) {
                    filesToDelete.push(fileName);
                }
            }

            if (filesToDelete.length > 0) {
                const result = await this.deleteFiles(filesToDelete);
                return {
                    deleted: result.deleted.length,
                    errors: result.errors.length
                };
            }

            return { deleted: 0, errors: 0 };

        } catch (error) {
            console.error('清理过期文件失败:', error);
            throw error;
        }
    }

    // 从文件名中提取时间戳
    extractTimestampFromFileName(fileName) {
        const match = fileName.match(/(\d{13})_/);
        return match ? parseInt(match[1]) : null;
    }

    // 获取存储桶统计信息
    async getBucketStats() {
        try {
            const files = await this.listFiles('', { limit: 1 });
            const totalSize = files.files.reduce((sum, file) => sum + file.Size, 0);
            const totalFiles = files.files.length;

            return {
                totalFiles,
                totalSize,
                totalSizeFormatted: this.formatFileSize(totalSize)
            };

        } catch (error) {
            console.error('获取存储桶统计失败:', error);
            throw error;
        }
    }

    // 格式化文件大小
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 创建文件夹
    async createFolder(path) {
        if (!this.isAvailable()) {
            throw new Error('腾讯云服务未初始化');
        }

        try {
            // 在COS中，文件夹是通过以/结尾的0字节文件表示的
            const folderKey = path.endsWith('/') ? path : path + '/';
            
            const result = await this.cos.putObject({
                Bucket: this.getBucketName(),
                Region: this.getRegion(),
                Key: folderKey,
                Body: new Blob([])
            });

            return {
                success: result.statusCode === 200,
                path: folderKey
            };

        } catch (error) {
            console.error('创建文件夹失败:', error);
            throw error;
        }
    }
}

// 创建全局腾讯云服务实例
window.tencentCloudService = new TencentCloudService();

// 导出服务
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TencentCloudService;
}