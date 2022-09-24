
const { network } = require("hardhat")
const { networkConfig, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function () {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()
  const { deploy, log } = deployments
  const chainId = network.config.chainId

    // Want the ethUsdPriceFeed address to change depending on what chain we use
    // if chainId is X use address Z
    // if chainId is Y use address A
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (chainId == "31337") {
        const ethUsdPriceFeed = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdPriceFeed.address
        }
     else {
       ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    //log(ethUsdPriceFeedAddress)
     const bank = await deploy("Bank", {
          from: deployer,
          args: [ethUsdPriceFeedAddress],
         log: true,
          waitConfirmations: network.config.blockConfirmations || 1,
     })
    

    if (!chainId == "31337" && process.env.ETHERSCAN_API_KEY) {
        await verify(bank.address, [ethUsdPriceFeedAddress])     
    } else {}
}

module.exports.tags = ["all", "bank"]