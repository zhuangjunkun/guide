<template>
  <div class="data-table">
    <el-table 
      :data="data" 
      v-loading="loading"
      stripe 
      style="width: 100%"
      v-bind="$attrs"
    >
      <slot></slot>
    </el-table>
    
    <!-- 分页 -->
    <div class="pagination-container" v-if="showPagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :page-sizes="pageSizes"
        :total="pagination.total"
        :layout="paginationLayout"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script>
import { defineComponent, reactive, watch } from 'vue'

export default defineComponent({
  name: 'DataTable',
  inheritAttrs: false,
  props: {
    data: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    pagination: {
      type: Object,
      default: () => ({
        currentPage: 1,
        pageSize: 10,
        total: 0
      })
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    }
  },
  
  emits: ['update:pagination', 'size-change', 'current-change'],
  
  setup(props, { emit }) {
    // 监听分页变化
    const handleSizeChange = (val) => {
      const newPagination = {
        ...props.pagination,
        pageSize: val
      }
      emit('update:pagination', newPagination)
      emit('size-change', val)
    }
    
    const handleCurrentChange = (val) => {
      const newPagination = {
        ...props.pagination,
        currentPage: val
      }
      emit('update:pagination', newPagination)
      emit('current-change', val)
    }
    
    return {
      handleSizeChange,
      handleCurrentChange
    }
  }
})
</script>

<style scoped>
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>