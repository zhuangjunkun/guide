<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>旅游导览管理后台</h2>
        <p>请使用管理员账户登录</p>
      </div>
      
      <el-form 
        ref="loginFormRef"
        :model="loginForm" 
        :rules="loginRules" 
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            clearable
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            type="password"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button
            type="primary"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { supabase, TABLES } from '@/utils/supabase.js'

export default {
  name: 'Login',
  components: {
    User,
    Lock
  },
  
  setup() {
    const router = useRouter()
    const loginFormRef = ref(null)
    
    const loginForm = reactive({
      username: 'admin',
      password: 'admin123'
    })
    
    const loginRules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 3, message: '用户名长度不能少于3位', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 3, message: '密码长度不能少于3位', trigger: 'blur' }
      ]
    }
    
    const loading = ref(false)
    
    // 处理登录
    const handleLogin = async () => {
      if (!loginFormRef.value) return;
      
      await loginFormRef.value.validate(async (valid) => {
        if (valid) {
          loading.value = true;
          
          try {
            // 查询数据库中的用户
            const { data: users, error } = await supabase
              .from(TABLES.ADMIN_USERS)
              .select('*')
              .eq('username', loginForm.username)
              .eq('is_active', true)
              .single();
            
            if (error || !users) {
              ElMessage.error('用户名或密码错误');
              loading.value = false;
              return;
            }
            
            // 简单的密码验证（这里我们直接比较明文密码，仅用于演示）
            // 在实际应用中，应该使用安全的密码哈希比较
            if (loginForm.password !== 'admin123') {
              ElMessage.error('用户名或密码错误');
              loading.value = false;
              return;
            }
            
            // 登录成功
            // 保存用户信息到localStorage
            const userData = {
              id: users.id,
              username: users.username,
              email: users.email,
              full_name: users.full_name,
              role: users.role,
              is_active: users.is_active
            };
            
            localStorage.setItem('admin_user', JSON.stringify(userData));
            localStorage.setItem('admin_token', 'simple_auth_token');
            
            ElMessage.success('登录成功');
            
            // 跳转到首页
            setTimeout(() => {
              router.push('/');
            }, 1000);
          } catch (error) {
            ElMessage.error('登录失败：' + (error.message || '未知错误'));
          } finally {
            loading.value = false;
          }
        } else {
          ElMessage.warning('请正确填写登录信息');
        }
      });
    }
    
    return {
      loginFormRef,
      loginForm,
      loginRules,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

.login-form {
  margin-top: 30px;
}

.login-button {
  width: 100%;
}
</style>