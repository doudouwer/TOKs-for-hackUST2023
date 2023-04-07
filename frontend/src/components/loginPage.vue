<template>
  <h1>Welcome to TOKs</h1>
  <div class="container">
  <el-card :body-style="{ padding: '50px' }" class="box-card">
    <img
        src="../../public/logo.jpg"
        class="image"
    />
    <div style="padding: 20px">
      <el-button type="primary" @click="connectWeb3Modal">login with MetaMask!</el-button>
    </div>
  </el-card>
  </div>
</template>

<script>
import { mapGetters,mapActions } from "vuex";

export default {
  name: "loginPage",
  computed: {
    ...mapGetters("accounts", ["getActiveAccount", "isUserConnected", "getWeb3Modal"]),
  },
  methods: {
    initializeAccounts() {
      this.$store.dispatch("accounts/initWeb3Modal");
      this.$store.dispatch("accounts/ethereumListener");
    },
    ...mapActions("accounts", ["connectWeb3Modal", "disconnectWeb3Modal"]),
  },
  created() {
    this.initializeAccounts();
  }
}
</script>

<style scoped>
h1 {
  font-size: 100px;
  font-weight: bold;
  text-align: center;
  margin: 20px 0;
}

.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 600px;
}

el-card{
  height:50px;
  weight:50px;
}

.image {
  width: 100%;
  display: block;
}

.box-card {
  width: 500px;
}
</style>