//const { link } = require("ethereum-waffle")
const { network } = require("hardhat")
const { networkConfig, DECIMALS, INITIAL_ANSWER, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async function () {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()
  const { deploy, log } = deployments
  const chainId = network.config.chainId
  //console.log(`chainId: ${chainId}`)

    // Want the ethUsdPriceFeed address to change depending on what chain we use
    // if chainId is X use address Z
    // if chainId is Y use address A
    //const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress, linkTokenAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdPriceFeed = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdPriceFeed.address
        const linkToken = await deployments.get("MockLinkToken")
        linkTokenAddress = linkToken.address
        }
     else {
       ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
       linkTokenAddress = networkConfig[chainId]["linkTokenAddress"]
    }
    //log(ethUsdPriceFeedAddress)
     const bank = await deploy("Bank", {
          from: deployer,
          args: [ethUsdPriceFeedAddress, linkTokenAddress],
         log: true,
          waitConfirmations: network.config.blockConfirmations || 1,
     })
    
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(bank.address, [ethUsdPriceFeedAddress, linkTokenAddress])     
    } else {}
}

module.exports.tags = ["all", "bank"]