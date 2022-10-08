<template>
  <div>
    <el-page-header @back="goBack">
      <template #content>详情页</template>
    </el-page-header>
    
    <br>
    <hr>
    <br>
    <p>id: {{row?.id}}</p>
    <p>内容: {{row?.content}}</p>
    <br>
    <hr>
    <br>
    <p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p><p>占位符</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Item { 
  id?: number, 
  content?: string 
}

const router = useRouter()
const route = useRoute()

const row = computed<Item>(() => {
  const data = route.query.data
  if (!Array.isArray(data)) {
    try {
      return data ? JSON.parse(data) : {}
    } catch (err) {
      console.error(err)
    }
  }
  return {}
})

function goBack () {
  router.back()
}
</script>

<style lang='less' scoped>
</style>