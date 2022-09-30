const { inputToConfig } = require("@ethereum-waffle/compiler")
const { assert } = require("chai")
const { parseUnits } = require("ethers/lib/utils")
const { getNamedAccounts, ethers, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

developmentChains.includes(network.name)
  ? describe.skip
  : describe("Bank", function () {
      let bank
      let deployer
      const sendValue = parseUnits("5000000", "gwei")

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        bank = await ethers.getContract("Bank", deployer)
      })
      it("should allow users to deposit and withdraw money", async function () {
        console.log("preparing bank deposit...")
        const value  = "10000000000000000"
        const tx = await bank.deposit({ value: value })
        const txReceipt = await tx.wait()
        const { gasUsed, effectiveGasPrice } = txReceipt
        //console.log(gasUsed.toString())
        //console.log(effectiveGasPrice.toString())
        const gasPrice = gasUsed.mul(effectiveGasPrice)
        const initialBal = await bank.getBalanceInETH()
        console.log("deposit successful!")
        console.log(`initial balance: ${initialBal.toString()}`)
        const transaction = await bank.withdraw(value)
        await transaction.wait(1)
        const bal = await bank.getBalanceInETH()
        console.log(`final balance: ${bal.toString()}`)
        assert.equal(bal.toString(), (initialBal.sub(value)).toString())
      })
    })
