<template>
  <div class="article-list">
    <el-card class="list-card">
      <template #header>
        <div class="card-header">
          <span>攻略管理</span>
          <div class="header-actions">
            <el-button 
              type="primary" 
              @click="$router.push('/articles/create')"
            >
              <el-icon><Plus /></el-icon>
              新建攻略
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 搜索和筛选 -->
      <div class="filter-container">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item label="文章标题">
            <el-input 
              v-model="filterForm.title" 
              placeholder="请输入文章标题" 
              clearable
            />
          </el-form-item>
          
          <el-form-item label="分类">
            <el-select v-model="filterForm.category_id" placeholder="请选择分类" clearable>
              <el-option label="景点" value="1" />
              <el-option label="美食" value="2" />
              <el-option label="住宿" value="3" />
            </el-select>
          </el-form-item>
          
          <el-form-item label="状态">
            <el-select v-model="filterForm.status" placeholder="请选择状态" clearable>
              <el-option label="发布" value="published" />
              <el-option label="草稿" value="draft" />
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
        <el-table-column prop="title" label="文章标题" />
        <el-table-column prop="category_name" label="分类" width="100" />
        <el-table-column prop="views" label="浏览量" width="100" />
        <el-table-column prop="likes" label="点赞数" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status ? 'success' : 'info'">
              {{ scope.row.status ? '发布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              size="small" 
              @click="$router.push(`/articles/edit/${scope.row.id}`)"
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

export default {
  name: 'ArticleList',
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
      title: '',
      category_id: '',
      status: ''
    })
    
    // 获取数据
    const fetchData = async () => {
      loading.value = true
      
      try {
        // 模拟数据
        tableData.value = [
          {
            id: 1,
            title: '西湖十景完整攻略，带你领略杭州最美风光',
            category_name: '景点',
            views: 1250,
            likes: 89,
            status: true,
            created_at: '2024-01-01 12:00:00'
          },
          {
            id: 2,
            title: '杭州美食地图：本地人推荐的10家必吃餐厅',
            category_name: '美食',
            views: 2100,
            likes: 156,
            status: true,
            created_at: '2024-01-02 12:00:00'
          },
          {
            id: 3,
            title: '杭州精品民宿推荐，体验不一样的住宿感受',
            category_name: '住宿',
            views: 890,
            likes: 67,
            status: true,
            created_at: '2024-01-03 12:00:00'
          },
          {
            id: 4,
            title: '河坊街购物攻略：传统与现代的完美融合',
            category_name: '购物',
            views: 1560,
            likes: 98,
            status: false,
            created_at: '2024-01-04 12:00:00'
          }
        ]
        
        pagination.total = tableData.value.length
      } catch (error) {
        ElMessage.error('获取数据失败: ' + error.message)
      } finally {
        loading.value = false
      }
    }
    
    // 搜索
    const handleSearch = () => {
      fetchData()
    }
    
    // 重置
    const handleReset = () => {
      filterForm.title = ''
      filterForm.category_id = ''
      filterForm.status = ''
      fetchData()
    }
    
    // 分页变化
    const handleSizeChange = (val) => {
      pagination.pageSize = val
      fetchData()
    }
    
    const handleCurrentChange = (val) => {
      pagination.currentPage = val
      fetchData()
    }
    
    // 删除
    const handleDelete = (row) => {
      ElMessageBox.confirm(
        `确定要删除文章 "${row.title}" 吗？`,
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).then(() => {
        // 模拟删除操作
        ElMessage.success('删除成功')
        fetchData()
      }).catch(() => {
        // 用户取消删除
      })
    }
    
    onMounted(() => {
      fetchData()
    })
    
    return {
      loading,
      tableData,
      pagination,
      filterForm,
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
.article-list {
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