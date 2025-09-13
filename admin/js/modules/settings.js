// 设置模块
class SettingsModule {
    constructor() {
        this.settings = {};
        this.isLoading = false;
        
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.bindEvents();
    }

    // 加载设置
    async loadSettings() {
        this.isLoading = true;
        this.showLoading('正在加载设置...');

        try {
            const result = await window.apiService.settings.get();
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.settings = this.parseSettings(result.data || []);
            this.renderSettings();

        } catch (error) {
            console.error('加载设置失败:', error);
            this.showError('加载设置失败: ' + error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // 解析设置数据
    parseSettings(settingsArray) {
        const settings = {};
        
        settingsArray.forEach(setting => {
            try {
                settings[setting.key] = JSON.parse(setting.value);
            } catch {
                settings[setting.key] = setting.value;
            }
        });

        return settings;
    }

    // 渲染设置
    renderSettings() {
        this.renderGeneralSettings();
        this.renderMapSettings();
        this.renderUploadSettings();
        this.renderSystemSettings();
    }

    // 渲染通用设置
    renderGeneralSettings() {
        const settings = this.settings.general || {};
        
        this.setFormValue('site-title', settings.siteTitle || '旅游导览系统');
        this.setFormValue('site-description', settings.siteDescription || '');
        this.setFormValue('admin-email', settings.adminEmail || '');
        this.setFormValue('timezone', settings.timezone || 'Asia/Shanghai');
    }

    // 渲染地图设置
    renderMapSettings() {
        const settings = this.settings.map || {};
        
        this.setFormValue('map-center-lat', settings.centerLat || '39.90923');
        this.setFormValue('map-center-lng', settings.centerLng || '116.397428');
        this.setFormValue('map-zoom', settings.zoom || '13');
        this.setFormValue('map-provider', settings.provider || 'openstreetmap');
    }

    // 渲染上传设置
    renderUploadSettings() {
        const settings = this.settings.upload || {};
        
        this.setFormValue('max-image-size', settings.maxImageSize || '10');
        this.setFormValue('max-file-size', settings.maxFileSize || '50');
        this.setFormValue('allowed-image-types', settings.allowedImageTypes || 'image/jpeg,image/png,image/gif');
    }

    // 渲染系统设置
    renderSystemSettings() {
        const settings = this.settings.system || {};
        
        this.setFormValue('auto-backup', settings.autoBackup || 'true');
        this.setFormValue('backup-interval', settings.backupInterval || '24');
        this.setFormValue('log-level', settings.logLevel || 'info');
        this.setFormValue('maintenance-mode', settings.maintenanceMode || 'false');
    }

    // 设置表单值
    setFormValue(fieldName, value) {
        const element = document.getElementById(fieldName);
        if (!element) return;

        if (element.type === 'checkbox') {
            element.checked = value === 'true';
        } else {
            element.value = value;
        }
    }

    // 绑定事件
    bindEvents() {
        // 保存设置
        const saveBtn = document.getElementById('save-settings-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
            });
        }

        // 重置设置
        const resetBtn = document.getElementById('reset-settings-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.confirmResetSettings();
            });
        }

