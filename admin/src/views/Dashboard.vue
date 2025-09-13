<template>
  <div class="dashboard">
    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #5ab1ef">
              <el-icon><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.articles }}</div>
              <div class="stat-label">攻略文章</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #ffb980">
              <el-icon><Location /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.attractions }}</div>
              <div class="stat-label">景点数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #d87a80">
              <el-icon><Collection /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.categories }}</div>
              <div class="stat-label">分类数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #2ec7c9">
              <el-icon><Guide /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.routes }}</div>
              <div class="stat-label">路线数量</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="20" class="content-row">
      <el-col :span="16">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span>数据统计</span>
            </div>
          </template>
          <div class="chart-container">
            <div class="chart-placeholder">
              <el-icon size="48"><DataLine /></el-icon>
              <p>数据图表展示区域</p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :span="8">
        <el-card class="quick-actions">
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="actions-container">
            <el-button 
              type="primary" 
              @click="$router.push('/articles/create')"
              class="action-button"
            >
              <el-icon><Plus /></el-icon>
              新建攻略
            </el-button>
            
            <el-button 
              type="success" 
              @click="$router.push('/attractions/create')"
              class="action-button"
            >
              <el-icon><Plus /></el-icon>
              新建景点
            </el-button>
            
            <el-button 
              type="warning" 
              @click="$router.push('/categories/create')"
              class="action-button"
            >
              <el-icon><Plus /></el-icon>
              新建分类
            </el-button>
            
            <el-button 
              type="info" 
              @click="$router.push('/routes/create')"
              class="action-button"
            >
              <el-icon><Plus /></el-icon>
              新建路线
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { 
  Document, 
  Location, 
  Collection, 
  Guide,
  DataLine,
  Plus
} from '@element-plus/icons-vue'

export default {
  name: 'Dashboard',
  components: {
    Document,
    Location,
    Collection,
    Guide,
    DataLine,
    Plus
  },
  
  setup() {
    const stats = ref({
      articles: 0,
      attractions: 0,
      categories: 0,
      routes: 0
    })
    
    const fetchStats = async () => {
      // 模拟获取统计数据
      stats.value = {
        articles: 24,
        attractions: 18,
        categories: 5,
        routes: 7
      }
    }
    
    onMounted(() => {
      fetchStats()
    })
    
    return {
      stats
    }
  }
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon .el-icon {
  font-size: 24px;
  color: white;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.chart-card,
.quick-actions {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.card-header {
  font-weight: bold;
  font-size: 16px;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  text-align: center;
  color: #999;
}

.chart-placeholder .el-icon {
  margin-bottom: 10px;
}

.actions-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.action-button {
  width: 100%;
  height: 50px;
  font-size: 14px;
}

.action-button .el-icon {
  margin-right: 5px;
}
</style>