<template #default="scope">
  <p>Manage Redemption Task</p>
  <el-table :data="tableData" style="width:100%">
    <el-table-column type="index" width="50"></el-table-column>
    <el-table-column label="Picture" width="100">
      <template #default="{ row }">
        <el-image :src="row.image" :fit="'cover'" style="width: 100%; height: 100%;"></el-image>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="Name" width="180"></el-table-column>
    <el-table-column prop="description" label="Description" width="180"></el-table-column>
    <el-table-column prop="created_at" label="Created Time" width="180"></el-table-column>
    <el-table-column label="Redemption Status">
      <template #default="scope">
        <el-button v-if="!tableData[scope.$index].waitSign" type="primary" @click="allowRedemption(scope.$index)">Allow Redemption</el-button>
        <el-tag v-if="tableData[scope.$index].waitSign&&tableData[scope.$index].redemptionStatus != 2">Waiting for buyer's signature</el-tag>
        <el-tag v-if="tableData[scope.$index].redemptionStatus == 2">Signature verified successfully, please deliver.</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="Operation">
      <template #default="scope">
        <el-button @click="getTokenUri(scope.$index)">Get Tokenuri</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { server } from '@/utils/helpers';
import {mapState, useStore} from "vuex";
import accounts from "@/store/modules/accounts";
import {ethers} from "ethers";

export default {
  name: "redeemList",
  computed: {
  ...mapState(['accounts'])
  },
  setup() {
    interface Product
    {
      name: string;
      description: string;
      image: string;
      nftAddress: string;
      id: string;
      created_at: string;
      tokenId:number;
      waitSign:boolean;
      redeemStatus:number
    }
    interface TableData{
      image: string;
      name: string;
      description: string;
      created_at: string;
      redemptionStatus:number,
      waitSign:boolean
    }

    const products = ref<Product[]>([]);
    const count = ref(0);
    const tableData = ref<TableData[]>([]);
    const load = () => {
      if(count.value<=products.value.length)
      {
        count.value++;
      }
    }

    const getRedeemList = async () => {
      try {
        const activeAccount = accounts.state.activeAccount;
        const response = await axios.get(server.baseURL+"/good/redeemList/"+activeAccount);
        products.value = response.data;
        console.log(products.value);
        for(let i = 0;i<products.value.length;i++)
        {
          products.value[i].waitSign = false;
          if(response.data[i].messageToSign!=null)
          {
            products.value[i].waitSign = true;
          }
        }
        for(let i = 0;i<products.value.length;i++)
        {
          let data:TableData = {
            image:'',
            name:'',
            description:'',
            created_at:'',
            redemptionStatus:0,
            waitSign:false
          };
          data.image = products.value[i].image;
          data.name = products.value[i].name;
          data.description = products.value[i].description;
          const date = new Date(products.value[i].created_at)
          data.created_at = date.toDateString();
          data.waitSign = products.value[i].waitSign
          tableData.value.push(data);
        }
      }
      catch (error){
        console.error(error);
      }
    };

    const allowRedemption = async (index:number)=>{
      const activeAccount = accounts.state.activeAccount;
      const bodyData = {
        nftAddress:products.value[index].nftAddress,
        tokenId:products.value[index].tokenId
      }
      try{
        const response = await axios.post(server.baseURL+"/good/redeemList/generateMessageToSign/",bodyData);
        products.value[index].waitSign = true;
      }
      catch (error){
        console.error(error);
      }
    }

    getRedeemList();
    return {
      products,
      count,
      load,
      allowRedemption,
      tableData
    }
  }
}
</script>

<style scoped>
.infinite-list {
  height: 600px;
  padding: 0;
  margin: 0;
  list-style: none;
}
.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 50px;
  background: var(--el-color-primary-light-9);
  margin: 10px;
  color: var(--el-color-primary);
}
.infinite-list .infinite-list-item + .list-item {
  margin-top: 10px;
}
</style>