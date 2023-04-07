# TOKs-for-hackUST2023
## Introduction

TOKs is a decentralized trading protocol designed to address common issues in property management, particularly in shopping malls and real estate. Our research has shown that property management faces several common problems, such as low liquidity of high-value goods, limited sales channels, and fraud during the physical delivery of goods, particularly in the case of second-hand items. Our solution is to leverage TOKs, a compact and user-friendly NFT minting platform that creates NFTs representing vouchers for goods, such as candy, limited edition sneakers, or even real estate properties. These NFTs follow ERC721 standards and can be traded on various decentralized exchange platforms. The Redemption Status attribute of the NFT tracks the exchange of goods, while digital signatures prevent fraud during the exchange process. To prevent replay attacks, we include timestamps and random numbers in signed messages. With our platform, businesses can observe on-chain data and target specific users with personalized advertisements based on their preferences. They can also increase customer loyalty through targeted airdrops.

## Installation and setup

To run this project, you will need to have the following dependencies installed on your machine:

- [Node.js](https://nodejs.org/) v14.17.0 or later
- [NPM](https://www.npmjs.com/) v7.18.1 or later
- [Vue CLI](https://cli.vuejs.org/) v4.5.13 or later
- [Nest CLI](https://docs.nestjs.com/cli/overview) v8.0.0 or later
- [MongoDB](https://www.mongodb.com/) v4.4.6 or later

Once you have installed the above dependencies, follow the steps below to set up the project:

Clone the repository:

```
git clone https://github.com/your-username/your-repo.git
```

Install frontend dependencies:

```
cd frontend
npm install
```

Install backend dependencies:

```
cd backend
npm install
```

Start the MongoDB database, follow the steps below:

1. Make sure you have installed MongoDB on your local machine or set up a MongoDB Atlas account.

2. If you have installed MongoDB on your local machine, start the MongoDB daemon by running the following command in a new terminal window:

   ```
   mongod --dbpath /data/db
   ```

   If you have set up a MongoDB Atlas account, follow the instructions provided by MongoDB Atlas to start your database.

3. Once the MongoDB database is running, open a new terminal window and navigate to the root directory of the project.

Start the backend server:

```
cd backend
npm run start
```

Start the frontend server:

```
cd frontend
npm run serve
```

Open the project in your browser:

```
http://localhost:8080
```

You should now be able to run the project on your local machine. Note that this is just a basic setup and you may need to configure additional settings for your specific use case. Please refer to the project documentation for more information on configuration and customization.

## Smart Contract Compilation and Testing

The smart contract compilation process was completed using Remix. The original Solidity code for the smart contract is stored in the `contract` folder. The compiled ABI and bytecode can be found in `./backend/src/contracts/newHackProperty.json`.

We have tested the project on the Mumbai testnet of Polygon and on a local Ganache chain. It has not been tested on the Ethereum mainnet, Polygon mainnet, or other chains. We recommend using the Mumbai testnet for reproducing our results.

If you want to use a different blockchain network, you will need to modify the `ethers.getDefaultProvider('https://rpc-mumbai.maticvigil.com')` line in `backend/src/monitor/monitor.service.ts` to use the RPC endpoint for your desired network.

## Notes

Please note that due to the nature of writing data to the blockchain and IPFS servers, the speed may be slow. Please be patient and wait for the transaction to complete before proceeding. You may need to refresh the page to see the latest status.

## Code Logic

In the frontend, we use Metamask for login authentication, and the login information is stored in Vuex. The corresponding logic code can be found in `frontend/src/store/modules/accounts.ts`. The page and component code is stored in the `frontend/src/components` folder. The `navBar` component is the navigation bar code, while the `loginPage` component is the login page code. The `createProduct` component is used to help users create and deploy an NFT contract with a `Redemption Status` attribute, and record the IPFS CID of the four exchange states in the backend database. When the `Redemption Status` changes, we call the contract method to reset the `tokenURI` of the NFT. The `collectionList` component displays the goods you have created, and you can mint NFTs and sell them on NFT trading platforms. The `goodsList` and `redeemList` components correspond to the buying and selling and the operations required by the seller during the exchange process.

In the backend, there are four main modules. The `create-product` module corresponds to the `createProduct` component in the frontend. Its function is to record the creation of goods in the database and deploy a listener for this NFT contract to track its buying and selling status. The `collection` module reads the data of products from the database and returns it to the frontend. The `good` module processes all nft exchange-related work. The `monitor` module tracks contract information and retrieves NFTs that can be exchanged by users under the username who minted the NFT on the Toks platform.

## License and Attribution

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

This project uses several open-source libraries, including but not limited to:

- [Vue.js](https://vuejs.org/)
- [NestJS](https://nestjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [IPFS](https://ipfs.io/)
- [Ethers.js](https://docs.ethers.io/v5/)
- [OpenZeppelin](https://openzeppelin.com/)

We would like to express our gratitude to the developers of these libraries and the open-source community at large. Their contributions and support have been invaluable in the development of this project.

If you use this project or any of its code in your own work, we kindly ask that you provide attribution to this project and its contributors. Thank you.
