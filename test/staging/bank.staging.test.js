const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert } = require("chai")
const { parseUnits, parseEther } = require("ethers/lib/utils")
const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")
const abi = require("../../constants/linkToken-abi")

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Bank", function () {
      let bank
      let deployer
      let linkContract
      const chainId = network.config.chainId

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        bank = await ethers.getContract("Bank", deployer)
        console.log(`bank address: ${bank.address}`)
        const linkContractAddress = networkConfig[chainId]["linkTokenAddress"]
        linkContract = await ethers.getContractAt(abi, linkContractAddress, deployer)
        //console.log(`linkContract: ${linkContract.address}`)
        //console.log(abi)
      })
      it("should allow users to deposit and withdraw both ETH and LINK", async function () {
        console.log("-------------------------------------------")
        console.log("depositing ETH...")
        const value  = "10000000000000000"
        const oneLink = "1000000000000000000"
        const tx = await bank.deposit({ value: value })
        const txReceipt = await tx.wait()
        //const { gasUsed, effectiveGasPrice } = txReceipt
        //console.log(gasUsed.toString())
        //console.log(effectiveGasPrice.toString())
        //const gasPrice = gasUsed.mul(effectiveGasPrice)
        console.log("depositing LINK...")
        
        
        const approveTx = await linkContract.approve(bank.address, oneLink)
        await approveTx.wait(1)
        const depositLinkTx = await bank.depositApprovedLink()
        await depositLinkTx.wait(1)
        console.log("both deposits successful!")
        console.log("-------------------------------------------")
        console.log("preparing to withdraw...")
        const initialBal = await bank.getBalanceInETH()
        const initialLinkBal = await bank.viewDepositedLinkBalance()
        console.log(`initial ETH balance: ${initialBal.toString()}`)
        console.log(`initial LINK balance: ${initialLinkBal.toString()}`)
        const transaction = await bank.withdraw(value)
        const linkTx = await bank.withdrawLink(oneLink)
        await transaction.wait(1)
        await linkTx.wait(1)
        const bal = await bank.getBalanceInETH()
        const linkBal = await bank.viewDepositedLinkBalance()
        console.log(`final ETH balance: ${bal.toString()}`)
        console.log(`final LINK balance: ${linkBal.toString()}`)
        console.log("-------------------------------------------")
        assert.equal(bal.toString(), (initialBal.sub(value)).toString())
        assert.equal(linkBal.toString(), (initialLinkBal.sub(oneLink)).toString())
      })
    })
