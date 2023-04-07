<template #default="scope">
  <p>this is all the goods you have purchased</p>
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
        <el-button v-if="tableData[scope.$index].redemptionStatus===0" type="primary" @click="startRedemption(scope.$index)" >Redeem</el-button>
        <el-tag v-if="tableData[scope.$index].redemptionStatus===1&&!tableData[scope.$index].signButtonStatus">Waiting for Confirmation</el-tag>
        <el-button v-if="tableData[scope.$index].redemptionStatus===1&&tableData[scope.$index].messageToSign!=null" type="primary" @click="signMessage(scope.$index, tableData.messageToSign)">Sign</el-button>
        <el-button v-if="tableData[scope.$index].redemptionStatus===2" type="primary" @click="confirmReceipt(scope.$index)">Confirm Receipt</el-button>
        <el-tag v-if="tableData[scope.$index].redemptionStatus===3">Redemption Completed</el-tag>
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
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { server } from '@/utils/helpers';
import {mapState, useStore} from "vuex";
import accounts from "@/store/modules/accounts";
import {ethers} from "ethers";
import {verifyTypedData} from "ethers/lib/utils";
import IPFS from 'ipfs-core';
import { create } from 'ipfs-core'
import {NFTStorage} from "nft.storage";

export default {
  name: "goodsList",
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
      tokenId:number;
      redemptionStatus:number,
      signButtonStatus:boolean,
      messageToSign:string,
      chainId:number
    }
    interface TableData{
      image: string;
      name: string;
      description: string;
      created_at: string;
      redemptionStatus:number,
      signButtonStatus:boolean,
      messageToSign:string,
    }
    const tableData = ref<TableData[]>([]);
    const redemptionStatus = ref(0);
    const store = useStore();
    const products = ref<Product[]>([]);
    const amounts = ref([]);
    const count = ref(0);
    const load = () => {
      if (count.value <= products.value.length) {
        count.value++;
      }
    }
    const getProducts = async () => {
      try {
        const activeAccount = accounts.state.activeAccount;
        const response = await axios.get<Product[]>(server.baseURL + "/good/" + activeAccount);
        console.log(response);
        products.value = response.data;
        for(let i = 0;i<response.data.length;i++)
        {
          products.value[i].messageToSign = response.data[i].messageToSign;
          products.value[i].signButtonStatus = response.data[i].signButtonStatus;
        }
        console.log(products.value);
        for(let i = 0;i<products.value.length;i++)
        {
          let data:TableData = {
            image:'',
            name:'',
            description:'',
            created_at:'',
            redemptionStatus:0,
            signButtonStatus:false,
            messageToSign:'',
          };
          data.image = products.value[i].image;
          data.name = products.value[i].name;
          data.description = products.value[i].description;
          const date = new Date(products.value[i].created_at)
          data.created_at = date.toDateString();
          data.redemptionStatus = products.value[i].redemptionStatus;
          data.signButtonStatus = products.value[i].signButtonStatus;
          data.messageToSign = products.value[i].messageToSign;
          tableData.value.push(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    getProducts();

    const startRedemption = async(index:number)=>{
      const activeAccount = accounts.state.activeAccount;
      const postBody = {
        ownerAddress: activeAccount,
        nftAddress: products.value[index].nftAddress,
        tokenId: products.value[index].tokenId,
        status:1
      }
      const response = await axios.post(server.baseURL + "/good/setRedemptionStatus",postBody);
      console.log(response);
      products.value[index].redemptionStatus = 1;
      await setRedemptionStatus(index,1)
    }

    const fetchSignButtonStatus = async (index:number) => {
      try {
        const response = await axios.post(server.baseURL+'/good/signButtonStatus', {nftAddress: products.value[index].nftAddress,
          tokenId: products.value[index].tokenId});
        products.value[index].signButtonStatus = response.data.status;
        products.value[index].messageToSign = response.data.messageToSign;
      } catch (error) {
        console.error(error)
        products.value[index].signButtonStatus = false;
      }
    }

    const signMessage = async (index:number, messageToSign:string) => {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // 请求 MetaMask 授权
        await provider.send("eth_requestAccounts", []);
        // 获取签名钱包
        const signer = provider.getSigner();
        // 生成符合 EIP-712 标准的数据结构
        const domain = {
          name: "Hack!",
          //chainId:products.value[index].chainId
        };
        const message = {info: products.value[index].messageToSign};
        const types = {
          Message: [
            {name : 'info', type : 'string'}
          ]
        };

        // 调用 MetaMask进行签名
        const signature = await signer._signTypedData(domain,types,message);
        console.log(signature);

        const response = await axios.post(server.baseURL+"/good/verifySignature", { nftAddress: products.value[index].nftAddress, tokenId: products.value[index].tokenId, domain: domain, types: types, signature: signature, message: message, activeAccount:accounts.state.activeAccount });
        console.log(response.data);
        if(response.data)
        {
          alert("verification succeeded!");
          products.value[index].redemptionStatus = 2;
        }
        else{
          alert("verification failed!请重新发起兑换");
          products.value[index].redemptionStatus = 0;
        }
      } catch (error) {
        console.error(error);
      }
      await setRedemptionStatus(index,2);
    };

    const confirmReceipt = async (index:number)=>{
      try{
        const response = await axios.post(server.baseURL+"/good/confirmReceipt", { nftAddress: products.value[index].nftAddress, tokenId: products.value[index].tokenId});
        products.value[index].redemptionStatus = 3;
      }
      catch(error){
        console.log(error);
      }
      await setRedemptionStatus(index,3);
    }

    const setRedemptionStatus = async(index:number, status:number) => {
      console.log("set redemption status to "+ status);
      // 使用 ethers 调用智能合约的 mint 方法
      // 连接到以太坊网络
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      // 获取签名钱包
      const signer = provider.getSigner();
      // 实例化智能合约
      const contractAddress = products.value[index].nftAddress;
      const abi =  [
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
      const postBody = {
        nftAddress:products.value[index].nftAddress,
        status:status
      }
      const cid = await axios.post(server.baseURL+"/good/getCid", postBody);
      console.log("Set");
      // 调用 set 函数
      try{
        const tx = await contract.setRedemptionStatus(products.value[index].tokenId, status, cid.data);
        console.log(tx);
      } catch(error){
        console.log(error);
      }
    };

    const getTokenUri = async (index:number)=>{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      // 获取签名钱包
      const signer = provider.getSigner();
      // 实例化智能合约
      const contractAddress = products.value[index].nftAddress;
      const abi =[
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
      // 调用 set 函数
      try{
        const tx = await contract.tokenURI(products.value[index].tokenId);
        console.log(tx);
        const ipfs = await create()
        const cid = tx.replace('ipfs://', '').replace('/metadata.json','');
        console.log(cid);
        const file = await ipfs.cat(cid);
        for await (const chunk of file) {
          // 处理 chunk 数据
          console.log(chunk);
        }
      } catch(error){
        console.log(error);
      }

    };

    onMounted(() => {
      setInterval(() => {
        for (let i = 0; i < products.value.length; i++) {
          fetchSignButtonStatus(i);
        }
      }, 5000)
    })

    return {
      products,
      amounts,
      count,
      load,
      redemptionStatus,
      startRedemption,
      signMessage,
      confirmReceipt,
      setRedemptionStatus,
      getTokenUri,
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