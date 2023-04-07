<template>
  <div v-loading="loading" class="common-layout">
    <el-container class="my-container">
      <el-aside width="300px">
        <el-text tag = "b">Instruction</el-text>
        <br>
        <el-text tag="i">
          This page provides an NFT template. You can upload basic information of an actual product as an NFT contract to tokenize it.
        </el-text>
      </el-aside>
      <el-main>
        <el-form :model="form" label-width="120px">
          <el-text class="mx-1" type="primary" size="large" text-align="left">Create an NFT Collection</el-text>
          <el-form-item label="Name">
            <el-input v-model="form.name" />
          </el-form-item>
          <el-form-item label="Description">
            <el-input :rows="5" type="textarea" placeholder="Please input the description" v-model="form.description">
            </el-input>
          </el-form-item>
          <el-form-item label="Chain">
            <el-select class="selectModule" v-model="form.chain" placeholder="please select your blockchain">
              <el-option label="Ethereum" value="1" />
              <el-option label="Polygon" value="137" />
              <el-option label="Mumbai" value="80001" />
              <el-option label="Local" value="1337" />
            </el-select>
          </el-form-item>
          <el-form-item label="Image">
            <el-upload
                v-model:file-list="fileList"
                class="upload-demo"
                action="http://localhost:3000/create-product/pic"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                list-type="picture"
            >
              <el-button type="primary">Click to upload</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  jpg/png files with a size less than 10MB
                </div>
              </template>
            </el-upload>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="onSubmit">Create</el-button>
            <el-button>Cancel</el-button>
          </el-form-item>
        </el-form>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
import { reactive} from 'vue'
import { ref } from 'vue'
import axios from "axios";
import type{ UploadProps, UploadUserFile } from 'element-plus'
import {server} from "@/utils/helpers";
import {mapState} from "vuex";
import accounts from "@/store/modules/accounts";
import {ethers} from "ethers";
import { NFTStorage } from 'nft.storage';
import { ElMessage } from 'element-plus';

