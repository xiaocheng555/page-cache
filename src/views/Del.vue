<template>
  <div>
    <el-page-header @back="goBack">
      <template #content>清除 keep-alive 缓存</template>
    </el-page-header>
    <br>
    <br>
    <el-button type="primary" @click="clear">清除keep-alive缓存的路由组件</el-button>
  </div>
</template>

<script setup lang="ts">
import useRouteCache from '@/hooks/useRouteCache'
import { useRouter } from 'vue-router'

const { removeCacheEntry } = useRouteCache()

const router = useRouter()
function goBack () {
  router.back()
}

function clear () {
  removeCacheEntry('List')
  removeCacheEntry('List1')
  alert('ok')
}
</script>

<style lang='less' scoped>
</style>