<template #default="scope" >
    <p>All the collection you have created</p>
    <el-table :data="tableData" style="width:100%" v-loading="loading">
      <el-table-column type="index" width="50"></el-table-column>
      <el-table-column label="Picture" width="100">
        <template #default="{ row }">
          <el-image :src="row.image" :fit="'cover'" style="width: 100%; height: 100%;"></el-image>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="Name" width="180"></el-table-column>
      <el-table-column prop="description" label="Description" width="180"></el-table-column>
      <el-table-column prop="created_at" label="Created Time" width="180"></el-table-column>
      <el-table-column label="Amount">
        <template #default="scope">
          <el-input v-model="amounts[scope.$index]" placeholder="Enter amount"></el-input>
        </template>
      </el-table-column>
      <el-table-column label="Operation">
        <template #default="scope">
          <el-button type="primary" @click='mint(scope.$index)'>上架</el-button>
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
import { NFTStorage } from 'nft.storage';
import IPFS from 'ipfs-core'
import {ElMessage} from "element-plus";

export default {
  name: "collectionList",
  computed: {
    ...mapState(['accounts'])
  },
  setup() {
    interface Product {
      name: string;
      description: string;
      image: string;
      nftAddress: string;
      id: string;
      created_at: string;
    }
    interface TableData{
      image: string;
      name: string;
      description: string;
      created_at: string;
    }
    const store = useStore();
    const products = ref<Product[]>([]);
    const tableData = ref<TableData[]>([]);
    const amounts = ref([]);
    const count = ref(0);
    const loading = ref(false);

    const load = () => {
      if(count.value<=products.value.length)
      {
        count.value++;
      }
    }
    const getProducts = async () => {
      try {
        const activeAccount = accounts.state.activeAccount;
        const response = await axios.get(server.baseURL+"/collection/"+activeAccount);
        products.value = response.data;
        for(let i = 0;i<products.value.length;i++)
        {
          let data:TableData = {
            image:'',
            name:'',
            description:'',
            created_at:''
          };
          data.image = products.value[i].image;
          data.name = products.value[i].name;
          data.description = products.value[i].description;
          const date = new Date(products.value[i].created_at)
          data.created_at = date.toDateString();
          tableData.value.push(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const mint = async(index:number) => {
      loading.value = true;
      // 使用 ethers 调用智能合约的 mint 方法
      // 连接到以太坊网络
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      // 获取签名钱包
      const signer = provider.getSigner();

      // 实例化智能合约
      const contractAddress = products.value[index].nftAddress;
      const abi = [
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "name_",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "symbol_",
              "type": "string"
            }
          ],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "approved",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Approval",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
            }
          ],
          "name": "ApprovalForAll",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "_tokenId",
              "type": "uint256"
            }
          ],
          "name": "MetadataUpdate",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amounts",
              "type": "uint256"
            }
          ],
          "name": "NftMinted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "previousOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "OwnershipTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "status",
              "type": "uint256"
            }
          ],
          "name": "RedemptionStatusChanged",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "Transfer",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "_amounts",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "_creator",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "_description",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "_image",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "_name",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "_redemptionStatus",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "approve",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            }
          ],
          "name": "balanceOf",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "creator",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "getApproved",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            }
          ],
          "name": "isApprovedForAll",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "creator",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "description",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "image",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "amounts",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "tokenURI",
              "type": "string"
            }
          ],
          "name": "mintNft",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "name",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "owner",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "ownerOf",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "renounceOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "data",
              "type": "bytes"
            }
          ],
          "name": "safeTransferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "operator",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "approved",
              "type": "bool"
            }
          ],
          "name": "setApprovalForAll",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "status",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "tokenURI",
              "type": "string"
            }
          ],
          "name": "setRedemptionStatus",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes4",
              "name": "interfaceId",
              "type": "bytes4"
            }
          ],
          "name": "supportsInterface",
          "outputs": [
            {
              "internalType": "bool",
              "name": "",
              "type": "bool"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "symbol",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "tokenURI",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "to",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "tokenId",
              "type": "uint256"
            }
          ],
          "name": "transferFrom",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "transferOwnership",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ];
      const contract = new ethers.Contract(contractAddress, abi, signer);
      const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEUwMDQ0MTI0NTY3QzE4ZDkyYUZjMWQ0RjQ2RkQ3MjA5ZGNkNGE1Q0IiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4MDczOTIzMzc3NSwibmFtZSI6ImhhY2t0aG9uIn0.qtt7D6Aq0RQqp-AmboQ56ARYOJ0c7Iwj5-ePKcmy9cM";

      // 调用 mint 函数
      try{
        const postBody = {
          nftAddress:products.value[index].nftAddress,
          status:0
        }
        const res = await axios.post(server.baseURL+"/good/getCid", postBody);
        const nftOnIpfs = res.data;
        console.log(nftOnIpfs);
        const tx = await contract.mintNft(
            accounts.state.activeAccount,
            products.value[index].name,
            products.value[index].description,
            products.value[index].image,
            amounts.value[index],
            nftOnIpfs
      );
        console.log(tx);
      } catch(error){
        console.log(error);
      }
      loading.value = false;
      ElMessage({
        showClose: true,
        message: 'Listing successful! You can sell the product on any NFT marketplace.',
        type: 'success',
        duration: 10000
      })
    };
    getProducts();
    return {
      products,
      amounts,
      count,
      load,
      mint,
      tableData,
      loading
    }
  }
}
</script>

<style scoped>
.infinite-list {
  align-item: center;
  height: 1000px;
  width: 1000px;
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

el-row {
  margin-bottom: 20px;
  display:flex;
}
el-row:last-child {
  margin-bottom: 0;
}
el-col {
  border-radius: 4px;
}
</style>