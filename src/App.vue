<template>
  <div class="app">
    <router-view style="margin-top: 20px;" v-slot="{ Component }">
      <keep-alive :include="caches">
        <component :is="Component" />
      </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import useRouteCache from './hooks/useRouteCache'
const { caches, addCache } = useRouteCache()

addCache(['List', 'List1'])
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
.app {
  padding: 10px;
}
</style>