export default({
  name: 'CreateProduct',
  computed: {
    ...mapState(['account'])
  },
  setup() {
    const fileList = ref<UploadUserFile[]>([])
    const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
      console.log(uploadFile, uploadFiles)
    }

    const handlePreview: UploadProps['onPreview'] = (file) => {
      console.log(file)
    }

    const handleSuccess = (response:any) => {
      // 上传成功后，将服务器返回的图片URL赋值给img变量
      console.log(response);
      form.image = server.baseURL+response.url.slice(1);
      console.log(form.image);
    }

    // do not use same name with ref
    const form = reactive({
      name: '',
      description: '',
      image: '',
      chain: '',
    })

    const loading = ref(false);

    const onSubmit = async () => {
      loading.value = true;
      let productData = {
        name: form.name,
        description: form.description,
        image: form.image,
        chainId:0,
        creatorAddress:accounts.state.activeAccount.toLowerCase(),
        nftAddress:'',
      };
      switch(form.chain){
        case '1':
          productData.chainId = 1;
          break;
        case '137':
          productData.chainId = 137;
          break;
        case '1337':
          productData.chainId = 1337;
          break;
        case '80001':
          productData.chainId = 80001;
          break;
      }
      //const rpcUrl = "https://polygon-mumbai.infura.io/v3/966b06d9fc6d4c4185f058a5fd56445b";//"https://rpc-mumbai.maticvigil.com"////http://localhost:8545";
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      console.log(provider);
      const signer = provider.getSigner(accounts.state.activeAccount);
      console.log(signer);
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
      const bytecode = "60806040523480156200001157600080fd5b5060405162003bdb38038062003bdb833981810160405281019062000037919062000291565b818181600090805190602001906200005192919062000163565b5080600190805190602001906200006a92919062000163565b5050506200008d620000816200009560201b60201c565b6200009d60201b60201c565b50506200049a565b600033905090565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b8280546200017190620003ab565b90600052602060002090601f016020900481019282620001955760008555620001e1565b82601f10620001b057805160ff1916838001178555620001e1565b82800160010185558215620001e1579182015b82811115620001e0578251825591602001919060010190620001c3565b5b509050620001f09190620001f4565b5090565b5b808211156200020f576000816000905550600101620001f5565b5090565b60006200022a62000224846200033f565b62000316565b9050828152602081018484840111156200024957620002486200047a565b5b6200025684828562000375565b509392505050565b600082601f83011262000276576200027562000475565b5b81516200028884826020860162000213565b91505092915050565b60008060408385031215620002ab57620002aa62000484565b5b600083015167ffffffffffffffff811115620002cc57620002cb6200047f565b5b620002da858286016200025e565b925050602083015167ffffffffffffffff811115620002fe57620002fd6200047f565b5b6200030c858286016200025e565b9150509250929050565b60006200032262000335565b9050620003308282620003e1565b919050565b6000604051905090565b600067ffffffffffffffff8211156200035d576200035c62000446565b5b620003688262000489565b9050602081019050919050565b60005b838110156200039557808201518184015260208101905062000378565b83811115620003a5576000848401525b50505050565b60006002820490506001821680620003c457607f821691505b60208210811415620003db57620003da62000417565b5b50919050565b620003ec8262000489565b810181811067ffffffffffffffff821117156200040e576200040d62000446565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b61373180620004aa6000396000f3fe608060405234801561001057600080fd5b50600436106101735760003560e01c806370a08231116100de578063bc8bde6411610097578063d28d885211610071578063d28d88521461044c578063e985e9c51461046a578063f2fde38b1461049a578063ff7c0254146104b657610173565b8063bc8bde64146103e0578063c87b56dd146103fe578063cfa84dfe1461042e57610173565b806370a0823114610332578063715018a6146103625780638da5cb5b1461036c57806395d89b411461038a578063a22cb465146103a8578063b88d4fde146103c457610173565b8063266a115f11610130578063266a115f1461024c57806339b3eb1614610268578063421e347e1461029857806342842e0e146102c857806357177c53146102e45780636352211e1461030257610173565b806301ffc9a71461017857806302d05d3f146101a857806306fdde03146101c6578063081812fc146101e4578063095ea7b31461021457806323b872dd14610230575b600080fd5b610192600480360381019061018d9190612922565b6104d2565b60405161019f9190612da3565b60405180910390f35b6101b06105b4565b6040516101bd9190612d3c565b60405180910390f35b6101ce6105de565b6040516101db9190612dbe565b60405180910390f35b6101fe60048036038101906101f9919061297c565b610670565b60405161020b9190612d3c565b60405180910390f35b61022e600480360381019061022991906128e2565b6106b6565b005b61024a600480360381019061024591906126cf565b6107ce565b005b610266600480360381019061026191906127e5565b61082e565b005b610282600480360381019061027d919061297c565b610922565b60405161028f9190612fe0565b60405180910390f35b6102b260048036038101906102ad919061297c565b61093a565b6040516102bf9190612fe0565b60405180910390f35b6102e260048036038101906102dd91906126cf565b610952565b005b6102ec610972565b6040516102f99190612dbe565b60405180910390f35b61031c6004803603810190610317919061297c565b610a00565b6040516103299190612d3c565b60405180910390f35b61034c60048036038101906103479190612662565b610a87565b6040516103599190612fe0565b60405180910390f35b61036a610b3f565b005b610374610b53565b6040516103819190612d3c565b60405180910390f35b610392610b7d565b60405161039f9190612dbe565b60405180910390f35b6103c260048036038101906103bd91906127a5565b610c0f565b005b6103de60048036038101906103d99190612722565b610c25565b005b6103e8610c87565b6040516103f59190612d3c565b60405180910390f35b6104186004803603810190610413919061297c565b610cad565b6040516104259190612dbe565b60405180910390f35b610436610dc0565b6040516104439190612dbe565b60405180910390f35b610454610e4e565b6040516104619190612dbe565b60405180910390f35b610484600480360381019061047f919061268f565b610edc565b6040516104919190612da3565b60405180910390f35b6104b460048036038101906104af9190612662565b610f70565b005b6104d060048036038101906104cb91906129a9565b610ff4565b005b60007f80ac58cd000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916148061059d57507f5b5e139f000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916145b806105ad57506105ac82611447565b5b9050919050565b6000600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6060600080546105ed906131a4565b80601f0160208091040260200160405190810160405280929190818152602001828054610619906131a4565b80156106665780601f1061063b57610100808354040283529160200191610666565b820191906000526020600020905b81548152906001019060200180831161064957829003601f168201915b5050505050905090565b600061067b826114b1565b6004600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b60006106c182610a00565b90508073ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415610732576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161072990612f60565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff166107516114fc565b73ffffffffffffffffffffffffffffffffffffffff161480610780575061077f8161077a6114fc565b610edc565b5b6107bf576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107b690612f80565b60405180910390fd5b6107c98383611504565b505050565b6107df6107d96114fc565b826115bd565b61081e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161081590612de0565b60405180910390fd5b610829838383611652565b505050565b61083661194c565b61084060086119ca565b600061084c60086119e0565b905085600a9080519060200190610864929190612476565b5084600b908051906020019061087b929190612476565b5083600c9080519060200190610892929190612476565b506000600d60008381526020019081526020016000208190555086600960006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555082600e60008381526020019081526020016000208190555061090f87826119ee565b6109198183611a0c565b50505050505050565b600d6020528060005260406000206000915090505481565b600e6020528060005260406000206000915090505481565b61096d83838360405180602001604052806000815250610c25565b505050565b600c805461097f906131a4565b80601f01602080910402602001604051908101604052809291908181526020018280546109ab906131a4565b80156109f85780601f106109cd576101008083540402835291602001916109f8565b820191906000526020600020905b8154815290600101906020018083116109db57829003601f168201915b505050505081565b600080610a0c83611a80565b9050600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610a7e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a7590612f40565b60405180910390fd5b80915050919050565b60008073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415610af8576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610aef90612ec0565b60405180910390fd5b600360008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b610b4761194c565b610b516000611abd565b565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b606060018054610b8c906131a4565b80601f0160208091040260200160405190810160405280929190818152602001828054610bb8906131a4565b8015610c055780601f10610bda57610100808354040283529160200191610c05565b820191906000526020600020905b815481529060010190602001808311610be857829003601f168201915b5050505050905090565b610c21610c1a6114fc565b8383611b83565b5050565b610c36610c306114fc565b836115bd565b610c75576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c6c90612de0565b60405180910390fd5b610c8184848484611cf0565b50505050565b600960009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6060610cb8826114b1565b6000600660008481526020019081526020016000208054610cd8906131a4565b80601f0160208091040260200160405190810160405280929190818152602001828054610d04906131a4565b8015610d515780601f10610d2657610100808354040283529160200191610d51565b820191906000526020600020905b815481529060010190602001808311610d3457829003601f168201915b505050505090506000610d62611d4c565b9050600081511415610d78578192505050610dbb565b600082511115610dad578082604051602001610d95929190612d18565b60405160208183030381529060405292505050610dbb565b610db684611d63565b925050505b919050565b600b8054610dcd906131a4565b80601f0160208091040260200160405190810160405280929190818152602001828054610df9906131a4565b8015610e465780601f10610e1b57610100808354040283529160200191610e46565b820191906000526020600020905b815481529060010190602001808311610e2957829003601f168201915b505050505081565b600a8054610e5b906131a4565b80601f0160208091040260200160405190810160405280929190818152602001828054610e87906131a4565b8015610ed45780601f10610ea957610100808354040283529160200191610ed4565b820191906000526020600020905b815481529060010190602001808311610eb757829003601f168201915b505050505081565b6000600560008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16905092915050565b610f7861194c565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415610fe8576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610fdf90612e20565b60405180910390fd5b610ff181611abd565b50565b610ffd83611dcb565b61103c576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161103390612fc0565b60405180910390fd5b60008214801561106057506003600d60008581526020019081526020016000205414155b801561109f57503373ffffffffffffffffffffffffffffffffffffffff1661108784610a00565b73ffffffffffffffffffffffffffffffffffffffff16145b1561114f576000600d6000858152602001908152602001600020819055507fcbf870016d046ffb9a6b7839a34fde01fa7aa0b632698c9a1a7438a43fe03ee383600d600086815260200190815260200160002054604051611101929190612ffb565b60405180910390a16111138382611a0c565b7ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7836040516111429190612fe0565b60405180910390a1611442565b60018214801561117257506000600d600085815260200190815260200160002054145b15611222576001600d6000858152602001908152602001600020819055507fcbf870016d046ffb9a6b7839a34fde01fa7aa0b632698c9a1a7438a43fe03ee383600d6000868152602001908152602001600020546040516111d4929190612ffb565b60405180910390a16111e68382611a0c565b7ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7836040516112159190612fe0565b60405180910390a1611442565b60028214801561124557506001600d600085815260200190815260200160002054145b156112f5576002600d6000858152602001908152602001600020819055507fcbf870016d046ffb9a6b7839a34fde01fa7aa0b632698c9a1a7438a43fe03ee383600d6000868152602001908152602001600020546040516112a7929190612ffb565b60405180910390a16112b98382611a0c565b7ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7836040516112e89190612fe0565b60405180910390a1611442565b60038214801561131857506002600d600085815260200190815260200160002054145b801561135757503373ffffffffffffffffffffffffffffffffffffffff1661133f84610a00565b73ffffffffffffffffffffffffffffffffffffffff16145b15611407576003600d6000858152602001908152602001600020819055507fcbf870016d046ffb9a6b7839a34fde01fa7aa0b632698c9a1a7438a43fe03ee383600d6000868152602001908152602001600020546040516113b9929190612ffb565b60405180910390a16113cb8382611a0c565b7ff8e1a15aba9398e019f0b49df1a4fde98ee17ae345cb5f6b5e2c27f5033e8ce7836040516113fa9190612fe0565b60405180910390a1611442565b6040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161143990612fa0565b60405180910390fd5b505050565b60007f01ffc9a7000000000000000000000000000000000000000000000000000000007bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916827bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916149050919050565b6114ba81611dcb565b6114f9576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114f090612f40565b60405180910390fd5b50565b600033905090565b816004600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff1661157783610a00565b73ffffffffffffffffffffffffffffffffffffffff167f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b92560405160405180910390a45050565b6000806115c983610a00565b90508073ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff16148061160b575061160a8185610edc565b5b8061164957508373ffffffffffffffffffffffffffffffffffffffff1661163184610670565b73ffffffffffffffffffffffffffffffffffffffff16145b91505092915050565b8273ffffffffffffffffffffffffffffffffffffffff1661167282610a00565b73ffffffffffffffffffffffffffffffffffffffff16146116c8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016116bf90612e40565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415611738576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161172f90612e80565b60405180910390fd5b6117458383836001611e0c565b8273ffffffffffffffffffffffffffffffffffffffff1661176582610a00565b73ffffffffffffffffffffffffffffffffffffffff16146117bb576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016117b290612e40565b60405180910390fd5b6004600082815260200190815260200160002060006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690556001600360008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600082825403925050819055506001600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540192505081905550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a46119478383836001611e12565b505050565b6119546114fc565b73ffffffffffffffffffffffffffffffffffffffff16611972610b53565b73ffffffffffffffffffffffffffffffffffffffff16146119c8576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016119bf90612f20565b60405180910390fd5b565b6001816000016000828254019250508190555050565b600081600001549050919050565b611a08828260405180602001604052806000815250611e18565b5050565b611a1582611dcb565b611a54576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611a4b90612ee0565b60405180910390fd5b80600660008481526020019081526020016000209080519060200190611a7b929190612476565b505050565b60006002600083815260200190815260200160002060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050919050565b6000600760009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600760006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff161415611bf2576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611be990612ea0565b60405180910390fd5b80600560008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f17307eab39ab6107e8899845ad3d59bd9653f200f220920489ca2b5937696c3183604051611ce39190612da3565b60405180910390a3505050565b611cfb848484611652565b611d0784848484611e73565b611d46576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611d3d90612e00565b60405180910390fd5b50505050565b606060405180602001604052806000815250905090565b6060611d6e826114b1565b6000611d78611d4c565b90506000815111611d985760405180602001604052806000815250611dc3565b80611da28461200a565b604051602001611db3929190612d18565b6040516020818303038152906040525b915050919050565b60008073ffffffffffffffffffffffffffffffffffffffff16611ded83611a80565b73ffffffffffffffffffffffffffffffffffffffff1614159050919050565b50505050565b50505050565b611e2283836120e2565b611e2f6000848484611e73565b611e6e576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611e6590612e00565b60405180910390fd5b505050565b6000611e948473ffffffffffffffffffffffffffffffffffffffff16612300565b15611ffd578373ffffffffffffffffffffffffffffffffffffffff1663150b7a02611ebd6114fc565b8786866040518563ffffffff1660e01b8152600401611edf9493929190612d57565b602060405180830381600087803b158015611ef957600080fd5b505af1925050508015611f2a57506040513d601f19601f82011682018060405250810190611f27919061294f565b60015b611fad573d8060008114611f5a576040519150601f19603f3d011682016040523d82523d6000602084013e611f5f565b606091505b50600081511415611fa5576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611f9c90612e00565b60405180910390fd5b805181602001fd5b63150b7a0260e01b7bffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916817bffffffffffffffffffffffffffffffffffffffffffffffffffffffff191614915050612002565b600190505b949350505050565b60606000600161201984612323565b01905060008167ffffffffffffffff81111561203857612037613265565b5b6040519080825280601f01601f19166020018201604052801561206a5781602001600182028036833780820191505090505b509050600082602001820190505b6001156120d7578080600190039150507f3031323334353637383961626364656600000000000000000000000000000000600a86061a8153600a85816120c1576120c0613207565b5b04945060008514156120d2576120d7565b612078565b819350505050919050565b600073ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff161415612152576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161214990612f00565b60405180910390fd5b61215b81611dcb565b1561219b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161219290612e60565b60405180910390fd5b6121a9600083836001611e0c565b6121b281611dcb565b156121f2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016121e990612e60565b60405180910390fd5b6001600360008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282540192505081905550816002600083815260200190815260200160002060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550808273ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef60405160405180910390a46122fc600083836001611e12565b5050565b6000808273ffffffffffffffffffffffffffffffffffffffff163b119050919050565b600080600090507a184f03e93ff9f4daa797ed6e38ed64bf6a1f0100000000000000008310612381577a184f03e93ff9f4daa797ed6e38ed64bf6a1f010000000000000000838161237757612376613207565b5b0492506040810190505b6d04ee2d6d415b85acef810000000083106123be576d04ee2d6d415b85acef810000000083816123b4576123b3613207565b5b0492506020810190505b662386f26fc1000083106123ed57662386f26fc1000083816123e3576123e2613207565b5b0492506010810190505b6305f5e1008310612416576305f5e100838161240c5761240b613207565b5b0492506008810190505b612710831061243b57612710838161243157612430613207565b5b0492506004810190505b6064831061245e576064838161245457612453613207565b5b0492506002810190505b600a831061246d576001810190505b80915050919050565b828054612482906131a4565b90600052602060002090601f0160209004810192826124a457600085556124eb565b82601f106124bd57805160ff19168380011785556124eb565b828001600101855582156124eb579182015b828111156124ea5782518255916020019190600101906124cf565b5b5090506124f891906124fc565b5090565b5b808211156125155760008160009055506001016124fd565b5090565b600061252c61252784613049565b613024565b90508281526020810184848401111561254857612547613299565b5b612553848285613162565b509392505050565b600061256e6125698461307a565b613024565b90508281526020810184848401111561258a57612589613299565b5b612595848285613162565b509392505050565b6000813590506125ac8161369f565b92915050565b6000813590506125c1816136b6565b92915050565b6000813590506125d6816136cd565b92915050565b6000815190506125eb816136cd565b92915050565b600082601f83011261260657612605613294565b5b8135612616848260208601612519565b91505092915050565b600082601f83011261263457612633613294565b5b813561264484826020860161255b565b91505092915050565b60008135905061265c816136e4565b92915050565b600060208284031215612678576126776132a3565b5b60006126868482850161259d565b91505092915050565b600080604083850312156126a6576126a56132a3565b5b60006126b48582860161259d565b92505060206126c58582860161259d565b9150509250929050565b6000806000606084860312156126e8576126e76132a3565b5b60006126f68682870161259d565b93505060206127078682870161259d565b92505060406127188682870161264d565b9150509250925092565b6000806000806080858703121561273c5761273b6132a3565b5b600061274a8782880161259d565b945050602061275b8782880161259d565b935050604061276c8782880161264d565b925050606085013567ffffffffffffffff81111561278d5761278c61329e565b5b612799878288016125f1565b91505092959194509250565b600080604083850312156127bc576127bb6132a3565b5b60006127ca8582860161259d565b92505060206127db858286016125b2565b9150509250929050565b60008060008060008060c08789031215612802576128016132a3565b5b600061281089828a0161259d565b965050602087013567ffffffffffffffff8111156128315761283061329e565b5b61283d89828a0161261f565b955050604087013567ffffffffffffffff81111561285e5761285d61329e565b5b61286a89828a0161261f565b945050606087013567ffffffffffffffff81111561288b5761288a61329e565b5b61289789828a0161261f565b93505060806128a889828a0161264d565b92505060a087013567ffffffffffffffff8111156128c9576128c861329e565b5b6128d589828a0161261f565b9150509295509295509295565b600080604083850312156128f9576128f86132a3565b5b60006129078582860161259d565b92505060206129188582860161264d565b9150509250929050565b600060208284031215612938576129376132a3565b5b6000612946848285016125c7565b91505092915050565b600060208284031215612965576129646132a3565b5b6000612973848285016125dc565b91505092915050565b600060208284031215612992576129916132a3565b5b60006129a08482850161264d565b91505092915050565b6000806000606084860312156129c2576129c16132a3565b5b60006129d08682870161264d565b93505060206129e18682870161264d565b925050604084013567ffffffffffffffff811115612a0257612a0161329e565b5b612a0e8682870161261f565b9150509250925092565b612a21816130ee565b82525050565b612a3081613100565b82525050565b6000612a41826130ab565b612a4b81856130c1565b9350612a5b818560208601613171565b612a64816132a8565b840191505092915050565b6000612a7a826130b6565b612a8481856130d2565b9350612a94818560208601613171565b612a9d816132a8565b840191505092915050565b6000612ab3826130b6565b612abd81856130e3565b9350612acd818560208601613171565b80840191505092915050565b6000612ae6602d836130d2565b9150612af1826132b9565b604082019050919050565b6000612b096032836130d2565b9150612b1482613308565b604082019050919050565b6000612b2c6026836130d2565b9150612b3782613357565b604082019050919050565b6000612b4f6025836130d2565b9150612b5a826133a6565b604082019050919050565b6000612b72601c836130d2565b9150612b7d826133f5565b602082019050919050565b6000612b956024836130d2565b9150612ba08261341e565b604082019050919050565b6000612bb86019836130d2565b9150612bc38261346d565b602082019050919050565b6000612bdb6029836130d2565b9150612be682613496565b604082019050919050565b6000612bfe602e836130d2565b9150612c09826134e5565b604082019050919050565b6000612c216020836130d2565b9150612c2c82613534565b602082019050919050565b6000612c446020836130d2565b9150612c4f8261355d565b602082019050919050565b6000612c676018836130d2565b9150612c7282613586565b602082019050919050565b6000612c8a6021836130d2565b9150612c95826135af565b604082019050919050565b6000612cad603d836130d2565b9150612cb8826135fe565b604082019050919050565b6000612cd06019836130d2565b9150612cdb8261364d565b602082019050919050565b6000612cf36012836130d2565b9150612cfe82613676565b602082019050919050565b612d1281613158565b82525050565b6000612d248285612aa8565b9150612d308284612aa8565b91508190509392505050565b6000602082019050612d516000830184612a18565b92915050565b6000608082019050612d6c6000830187612a18565b612d796020830186612a18565b612d866040830185612d09565b8181036060830152612d988184612a36565b905095945050505050565b6000602082019050612db86000830184612a27565b92915050565b60006020820190508181036000830152612dd88184612a6f565b905092915050565b60006020820190508181036000830152612df981612ad9565b9050919050565b60006020820190508181036000830152612e1981612afc565b9050919050565b60006020820190508181036000830152612e3981612b1f565b9050919050565b60006020820190508181036000830152612e5981612b42565b9050919050565b60006020820190508181036000830152612e7981612b65565b9050919050565b60006020820190508181036000830152612e9981612b88565b9050919050565b60006020820190508181036000830152612eb981612bab565b9050919050565b60006020820190508181036000830152612ed981612bce565b9050919050565b60006020820190508181036000830152612ef981612bf1565b9050919050565b60006020820190508181036000830152612f1981612c14565b9050919050565b60006020820190508181036000830152612f3981612c37565b9050919050565b60006020820190508181036000830152612f5981612c5a565b9050919050565b60006020820190508181036000830152612f7981612c7d565b9050919050565b60006020820190508181036000830152612f9981612ca0565b9050919050565b60006020820190508181036000830152612fb981612cc3565b9050919050565b60006020820190508181036000830152612fd981612ce6565b9050919050565b6000602082019050612ff56000830184612d09565b92915050565b60006040820190506130106000830185612d09565b61301d6020830184612d09565b9392505050565b600061302e61303f565b905061303a82826131d6565b919050565b6000604051905090565b600067ffffffffffffffff82111561306457613063613265565b5b61306d826132a8565b9050602081019050919050565b600067ffffffffffffffff82111561309557613094613265565b5b61309e826132a8565b9050602081019050919050565b600081519050919050565b600081519050919050565b600082825260208201905092915050565b600082825260208201905092915050565b600081905092915050565b60006130f982613138565b9050919050565b60008115159050919050565b60007fffffffff0000000000000000000000000000000000000000000000000000000082169050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b82818337600083830152505050565b60005b8381101561318f578082015181840152602081019050613174565b8381111561319e576000848401525b50505050565b600060028204905060018216806131bc57607f821691505b602082108114156131d0576131cf613236565b5b50919050565b6131df826132a8565b810181811067ffffffffffffffff821117156131fe576131fd613265565b5b80604052505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080fd5b600080fd5b600080fd5b600080fd5b6000601f19601f8301169050919050565b7f4552433732313a2063616c6c6572206973206e6f7420746f6b656e206f776e6560008201527f72206f7220617070726f76656400000000000000000000000000000000000000602082015250565b7f4552433732313a207472616e7366657220746f206e6f6e20455243373231526560008201527f63656976657220696d706c656d656e7465720000000000000000000000000000602082015250565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a207472616e736665722066726f6d20696e636f72726563742060008201527f6f776e6572000000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a20746f6b656e20616c7265616479206d696e74656400000000600082015250565b7f4552433732313a207472616e7366657220746f20746865207a65726f2061646460008201527f7265737300000000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a20617070726f766520746f2063616c6c657200000000000000600082015250565b7f4552433732313a2061646472657373207a65726f206973206e6f74206120766160008201527f6c6964206f776e65720000000000000000000000000000000000000000000000602082015250565b7f45524337323155524953746f726167653a2055524920736574206f66206e6f6e60008201527f6578697374656e7420746f6b656e000000000000000000000000000000000000602082015250565b7f4552433732313a206d696e7420746f20746865207a65726f2061646472657373600082015250565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b7f4552433732313a20696e76616c696420746f6b656e2049440000000000000000600082015250565b7f4552433732313a20617070726f76616c20746f2063757272656e74206f776e6560008201527f7200000000000000000000000000000000000000000000000000000000000000602082015250565b7f4552433732313a20617070726f76652063616c6c6572206973206e6f7420746f60008201527f6b656e206f776e6572206f7220617070726f76656420666f7220616c6c000000602082015250565b7f496e76616c696420737461747573207472616e736974696f6e00000000000000600082015250565b7f4e465420646f6573206e6f742065786973740000000000000000000000000000600082015250565b6136a8816130ee565b81146136b357600080fd5b50565b6136bf81613100565b81146136ca57600080fd5b50565b6136d68161310c565b81146136e157600080fd5b50565b6136ed81613158565b81146136f857600080fd5b5056fea264697066735822122063d799fdd8ee0b38f2351551d7a8e235c1fad99bc7d5301909599d514cd7cd8964736f6c63430008070033"
      const factory = new ethers.ContractFactory(abi, bytecode, signer);

      const contract = await factory.deploy(form.name, "hak");
      //const contractAddress = contract.wait();
      console.log("Contract address:", contract.address);
      productData.nftAddress = contract.address;

      await axios.post(server.baseURL+'/create-product', productData,{
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweEUwMDQ0MTI0NTY3QzE4ZDkyYUZjMWQ0RjQ2RkQ3MjA5ZGNkNGE1Q0IiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY4MDczOTIzMzc3NSwibmFtZSI6ImhhY2t0aG9uIn0.qtt7D6Aq0RQqp-AmboQ56ARYOJ0c7Iwj5-ePKcmy9cM";
      async function getExampleImage() {
        const imageOriginUrl = productData.image;
        const r = await fetch(imageOriginUrl);
        return r.blob();
      }
      async function storeExampleNFT(image:any) {
        console.log(image);
        const client = new NFTStorage({ token: API_KEY })
        const state0 = {
          image,
          name: productData.name,
          description: productData.description,
          attributes: [
            {
              trait_type: 'Creator',
              value: accounts.state.activeAccount
            },
            {
              trait_type: 'Redemption_Status',
              value: 'Uninitiated'
            }
          ]
        }
        const metadata0 = await client.store(state0);
        console.log(metadata0);
        const state1 = {
          image,
          name: productData.name,
          description: productData.description,
          attributes: [
            {
              trait_type: 'Creator',
              value: accounts.state.activeAccount
            },
            {
              trait_type: 'Redemption_Status',
              value: 'Initiated'
            }
          ]
        }
        const state2 = {
          image,
          name: productData.name,
          description: productData.description,
          attributes: [
            {
              trait_type: 'Creator',
              value: accounts.state.activeAccount
            },
            {
              trait_type: 'Redemption_Status',
              value: 'Signed'
            }
          ]
        }
        const state3 = {
          image,
          name: productData.name,
          description: productData.description,
          attributes: [
            {
              trait_type: 'Creator',
              value: accounts.state.activeAccount
            },
            {
              trait_type: 'Redemption_Status',
              value: 'Redeemed'
            }
          ]
        }
        const metadata1 = await client.store(state1);
        const metadata2 = await client.store(state2);
        const metadata3 = await client.store(state3);
        const cid0 = metadata0.url;
        const cid1 = metadata1.url;
        const cid2 = metadata2.url;
        const cid3 = metadata3.url;
        console.log(cid0);
        console.log(cid1);
        console.log(cid2);console.log(cid3);

        const postBody = {
          nftAddress:productData.nftAddress.toLowerCase(),
          state0: cid0,
          state1: cid1,
          state2: cid2,
          state3: cid3
        }
        await axios.post(server.baseURL+"/create-product/saveCid",postBody);
      }
      const image = await getExampleImage();
      console.log(image);
      await storeExampleNFT(image);
      loading.value = false;
      ElMessage({
        showClose: true,
        message: 'Congratulations! You have successfully created a token series for your product. You can now go to Collection List to list your NFT!',
        type: 'success',
        duration: 10000
      })
    }

    return {
      fileList,
      handleRemove,
      handlePreview,
      handleSuccess,
      form,
      onSubmit,
      loading
    }
  }
})

// const fileList = ref<UploadUserFile[]>([
// ])
//
// const handleRemove: UploadProps['onRemove'] = (uploadFile, uploadFiles) => {
//   console.log(uploadFile, uploadFiles)
// }
//
// const handlePreview: UploadProps['onPreview'] = (file) => {
//   console.log(file)
// }
//
// const handleSuccess = (response:any) => {
//   // 上传成功后，将服务器返回的图片URL赋值给img变量
//   console.log(response);
//   form.image = server.baseURL+response.url.slice(1);
//   console.log(form.image);
// }
//
// // do not use same name with ref
// const form = reactive({
//   name: '',
//   description: '',
//   image: '',
//   chainId:''
// })
//
// const onSubmit = () => {
//   let creatorAddress = ;
//
//   let productData = {
//     name: form.name,
//     description: form.description,
//     image: form.image,
//     chainId:form.chainId,
//     creatorAddress:getActiveAccount
//   };
//   axios.post(server.baseURL+'/create-product', productData,{
//     headers: {
//       'Content-Type': 'application/json'
//     }
//   });
//   console.log('submit!');
//   console.log(form);
// }
</script>

<style scoped>
.el-input{
  width: 300px;
}

.description{
  height: 200px;
}

.my-container {
  width: 100%;
  max-width: 800px;
  margin: 3px;
  display:flex;
}

.selectModule{
  width: 300px;
}

.image{
  height: 300px;
  width: 300px;
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
}

/* 背景遮罩层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: -1;
}

/* 加载内容区域 */
.loading-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 40px;
}

/* 加载图标样式 */
.el-icon-loading {
  font-size: 100px;
  margin-bottom: 10px;
}
</style>
