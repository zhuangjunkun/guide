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
import RouteList from '@/views/route/List.vue'
import RouteCreate from '@/views/route/Create.vue'
import RouteEdit from '@/views/route/Edit.vue'
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
        path: 'routes',
        name: 'RouteList',
        component: RouteList
      },
      {
        path: 'routes/create',
        name: 'RouteCreate',
        component: RouteCreate
      },
      {
        path: 'routes/edit/:id',
        name: 'RouteEdit',
        component: RouteEdit,
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

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('admin_token')
  
  // 如果访问登录页
  if (to.name === 'Login') {
    // 如果已经认证，则重定向到首页
    if (isAuthenticated) {
      next('/')
    } else {
      // 否则允许访问登录页
      next()
    }
  } 
  // 如果访问需要认证的页面
  else if (to.meta.requiresAuth !== false && !isAuthenticated) {
    // 如果未认证，重定向到登录页
    next('/login')
  } 
  // 其他情况，正常访问
  else {
    next()
  }
})

export default router