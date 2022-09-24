import "@nomiclabs/hardhat-waffle"
import "hardhat-gas-reporter"
import "@nomiclabs/hardhat-ethers"
import "@nomiclabs/hardhat-etherscan"
import "dotenv/config"
import "solidity-coverage"
import "hardhat-deploy"

const PRIVATE_KEY = process.env.PRIVATE_KEY
const RINKEBY_URL = process.env.RINKEBY_URL
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY

module.exports = {
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer.
      // Note though that depending on how hardhat network are configured,
      // the account 0 on one network can be different than on another
    },
  },
  solidity: {
    compilers: [{ version: "0.8.7" }, { version: "0.6.6" }],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations: 1,
    },
    goerli: {
      url: GOERLI_RPC_URL || "",
      accounts: [PRIVATE_KEY],
      chainId: 5,
    },
    rinkeby: {
      url: RINKEBY_URL || "",
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 7,
    },
  },
  gasReporter: {
    enabled: false,
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 500000,
  },
}
