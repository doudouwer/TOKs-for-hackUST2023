import {ethers} from "ethers";
import Web3Modal from "web3modal";
import { Commit } from 'vuex';

const state: {
    activeAccount: string;
    activeBalance: number;
    chainId: number;
    chainName: string;
    providerEthers: ethers.providers.Web3Provider;
    isConnected: boolean;
    providerW3m: ethers.providers.Web3Provider;
    web3Modal: Web3Modal;
} = {
    activeAccount: "",
    activeBalance: 0,
    chainId: 0,
    chainName: "",
    providerEthers: {} as ethers.providers.Web3Provider,
    isConnected: false,
    providerW3m: {} as ethers.providers.Web3Provider,
    web3Modal: {} as Web3Modal
};

const getters = {
    getActiveAccount(state:any) {
        return state.activeAccount;
    },
    getActiveBalanceWei(state:any) {
        return state.activeBalance;
    },
    getActiveBalanceEth(state:any) {
        return ethers.utils.formatEther(state.activeBalance);
    },
    getChainId(state:any) {
        return state.chainId;
    },
    getChainName(state:any) {
        return state.chainName;
    },
    getProviderEthers(state:any) {
        return state.providerEthers;
    },
    getWeb3Modal(state:any) {
        return state.web3Modal;
    },
    isUserConnected(state:any) {
        return state.isConnected;
    }
};

//配置 Web3Modal 提供者选项，比如 MetaMask、BurnerConnect、Authereum 等。
// 创建 Web3Modal 实例并将其存储到 Vuex store 中。
// 设置 Ethereum 自动刷新网络变化选项为 false，以避免一些不必要的问题。
// 如果用户之前已经连接过钱包，则自动连接到 Web3Modal，从而让用户可以无需再次手动连接。
// 如果用户连接成功，则更新 Vuex store 中的连接状态，并设置当前账户、网络ID、以太坊提供者等信息。
// 调用 fetchActiveBalance 方法来获取当前账户的余额信息。

const actions = {
    async initWeb3Modal({ commit }: { commit: Commit }): Promise<void> {
        const w3mObject = new Web3Modal({
            cacheProvider: true
        });

        // This will get deprecated soon. Setting it to false removes a warning from the console.
        window.ethereum.autoRefreshOnNetworkChange = false;

        // if the user is flagged as already connected, automatically connect back to Web3Modal
        if (localStorage.getItem('isConnected') === "true") {
            const providerW3m = await w3mObject.connect();
            commit("setIsConnected", true);

            commit("setActiveAccount", window.ethereum.selectedAddress);
            commit("setChainData", window.ethereum.chainId);
            commit("setEthersProvider", providerW3m);
            actions.fetchActiveBalance({ commit });
        }

        commit("setWeb3ModalInstance", w3mObject);
    },

    async connectWeb3Modal({ commit }: { commit: Commit }) {
        const providerW3m = await state.web3Modal.connect();
        commit("setIsConnected", true);
        commit("setActiveAccount", window.ethereum.selectedAddress);
        commit("setChainData", window.ethereum.chainId);
        commit("setEthersProvider", providerW3m);
        actions.fetchActiveBalance({ commit });
        console.log(state);
    },

    async disconnectWeb3Modal({ commit,state}: { commit: Commit, state:any}) {
        // commit("disconnectWallet");
        // commit("setIsConnected", false);
        // console.log(state);
        console.log("disconnectWallet!");
        await state.web3Modal.clearCachedProvider();
        await state.provider.disconnect();
        commit('setActiveAccount', null);
        commit('setActiveBalanceEth', 0);
        commit('setActiveBalanceWei', 0);
        commit('setProviderEthers', null);

        if (state.providerW3m !== null && state.providerW3m.close) {
            await state.providerW3m.close();
        }

        commit('setProviderW3m', null);
        await state.web3Modal.clearCachedProvider();

        window.location.href = '../'; // 重定向到主页
    },

    async ethereumListener({ commit }: { commit: Commit }) {
        window.ethereum.on('accountsChanged', (accounts:any) => {
            if (state.isConnected) {
                commit("setActiveAccount", accounts[0]);
                commit("setEthersProvider", state.providerW3m);
                actions.fetchActiveBalance({ commit });
            }
        });

        window.ethereum.on('chainChanged', (chainId:any) => {
            commit("setChainData", chainId);
            commit("setEthersProvider", state.providerW3m);
            actions.fetchActiveBalance({ commit });
        });

    },

    async fetchActiveBalance({ commit }: { commit: Commit }) {
        const balance = await state.providerEthers.getBalance(state.activeAccount);
        commit("setActiveBalance", balance);
    }
};

//disconnectWallet：断开连接钱包，清空数据，清除缓存，跳转到首页。
// setActiveAccount：设置当前激活的钱包账户。
// setActiveBalance：设置当前激活钱包账户的余额。
// setChainData：设置当前区块链的 id 和名称。
// setEthersProvider：设置 ethers.js 的 provider。
// setIsConnected：设置当前钱包是否连接状态，并将其添加到本地存储中。
// setWeb3ModalInstance：设置 Web3Modal 实例。
const mutations = {
    async disconnectWallet(state:any) {
        console.log("disconnectWallet!");
        state.activeAccount = null;
        state.activeBalance = 0;
        state.providerEthers = null;
        if (state.providerW3m.close && state.providerW3m !== null) {
            await state.providerW3m.close();
        }
        state.providerW3m = null;
        await state.web3Modal.clearCachedProvider();

        window.location.href = '../'; // redirect to the Main page
    },

    setActiveAccount(state:any, selectedAddress:any) {
        state.activeAccount = selectedAddress;
    },

    setActiveBalance(state:any, balance:any) {
        state.activeBalance = balance;
    },

    setChainData(state:any, chainId:any) {
        state.chainId = chainId;

        switch(chainId) {
            case "0x1":
                state.chainName = "Mainnet";
                break;
            case "0x2a":
                state.chainName = "Kovan";
                break;
            case "0x3":
                state.chainName = "Ropsten";
                break;
            case "0x4":
                state.chainName = "Rinkeby";
                break;
            case "0x5":
                state.chainName = "Goerli";
                break;
            case "0x89":
                state.chainName = "Polygon(Matic) Mainnet";
                break;
            case "0x13881":
                state.chainName = "Mumbai Testnet";
                break;
            case "0x539": // 1337 (often used on localhost)
                state.chainName = "Localhost";
                break;
            case "0x1691": // 5777 (default in Ganache)
                state.chainName = "Ganache";
                break;
            default:
                state.chainName = "Localhost";
                break;
        }
    },

    async setEthersProvider(state:any, providerW3m:any) {
        state.providerW3m = providerW3m;
        state.providerEthers = new ethers.providers.Web3Provider(providerW3m);
    },

    setIsConnected(state:any, isConnected:any) {
        state.isConnected = isConnected;
        // add to persistent storage so that the user can be logged back in when revisiting website
        localStorage.setItem('isConnected', isConnected);
    },

    setWeb3ModalInstance(state:any, w3mObject:any) {
        state.web3Modal = w3mObject;
    }
};

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};