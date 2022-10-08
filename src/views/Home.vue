<template>
  <div>
    <h1>首页</h1>
    <ul class="links">
      <li>
        <router-link to="/list" @click="removeCacheBeforeEnter">keep-alive 缓存（点击链接时清空缓存）</router-link>
      </li>
      <li>
        <router-link to="/list1">keep-alive 缓存2（进入页面后清空缓存）</router-link>
      </li>
      <li>
        <router-link to="/list3">状态存储实现缓存</router-link>
      </li>
      <li>
        <router-link to="/list2">父子路由实现缓存</router-link>
      </li>
      <li>
        <router-link to="/list4">页面弹窗实现缓存</router-link>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import useRouteCache from '@/hooks/useRouteCache'

defineOptions({
  name: 'Home'
})

const { removeCacheEntry } = useRouteCache()

// 进入页面前，先清除缓存实例
function removeCacheBeforeEnter () {
  removeCacheEntry('List')
}
</script>

<style lang='less' scoped>
.links li {
  margin-top: 20px;
}
</style>