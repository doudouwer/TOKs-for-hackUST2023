import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import loginPage from '../components/loginPage.vue';
import createProduct from '../components/createProduct.vue';
import collectionList from '../components/collectionList.vue';
import goodsList from "@/components/goodsList.vue";
import redeemList from "@/components/redeemList.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path:'/',
    name: '',
    component: loginPage
  },
  {
    path: '/createProduct',
    name: 'createProduct',
    component: createProduct
  },
  {
    path: '/collectionList',
    name: 'collectionList',
    component: collectionList
  },
  {
    path: '/goodsList',
    name: 'goodsList',
    component: goodsList
  },
  {
    path: '/redeemList',
    name: 'redeemList',
    component: redeemList
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
