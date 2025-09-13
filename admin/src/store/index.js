import { defineStore, createPinia } from 'pinia'

// 创建 Pinia 实例
export const pinia = createPinia()

// 定义 store
export const useStore = defineStore('main', {
  state: () => ({
    user: null,
    sidebarCollapsed: false
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.user,
    userInfo: (state) => state.user
  },
  
  actions: {
    setUser(user) {
      this.user = user
    },
    
    logout() {
      this.user = null
      localStorage.removeItem('admin_token')
    },
    
    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
    }
  }
})

// 导出默认的 Pinia 实例
export default pinia