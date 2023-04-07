<template>
  <div class="common-layout">
    <el-container>
        <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
          <el-tab-pane v-if="!isUserConnected" label="Login in!" name="first"/>
          <el-tab-pane v-if="isUserConnected" label="Disconnect" name="second" @click="disconnectWeb3Modal"/>
          <el-tab-pane label="Create" name="third"/>
          <el-tab-pane label="Collection List" name="forth"/>
          <el-tab-pane label="Good List" name="fifth"/>
          <el-tab-pane label="Redemption List" name="sixth"/>
        </el-tabs>
    </el-container>
  </div>
</template>

<script lang="ts">
import { ref } from 'vue';
import type { TabsPaneContext } from 'element-plus';
import router from '../router/index';
import { mapGetters, mapActions } from "vuex";

export default {
  name: "navBar",
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "isUserConnected", "getWeb3Modal"]),
  },
  methods: {
    ...mapActions("accounts", ["connectWeb3Modal", "disconnectWeb3Modal"]),
  },
  setup() {
    const activeName = ref('first');

    const handleClick = (tab: TabsPaneContext) => {
      //activeName.value = tab.paneName;
      switch (tab.paneName) {
        case 'first':
          router.push('/');
          break;
        case 'second':
          router.push('/');
          break;
        case 'third':
          router.push('/createProduct');
          break;
        case 'forth':
          router.push('/collectionList');
          break;
        case 'fifth':
          router.push('/goodsList');
          break;
        case 'sixth':
          router.push('/redeemList');
          break;
      }
    };

    return {
      activeName,
      handleClick
    }
  }
}
</script>

<style scoped>
nav {
  background-color: #6fb1f6;  /* 设置背景颜色为蓝色 */
  height: 100px;  /* 设置导航栏高度 */
  display: flex;  /* 使用 flex 布局 */
  justify-content: center;  /* 将导航栏居中对齐 */
  align-items: center;
  color: white;
}

.nav-list {
  list-style: none;  /* 去掉列表样式 */
  margin: 0;
  padding: 0;
  display: flex;  /* 使用 flex 布局 */
}

.nav-item {
  margin-right: 20px;  /* 设置列表项之间的间距 */
}
router-link {
  color: #ffffff;  /* 设置链接文字颜色为白色 */
  text-decoration: none;  /* 去掉下划线 */
  padding: 10px;  /* 设置链接内边距 */
  display: block;  /* 将链接变成块级元素 */
}

.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}

</style>