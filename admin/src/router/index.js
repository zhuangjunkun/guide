import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/views/Login.vue'
import Layout from '@/views/Layout.vue'
import Dashboard from '@/views/Dashboard.vue'
import CategoryList from '@/views/category/List.vue'
import CategoryCreate from '@/views/category/Create.vue'
import CategoryEdit from '@/views/category/Edit.vue'
import AttractionList from '@/views/attraction/List.vue'
import AttractionCreate from '@/views/attraction/Create.vue'
import AttractionEdit from '@/views/attraction/Edit.vue'
import ArticleList from '@/views/article/List.vue'
import ArticleCreate from '@/views/article/Create.vue'
import ArticleEdit from '@/views/article/Edit.vue'
import MapConfig from '@/views/map/Config.vue'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    component: Layout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: Dashboard
      },
      {
        path: 'categories',
        name: 'CategoryList',
        component: CategoryList
      },
      {
        path: 'categories/create',
        name: 'CategoryCreate',
        component: CategoryCreate
      },
      {
        path: 'categories/edit/:id',
        name: 'CategoryEdit',
        component: CategoryEdit,
        props: true
      },
      {
        path: 'attractions',
        name: 'AttractionList',
        component: AttractionList
      },
      {
        path: 'attractions/create',
        name: 'AttractionCreate',
        component: AttractionCreate
      },
      {
        path: 'attractions/edit/:id',
        name: 'AttractionEdit',
        component: AttractionEdit,
        props: true
      },
      {
        path: 'articles',
        name: 'ArticleList',
        component: ArticleList
      },
      {
        path: 'articles/create',
        name: 'ArticleCreate',
        component: ArticleCreate
      },
      {
        path: 'articles/edit/:id',
        name: 'ArticleEdit',
        component: ArticleEdit,
        props: true
      },
      {
        path: 'map',
        name: 'MapConfig',
        component: MapConfig
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 简单的路由守卫
router.beforeEach((to, from, next) => {
  // 检查是否需要认证
  if (to.meta.requiresAuth !== false) {
    // 检查是否有简单的认证token
    const isAuthenticated = localStorage.getItem('admin_token') && localStorage.getItem('admin_user');
    if (!isAuthenticated) {
      next('/login');
    } else {
      next();
    }
  } else {
    // 不需要认证的页面（如登录页）
    const isAuthenticated = localStorage.getItem('admin_token') && localStorage.getItem('admin_user');
    if (to.name === 'Login' && isAuthenticated) {
      // 如果已登录且访问登录页，则重定向到首页
      next('/');
    } else {
      next();
    }
  }
})

export default router