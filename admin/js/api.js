// API服务 - 处理Supabase数据库操作
class ApiService {
    constructor() {
        this.supabase = null;
        this.init();
    }

    async init() {
        await this.waitForSupabase();
    }

    // 等待Supabase客户端初始化
    async waitForSupabase() {
        return new Promise((resolve) => {
            const checkSupabase = () => {
                if (window.supabaseClient) {
                    this.supabase = window.supabaseClient;
                    resolve();
                } else {
                    setTimeout(checkSupabase, 100);
                }
            };
            checkSupabase();
        });
    }

    // 通用错误处理
    handleError(error, defaultMessage = '操作失败') {
        console.error('API错误:', error);
        
        // 移除所有认证相关的错误处理
        if (error.code === 'PGRST116') {
            return { error: '未找到数据' };
        }
        
        if (error.code === '23505') {
            return { error: '数据已存在' };
        }
        
        return { error: error.message || defaultMessage };
    }

    // 认证中间件 - 已禁用所有权限验证
    async requireAuth() {
        // 直接返回成功，跳过所有权限检查
        return { session: { user: { id: 'admin' } }, adminUser: { role: 'super_admin' } };
    }

    // 检查权限 - 已禁用
    async checkPermission() {
        return true;
    }

    // 分类管理API
    categories = {
        // 获取所有分类
        getAll: async (options = {}) => {
            try {
                let query = this.supabase
                    .from('categories')
                    .select('*');

                if (options.activeOnly) {
                    query = query.eq('is_active', true);
                }

                if (options.orderBy) {
                    query = query.order(options.orderBy, { 
                        ascending: options.ascending !== false 
                    });
                }

                const { data, error } = await query;

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取分类失败');
            }
        },

        // 获取单个分类
        getById: async (id) => {
            try {
                const { data, error } = await this.supabase
                    .from('categories')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取分类失败');
            }
        },

        // 创建分类
        create: async (categoryData) => {
            try {
                // 跳过权限检查
                
                const { data, error } = await this.supabase
                    .from('categories')
                    .insert([{
                        ...categoryData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '创建分类失败');
            }
        },

        // 更新分类
        update: async (id, categoryData) => {
            try {
                // 跳过权限检查
                
                const { data, error } = await this.supabase
                    .from('categories')
                    .update({
                        ...categoryData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '更新分类失败');
            }
        },

        // 删除分类
        delete: async (id) => {
            try {
                // 跳过权限检查
                
                const { error } = await this.supabase
                    .from('categories')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { success: true };

            } catch (error) {
                return this.handleError(error, '删除分类失败');
            }
        },

        // 获取分类统计
        getStats: async () => {
            try {
                const { count, error } = await this.supabase
                    .from('categories')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true);

                if (error) throw error;
                return { count };

            } catch (error) {
                return this.handleError(error, '获取分类统计失败');
            }
        }
    };

    // 景点管理API
    attractions = {
        // 获取所有景点
        getAll: async (options = {}) => {
            try {
                let query = this.supabase
                    .from('attractions')
                    .select(`
                        *,
                        category:categories(*)
                    `);

                if (options.categoryId) {
                    query = query.eq('category_id', options.categoryId);
                }

                if (options.activeOnly) {
                    query = query.eq('is_active', true);
                }

                if (options.orderBy) {
                    query = query.order(options.orderBy, { 
                        ascending: options.ascending !== false 
                    });
                }

                const { data, error } = await query;

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取景点失败');
            }
        },

        // 获取单个景点
        getById: async (id) => {
            try {
                const { data, error } = await this.supabase
                    .from('attractions')
                    .select(`
                        *,
                        category:categories(*)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取景点失败');
            }
        },

        // 创建景点
        create: async (attractionData) => {
            try {
                // 跳过权限检查
                
                const { data, error } = await this.supabase
                    .from('attractions')
                    .insert([{
                        ...attractionData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '创建景点失败');
            }
        },

        // 更新景点
        update: async (id, attractionData) => {
            try {
                // 跳过权限检查
                
                const { data, error } = await this.supabase
                    .from('attractions')
                    .update({
                        ...attractionData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '更新景点失败');
            }
        },

        // 删除景点
        delete: async (id) => {
            try {
                // 跳过权限检查
                
                const { error } = await this.supabase
                    .from('attractions')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { success: true };

            } catch (error) {
                return this.handleError(error, '删除景点失败');
            }
        },

        // 获取景点统计
        getStats: async () => {
            try {
                const { count, error } = await this.supabase
                    .from('attractions')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true);

                if (error) throw error;
                return { count };

            } catch (error) {
                return this.handleError(error, '获取景点统计失败');
            }
        },

        // 搜索景点
        search: async (searchTerm, options = {}) => {
            try {
                let query = this.supabase
                    .from('attractions')
                    .select(`
                        *,
                        category:categories(*)
                    `)
                    .ilike('name', `%${searchTerm}%`);

                if (options.activeOnly) {
                    query = query.eq('is_active', true);
                }

                if (options.limit) {
                    query = query.limit(options.limit);
                }

                const { data, error } = await query;

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '搜索景点失败');
            }
        }
    };

    // 文章管理API
    articles = {
        // 获取所有文章
        getAll: async (options = {}) => {
            try {
                let query = this.supabase
                    .from('articles')
                    .select(`
                        *,
                        category:categories(*),
                        author:admin_users(username, full_name)
                    `);

                if (options.categoryId) {
                    query = query.eq('category_id', options.categoryId);
                }

                if (options.status) {
                    query = query.eq('status', options.status);
                }

                if (options.orderBy) {
                    query = query.order(options.orderBy, { 
                        ascending: options.ascending !== false 
                    });
                }

                const { data, error } = await query;

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取文章失败');
            }
        },

        // 获取单个文章
        getById: async (id) => {
            try {
                const { data, error } = await this.supabase
                    .from('articles')
                    .select(`
                        *,
                        category:categories(*),
                        author:admin_users(username, full_name)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取文章失败');
            }
        },

        // 创建文章
        create: async (articleData) => {
            try {
                // 跳过权限检查
                
                const { data, error } = await this.supabase
                    .from('articles')
                    .insert([{
                        ...articleData,
                        created极_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '创建文章失败');
            }
        },

        // 更新文章
        update: async (id, articleData) => {
            try {
                // 跳过权限检查
                
                const { data, error } = await this.supabase
                    .from('articles')
                    .update({
                        ...articleData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '极更新文章失败');
            }
        },

        // 删除文章
        delete: async (id) => {
            try {
                // 跳过权限检查
                
                const { error } = await this.supabase
                    .from('articles')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { success: true };

            } catch (error) {
                return this.handleError(error, '删除文章失败');
            }
        },

        // 获取文章统计
        getStats: async () => {
            try {
                const { count, error } = await this.supabase
                    .from('articles')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'published');

                if (error) throw error;
                return { count };

            } catch (error) {
                return this.handleError(error, '获取文章统计失败');
            }
        },

        // 搜索文章
        search: async (searchTerm, options = {}) => {
            try {
                let query = this.supabase
                    .from('articles')
                    .select(`
                        *,
                        category:categories(*),
                        author:admin_users(username, full_name)
                    `)
                    .ilike('title', `%${searchTerm}%`);

                if (options.status) {
                    query = query.eq('status', options.status);
                }

                if (options.limit) {
                    query = query.limit(options.limit);
                }

                const { data, error } = await query;

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '搜索文章失败');
            }
        }
    };

    // 地图标记API
    mapMarkers = {
        // 获取所有地图标记
        getAll: async () => {
            try {
                const { data, error } = await this.supabase
                    .from('map_markers')
                    .select(`
                        *,
                        attraction:attractions(*)
                    `)
                    .order('created_at', { ascending: true });

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取地图标记失败');
            }
        },

        // 获取单个标记
        getById: async (id) => {
            try {
                const { data, error } = await this.supabase
                    .from('map_markers')
                    .select(`
                        *,
                        attraction:attractions(*)
                    `)
                    .eq('id', id)
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取地图标记失败');
            }
        },

        // 创建标记
        create: async (markerData) => {
            try {
                const { data, error } = await this.supabase
                    .from('map_markers')
                    .insert([{
                        ...markerData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '创建地图标记失败');
            }
        },

        // 更新标记
        update: async (id, markerData) => {
            try {
                const { data, error } = await this.supabase
                    .from('map_markers')
                    .update({
                        ...markerData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '更新地图标记失败');
            }
        },

        // 删除标记
        delete: async (id) => {
            try {
                const { error } = await this.supabase
                    .from('map_markers')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { success: true };

            } catch (error) {
                return this.handleError(error, '删除地图标记失败');
            }
        },

        // 批量更新标记
        batchUpdate: async (markers) => {
            try {
                const updates = markers.map(marker => ({
                    ...marker,
                    updated_at: new Date().toISOString()
                }));

                const { data, error } = await this.supabase
                    .from('map_markers')
                    .upsert(updates)
                    .select();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '批量更新标记失败');
            }
        }
    };

    // 系统设置API
    settings = {
        // 获取系统设置
        get: async (key = null) => {
            try {
                let query = this.supabase
                    .from('system_settings')
                    .select('*');

                if (key) {
                    query = query.eq('key', key).single();
                }

                const { data, error } = await query;

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取系统设置失败');
            }
        },

        // 更新系统设置
        update: async (key, value) => {
            try {
                const { data, error } = await this.supabase
                    .from('system_settings')
                    .upsert([{ key, value, updated_at: new Date().toISOString() }])
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '更新系统设置失败');
            }
        },

        // 批量更新设置
        batchUpdate: async (settings) => {
            try {
                const updates = Object.entries(settings).map(([key, value]) => ({
                    key,
                    value,
                    updated_at: new Date().toISOString()
                }));

                const { data, error } = await this.supabase
                    .from('system_settings')
                    .upsert(updates)
                    .select();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '批量更新设置失败');
            }
        }
    };

    // 用户管理API
    users = {
        // 获取所有管理员用户
        getAll: async () => {
            try {
                const { data, error } = await this.supabase
                    .from('admin_users')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '获取用户列表失败');
            }
        },

        // 创建管理员用户
        create: async (userData) => {
            try {
                const { data, error } = await this.supabase
                    .from('admin_users')
                    .insert([{
                        ...userData,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }])
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '创建用户失败');
            }
        },

        // 更新用户
        update: async (id, userData) => {
            try {
                const { data, error } = await this.supabase
                    .from('admin_users')
                    .update({
                        ...userData,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
                return { data };

            } catch (error) {
                return this.handleError(error, '更新用户失败');
            }
        },

        // 删除用户
        delete: async (id) => {
            try {
                const { error } = await this.supabase
                    .from('admin_users')
                    .delete()
                    .eq('id', id);

                if (error) throw error;
                return { success: true };

            } catch (error) {
                return this.handleError(error, '删除用户失败');
            }
        }
    };

    // 文件上传API
    uploads = {
        // 上传文件到腾讯云COS
        toTencentCloud: async (file, path = 'uploads/') => {
            try {
                // 这里应该调用腾讯云COS SDK进行文件上传
                // 返回文件的访问URL
                const fileName = `${path}${Date.now()}_${file.name}`;
                const fileUrl = `https://example.com/${fileName}`;
                
                return { url: fileUrl };

            } catch (error) {
                return this.handleError(error, '文件上传失败');
            }
        },

        // 批量上传文件
        batchUpload: async (files, path = 'uploads/') => {
            try {
                const uploads = await Promise.all(
                    files.map(file => this.toTencentCloud(file, path))
                );
                
                return { urls: uploads.map(u => u.url) };

            } catch (error) {
                return this.handleError(error, '批量上传失败');
            }
        }
    };

    // 实时订阅
    subscribe = {
        // 订阅分类变化
        toCategories: (callback) => {
            return this.supabase
                .channel('categories-changes')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'categories' }, 
                    callback
                )
                .subscribe();
        },

        // 订阅景点变化
        toAttractions: (callback) => {
            return this.supabase
                .channel('attractions-changes')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'attractions' }, 
                    callback
                )
                .subscribe();
        },

        // 订阅文章变化
        toArticles: (callback) => {
            return this.supabase
                .channel('articles-changes')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'articles' }, 
                    callback
                )
                .subscribe();
        }
    };
}

// 创建全局API服务实例
window.apiService = new ApiService();

// 导出API服务
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ApiService;
}