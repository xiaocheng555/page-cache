import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('./views/Home.vue')
  },
  {
    path: '/list',
    name: 'list',
    component: () => import('./views/List.vue')
  },
  {
    path: '/list1',
    name: 'list1',
    component: () => import('./views/List1.vue')
  },
  {
    path: '/list2',
    name: 'list2',
    component: () => import('./views/List2.vue'),
    meta: {
      title: '父子路由实现缓存'
    },
    children: [
      {
        path: '/detail2',
        name: 'detail2',
        component: () => import('./views/Detail.vue'),
      }
    ]
  },
  {
    path: '/list3',
    name: 'list3',
    component: () => import('./views/List3.vue')
  },
  {
    path: '/list4',
    name: 'list4',
    component: () => import('./views/List4.vue')
  },
  {
    path: '/detail',
    name: 'detail',
    component: () => import('./views/Detail.vue')
  },
  {
    path: '/del',
    name: 'del',
    component: () => import('./views/Del.vue')
  }
]

export default createRouter({
  history: createWebHashHistory(),
  routes
})