// Supabase数据库表结构查询脚本
// 用于查询和总结当前项目的所有表信息

// 确保Supabase客户端已初始化
async function waitForSupabase() {
    return new Promise((resolve) => {
        const checkSupabase = () => {
            if (window.supabaseClient) {
                resolve(window.supabaseClient);
            } else {
                setTimeout(checkSupabase, 100);
            }
        };
        checkSupabase();
    });
}

// 查询所有表信息
async function queryAllTables() {
    try {
        const supabase = await waitForSupabase();
        
        // 查询所有表的元数据
        const { data: tables, error } = await supabase
            .from('information_schema.tables')
            .select('table_name, table_type')
            .eq('table_schema', 'public')
            .order('table_name');
            
        if (error) throw error;
        
        console.log('=== 数据库表结构总结 ===');
        console.log('总表数量:', tables.length);
        console.log('');
        
        // 按表名排序并显示
        const sortedTables = tables.sort((a, b) => a.table_name.localeCompare(b.table_name));
        
        for (const table of sortedTables) {
            console.log(`表名: ${table.table_name}`);
            console.log(`类型: ${table.table_type}`);
            
            // 查询表的列信息
            try {
                const { data: columns, error: columnsError } = await supabase
                    .from('information_schema.columns')
                    .select('column_name, data_type, is_nullable')
                    .eq('table_schema', 'public')
                    .eq('table_name', table.table_name)
                    .order('ordinal_position');
                    
                if (!columnsError && columns) {
                    console.log('列信息:');
                    columns.forEach(col => {
                        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`);
                    });
                }
            } catch (colError) {
                console.log('无法获取列信息:', colError.message);
            }
            
            console.log('---');
        }
        
        return tables;
    } catch (error) {
        console.error('查询表信息失败:', error);
        throw error;
    }
}

// 查询特定表的数据行数
async function getTableRowCounts() {
    const supabase = await waitForSupabase();
    
    // 项目中定义的主要表
    const tableNames = [
        'categories',
        'attractions',
        'routes',
        'articles',
        'admin_users',
        'user_profiles',
        'user_favorites',
        'reviews',
        'system_settings',
        'map_markers'
    ];
    
    console.log('=== 表数据统计 ===');
    
    for (const tableName of tableNames) {
        try {
            const { count, error } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });
                
            if (!error) {
                console.log(`${tableName}: ${count || 0} 条记录`);
            } else {
                console.log(`${tableName}: 无法查询 (表可能不存在)`);
            }
        } catch (error) {
            console.log(`${tableName}: 查询失败 - ${error.message}`);
        }
    }
}

// 执行查询
async function runSummary() {
    console.log('开始查询Supabase数据库表结构...');
    
    try {
        await queryAllTables();
        console.log('');
        await getTableRowCounts();
        console.log('');
        console.log('=== 查询完成 ===');
    } catch (error) {
        console.error('执行查询时出错:', error);
    }
}

// 如果在浏览器环境中，直接执行
if (typeof window !== 'undefined') {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runSummary);
    } else {
        runSummary();
    }
}

// 如果作为模块导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { queryAllTables, getTableRowCounts, runSummary };
}