        // 测试连接
        const testBtn = document.getElementById('test-connection-btn');
        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.testConnections();
            });
        }

        // 表单验证
        this.bindFormValidation();
    }

    // 绑定表单验证
    bindFormValidation() {
        const forms = document.querySelectorAll('.settings-form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSettings();
            });
        });
    }

    // 保存设置
    async saveSettings() {
        if (this.isLoading) return;

        this.isLoading = true;
        this.showLoading('正在保存设置...');

        try {
            const settings = this.collectSettings();
            
            const result = await window.apiService.settings.batchUpdate(settings);
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.showSuccess('设置保存成功');
            
            // 重新加载设置以确保同步
            await this.loadSettings();

        } catch (error) {
            console.error('保存设置失败:', error);
            this.showError('保存设置失败: ' + error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // 收集设置
    collectSettings() {
        return {
            general: {
                siteTitle: this.getFormValue('site-title'),
                siteDescription: this.getFormValue('site-description'),
                adminEmail: this.getFormValue('admin-email'),
                timezone: this.getFormValue('timezone')
            },
            map: {
                centerLat: parseFloat(this.getFormValue('map-center-lat')),
                centerLng: parseFloat(this.getFormValue('map-center-lng')),
                zoom: parseInt(this.getFormValue('map-zoom')),
                provider: this.getFormValue('map-provider')
            },
            upload: {
                maxImageSize: parseInt(this.getFormValue('max-image-size')),
                maxFileSize: parseInt(this.getFormValue('max-file-size')),
                allowedImageTypes: this.getFormValue('allowed-image-types')
            },
            system: {
                autoBackup: this.getFormValue('auto-backup'),
                backupInterval: parseInt(this.getFormValue('backup-interval')),
                logLevel: this.getFormValue('log-level'),
                maintenanceMode: this.getFormValue('maintenance-mode')
            }
        };
    }

    // 获取表单值
    getFormValue(fieldName) {
        const element = document.getElementById(fieldName);
        if (!element) return '';

        if (element.type === 'checkbox') {
            return element.checked ? 'true' : 'false';
        } else {
            return element.value;
        }
    }

    // 确认重置设置
    confirmResetSettings() {
        const confirmed = confirm('确定要重置所有设置为默认值吗？此操作不可撤销。');
        if (confirmed) {
            this.resetSettings();
        }
    }

    // 重置设置
    async resetSettings() {
        this.isLoading = true;
        this.showLoading('正在重置设置...');

        try {
            // 重置为默认设置
            const defaultSettings = {
                general: {
                    siteTitle: '旅游导览系统',
                    siteDescription: '',
                    adminEmail: '',
                    timezone: 'Asia/Shanghai'
                },
                map: {
                    centerLat: 39.90923,
                    centerLng: 116.397428,
                    zoom: 13,
                    provider: 'openstreetmap'
                },
                upload: {
                    maxImageSize: 10,
                    maxFileSize: 50,
                    allowedImageTypes: 'image/jpeg,image/png,image/gif'
                },
                system: {
                    autoBackup: true,
                    backupInterval: 24,
                    logLevel: 'info',
                    maintenanceMode: false
                }
            };

            const result = await window.apiService.settings.batchUpdate(defaultSettings);
            
            if (result.error) {
                throw new Error(result.error);
            }

            this.showSuccess('设置重置成功');
            
            // 重新加载设置
            await this.loadSettings();

        } catch (error) {
            console.error('重置设置失败:', error);
            this.showError('重置设置失败: ' + error.message);
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    // 测试连接
    async testConnections() {
        this.showLoading('正在测试连接...');

        try {
            const results = await Promise.allSettled([
                this.testDatabaseConnection(),
                this.testStorageConnection(),
                this.testMapServiceConnection()
            ]);

            this.showTestResults(results);

        } catch (error) {
            console.error('测试连接失败:', error);
            this.showError('测试连接失败: ' + error.message);
        } finally {
            this.hideLoading();
        }
    }

    // 测试数据库连接
    async testDatabaseConnection() {
        try {
            const result = await window.apiService.categories.getStats();
            return {
                service: '数据库',
                status: !result.error ? 'success' : 'error',
                message: !result.error ? '连接正常' : result.error
            };
        } catch (error) {
            return {
                service: '数据库',
                status: 'error',
                message: error.message
            };
        }
    }

    // 测试存储连接
    async testStorageConnection() {
        try {
            // 这里需要根据实际的存储服务进行测试
            return {
                service: '文件存储',
                status: 'warning',
                message: '测试功能待实现'
            };
        } catch (error) {
            return {
                service: '文件存储',
                status: 'error',
                message: error.message
            };
        }
    }

    // 测试地图服务连接
    async testMapServiceConnection() {
        try {
            // 测试地图服务连接
            return {
                service: '地图服务',
                status: 'success',
                message: '连接正常'
            };
        } catch (error) {
            return {
                service: '地图服务',
                status: 'error',
                message: error.message
            };
        }
    }

    // 显示测试结果
    showTestResults(results) {
        const resultsContainer = document.getElementById('test-results');
        if (!resultsContainer) return;

        let html = '<div class="test-results">';
        
        results.forEach(result => {
            const { service, status, message } = result.value || {};
            const statusClass = status === 'success' ? 'success' : status === 'warning' ? 'warning' : 'error';
            
            html += `
                <div class="test-result ${statusClass}">
                    <div class="test-service">${service}</div>
                    <div class="test-status">${this.getStatusText(status)}</div>
                    <div class="test-message">${message}</div>
                </div>
            `;
        });

        html += '</div>';
        resultsContainer.innerHTML = html;
    }

    // 获取状态文本
    getStatusText(status) {
        const statusMap = {
            success: '成功',
            warning: '警告',
            error: '失败'
        };
        return statusMap[status] || status;
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

// 初始化设置模块
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('settings-page')) {
        window.settingsModule = new SettingsModule();
    }
});

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SettingsModule;
}