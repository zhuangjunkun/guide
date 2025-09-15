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
              <span>详细统计</span>
            </div>
          </template>
          <div class="detailed-stats">
            <el-row :gutter="15">
              <el-col :span="8">
                <div class="detail-stat">
                  <div class="detail-number">{{ stats.publishedArticles }}</div>
                  <div class="detail-label">已发布文章</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-stat">
                  <div class="detail-number">{{ stats.activeAttractions }}</div>
                  <div class="detail-label">活跃景点</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="detail-stat">
                  <div class="detail-number">{{ stats.activeRoutes }}</div>
                  <div class="detail-label">活跃路线</div>
                </div>
              </el-col>
            </el-row>
            
            <div class="recent-section" v-if="recentData.articles.length > 0">
              <h4>最新文章</h4>
              <div class="recent-list">
                <div 
                  v-for="article in recentData.articles.slice(0, 3)" 
                  :key="article.id"
                  class="recent-item"
                >
                  <div class="recent-info">
                    <div class="recent-title">{{ article.title }}</div>
                    <div class="recent-meta">
                      <span>{{ article.author }}</span>
                      <span class="recent-date">{{ formatDate(article.created_at) }}</span>
                    </div>
                  </div>
                  <el-tag 
                    :type="article.is_published ? 'success' : 'info'"
                    size="small"
                  >
                    {{ article.is_published ? '已发布' : '草稿' }}
                  </el-tag>
                </div>
              </div>
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
        
        <el-card class="recent-attractions" style="margin-top: 20px;" v-if="recentData.attractions.length > 0">
          <template #header>
            <div class="card-header">
              <span>最新景点</span>
            </div>
          </template>
          <div class="attractions-list">
            <div 
              v-for="attraction in recentData.attractions.slice(0, 3)" 
              :key="attraction.id"
              class="attraction-item"
            >
              <div class="attraction-image">
                <img 
                  :src="attraction.image || 'https://via.placeholder.com/60x60'" 
                  :alt="attraction.name"
                />
              </div>
              <div class="attraction-info">
                <div class="attraction-name">{{ attraction.name }}</div>
                <div class="attraction-date">{{ formatDate(attraction.created_at) }}</div>
              </div>
              <el-tag 
                :type="attraction.is_active ? 'success' : 'danger'"
                size="small"
              >
                {{ attraction.is_active ? '启用' : '禁用' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Document, 
  Location, 
  Collection, 
  Guide,
  DataLine,
  Plus
} from '@element-plus/icons-vue'
import { StatsService } from '@/services/stats'

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
      routes: 0,
      activeAttractions: 0,
      publishedArticles: 0,
      activeRoutes: 0
    })
    
    const recentData = ref({
      categories: [],
      attractions: [],
      articles: [],
      routes: []
    })
    
    const loading = ref(false)
    
    const fetchStats = async () => {
      loading.value = true
      try {
        const result = await StatsService.getDashboardStats()
        if (result.success) {
          stats.value = result.data
        } else {
          ElMessage.error(result.message || '获取统计数据失败')
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
        ElMessage.error('获取统计数据失败')
      } finally {
        loading.value = false
      }
    }
    
    const fetchRecentData = async () => {
      try {
        const result = await StatsService.getRecentData()
        if (result.success) {
          recentData.value = result.data
        }
      } catch (error) {
        console.error('获取最近数据失败:', error)
      }
    }
    
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('zh-CN', {
        month: '2-digit',
        day: '2-digit'
      })
    }
    
    onMounted(() => {
      fetchStats()
      fetchRecentData()
    })
    
    return {
      stats,
      recentData,
      loading,
      formatDate
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

.detailed-stats {
  padding: 20px 0;
}

.detail-stat {
  text-align: center;
  padding: 20px;
  border-radius: 8px;
  background: #f8f9fa;
}

.detail-number {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.detail-label {
  font-size: 14px;
  color: #666;
}

.recent-section {
  margin-top: 30px;
}

.recent-section h4 {
  margin: 0 0 15px 0;
  color: #333;
  font-size: 16px;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;
}

.recent-info {
  flex: 1;
}

.recent-title {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  font-weight: 500;
}

.recent-meta {
  font-size: 12px;
  color: #999;
  display: flex;
  gap: 10px;
}

.recent-date {
  color: #666;
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

.recent-attractions {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.attractions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.attraction-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background: #fff;
}

.attraction-image {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.attraction-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.attraction-info {
  flex: 1;
}

.attraction-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  font-weight: 500;
}

.attraction-date {
  font-size: 12px;
  color: #999;
}
</style>