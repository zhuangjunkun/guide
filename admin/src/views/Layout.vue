<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside 
      :width="sidebarCollapsed ? '64px' : '220px'" 
      class="sidebar"
    >
      <div class="sidebar-logo">
        <img src="/logo.png" alt="Logo" v-if="!sidebarCollapsed">
        <span v-else>TG</span>
      </div>
      
      <el-menu
        :default-active="$route.path"
        :collapse="sidebarCollapsed"
        router
        class="sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        
        <el-sub-menu index="content">
          <template #title>
            <el-icon><Document /></el-icon>
            <span>内容管理</span>
          </template>
          <el-menu-item index="/categories">分类管理</el-menu-item>
          <el-menu-item index="/attractions">景点管理</el-menu-item>
          <el-menu-item index="/articles">攻略管理</el-menu-item>
          <el-menu-item index="/routes">路线管理</el-menu-item>
        </el-sub-menu>
        
        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          <el-menu-item index="/map">地图配置</el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>
    
    <!-- 主内容区 -->
    <el-container>
      <!-- 头部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-button 
            :icon="sidebarCollapsed ? 'Expand' : 'Fold'" 
            @click="toggleSidebar"
            circle
            plain
          />
        </div>
        
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-info">
              <el-avatar :size="32" icon="User" />
              <span class="username">管理员</span>
            </span>
            
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      
      <!-- 页面内容 -->
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { computed } from 'vue'
import { useStore } from '@/store'
import { useRouter } from 'vue-router'
import { 
  House, 
  Document, 
  Setting, 
  Expand, 
  Fold,
  User
} from '@element-plus/icons-vue'

export default {
  name: 'Layout',
  components: {
    House,
    Document,
    Setting,
    Expand,
    Fold,
    User
  },
  
  setup() {
    const router = useRouter()
    const store = useStore()
    
    const sidebarCollapsed = computed(() => store.sidebarCollapsed)
    
    const toggleSidebar = () => {
      store.toggleSidebar()
    }
    
    const handleCommand = (command) => {
      if (command === 'logout') {
        store.logout()
        router.push('/login')
      } else if (command === 'profile') {
        // 跳转到个人资料页面
      }
    }
    
    return {
      sidebarCollapsed,
      toggleSidebar,
      handleCommand
    }
  }
}
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background: #2c3e50;
  transition: width 0.3s ease;
  overflow: hidden;
}

.sidebar-logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #425669;
  color: white;
  font-size: 20px;
  font-weight: bold;
}

.sidebar-logo img {
  height: 32px;
  margin-right: 10px;
}

.sidebar-menu {
  border: none;
  height: calc(100% - 60px);
}

.sidebar :deep(.el-menu) {
  background: #2c3e50;
  border: none;
}

.sidebar :deep(.el-menu-item),
.sidebar :deep(.el-sub-menu__title) {
  color: #b8c7ce;
}

.sidebar :deep(.el-menu-item:hover),
.sidebar :deep(.el-sub-menu__title:hover) {
  background: #223141 !important;
  color: #fff !important;
}

.sidebar :deep(.el-menu-item.is-active) {
  background: #425669 !important;
  color: #fff !important;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}

.header-left {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 10px;
  font-size: 14px;
  color: #333;
}

.main {
  background: #f5f5f5;
  padding: 20px;
  overflow: auto;
}
</style>