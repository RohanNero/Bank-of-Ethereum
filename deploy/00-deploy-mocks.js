const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")
const { network } = require("hardhat")

module.exports = async function () {
  const { getNamedAccounts, deployments } = hre
  const { deployer } = await getNamedAccounts()
  const { deploy, log } = deployments
    const chainId = network.config.chainId
    

    if (chainId == "31337") {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER]
        })

        await deploy("MockLinkToken", {
            from: deployer,
            args: [1000],
            log: true
        })
        log("Mocks deployed!")
        log("------------------------------------------------")
    }
}


module.exports.tags = ["all", "mocks"]
