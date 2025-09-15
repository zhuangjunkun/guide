<template>
  <div class="attraction-list">
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>景点管理</span>
          <div class="header-actions">
            <el-button 
              type="primary" 
              @click="$router.push('/attractions/create')"
            >
              <el-icon><Plus /></el-icon>
              新建景点
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="景点名称">
            <el-input 
              v-model="filterForm.name" 
              placeholder="请输入景点名称" 
              clearable
            />
          </el-form-item>
          
          <el-form-item label="分类">
            <el-select v-model="filterForm.category_id" placeholder="请选择分类" clearable>
              <el-option 
                v-for="category in categories" 
                :key="category.id" 
                :label="category.name" 
                :value="category.id" 
              />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
              <el-option label="启用" value="true" />
              <el-option label="禁用" value="false" />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 数据表格 -->
      <el-table 
        :data="tableData" 
        v-loading="loading"
        stripe 
        style="width: 100%"
      >
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="景点名称" />
        <el-table-column prop="category_name" label="分类" width="100" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="rating" label="评分" width="100">
          <template #default="scope">
            <el-rate 
              v-model="scope.row.rating" 
              disabled 
              show-score 
              text-color="#ff9900" 
              score-template="{value}"
            />
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'danger'">
              {{ scope.row.status ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              @click="$router.push(`/attractions/edit/${scope.row.id}`)"
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              @click="handleDelete(scope.row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { AttractionService } from '@/services/attraction'
import { CategoryService } from '@/services/category'

export default {
  name: 'AttractionList',
  components: {
    Plus
  },
  
  setup() {
    const router = useRouter()
    const loading = ref(false)
    
    // 表格数据
    const tableData = ref([])
    
    // 分页
    const pagination = reactive({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    // 搜索表单
    const filterForm = reactive({
      name: '',
      category_id: '',
      status: ''
    })
    
    // 分类列表
    const categories = ref([])
    
    // 获取分类数据
    const fetchCategories = async () => {
      try {
        const result = await CategoryService.getAll()
        if (result.success) {
          categories.value = result.data
        }
      } catch (error) {
        console.error('获取分类失败:', error)
      }
    }
    
    // 获取数据
    const fetchData = async () => {
      loading.value = true
      
      try {
        const filters = {}
        if (filterForm.name) {
          filters.name = filterForm.name
        }
        if (filterForm.category_id) {
          filters.category_id = filterForm.category_id
        }
        if (filterForm.status !== '') {
          filters.is_active = filterForm.status === 'true'
        }
        
        const result = await AttractionService.getAll(filters, {
          page: pagination.currentPage,
          limit: pagination.pageSize
        })
        
        if (result.success) {
          tableData.value = result.data.map(item => ({
            ...item,
            category_name: categories.value.find(cat => cat.id === item.category_id)?.name || '未分类',
            status: item.is_active,
            rating: item.rating || 0,
            created_at: new Date(item.created_at).toLocaleString()
          }))
          pagination.total = result.total || result.data.length
        } else {
          ElMessage.error(result.message || '获取数据失败')
        }
      } catch (error) {
        console.error('获取数据失败:', error)
        ElMessage.error('获取数据失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    // 搜索
    const handleSearch = () => {
      pagination.currentPage = 1
      fetchData()
    }
    
    // 重置
    const handleReset = () => {
      filterForm.name = ''
      filterForm.category_id = ''
      filterForm.status = ''
      pagination.currentPage = 1
      fetchData()
    }
    
    // 分页变化
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      pagination.currentPage = 1
      fetchData()
    }
    
    const handleCurrentChange = (val) => {
      pagination.currentPage = val
      fetchData()
    }
    
    // 删除
    const handleDelete = async (row) => {
      try {
        await ElMessageBox.confirm(
          `确定要删除景点 "${row.name}" 吗？`,
          '确认删除',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        
        const result = await AttractionService.delete(row.id)
        if (result.success) {
          ElMessage.success('删除成功')
          fetchData()
        } else {
          ElMessage.error(result.message || '删除失败')
        }
      } catch (error) {
        if (error !== 'cancel') {
          console.error('删除失败:', error)
          ElMessage.error('删除失败')
        }
      }
    }
    
    onMounted(() => {
      fetchCategories()
      fetchData()
    })
    
    return {
      loading,
      tableData,
      pagination,
      filterForm,
      categories,
      fetchCategories,
      handleSearch,
      handleReset,
      handleSizeChange,
      handleCurrentChange,
      handleDelete
    }
  }
}
</script>

<style scoped>
.attraction-list {
  padding: 20px;
}

.list-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filter-container {
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>