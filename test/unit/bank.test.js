const { assert, expect } = require("chai")
const { parseUnits } = require("ethers/lib/utils")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
  ? describe.skip
  : describe("Bank", function () {
      let bank
      let deployer
      let mockV3Aggregator
      const sendValue = parseUnits("5000000", "gwei")
      beforeEach(async function () {
        //sendValue = parseUnits("5000000", "gwei")
        const accounts = await ethers.getSigners()
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        bank = await ethers.getContract("Bank", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })
      describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
          const response = await bank.priceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })
      describe("Deposit", function () {
        //let sendValue
        beforeEach(async function () {
          await bank.deposit({ value: sendValue })
        })
        it("should revert if called with 0 value", async function () {
          const txResponse = bank.deposit()
          await expect(txResponse).to.be.revertedWith(
            "Must Send Atleast $7 USD!"
          )
        })
        it("should update user balance after deposit", async function () {
          const oldBal = await bank.getBalanceInETH()
          const txResponse = bank.deposit({ value: sendValue })
          const newBal = await bank.getBalanceInETH()
          assert.equal(oldBal.add(sendValue).toString(), newBal.toString())
        })
        it("should add user's address to the 'accounts' array", async function () {
          assert.equal(await bank.accounts[0], deployer.address)
        })
        it("should emit the deposit info", async function () {
          const [user] = await ethers.getSigners()
          await expect(bank.deposit({ value: sendValue }))
            .to.emit(bank, "depositInfo")
            .withArgs(user.address, sendValue)
        })
        it("should emit the balances from before and after deposit", async function () {
          await expect(bank.deposit({ value: sendValue }))
            .to.emit(bank, "depositBalances")
            .withArgs(sendValue, sendValue.add(sendValue))
        })
      })
      describe("withdraw", function () {
        beforeEach(async function () {
          await bank.deposit({ value: sendValue })
        })
        it("should revert if you try to withdraw more than you have", async function () {
          await expect(bank.withdraw(sendValue.add(1))).to.be.revertedWith(
            "Insufficent Funds!"
          )
        })
        it("should update the user's balance after withdraw", async function () {
          const oldBal = await bank.getBalanceInETH()
          await bank.withdraw(37)
          const newBal = await bank.getBalanceInETH()
          assert.equal(oldBal.sub(37).toString(), newBal.toString())
        })
        it("should emit the withdraw info", async function () {
          await expect(bank.withdraw(77))
            .to.emit(bank, "withdrawInfo")
            .withArgs(deployer, "77")
        })
        it("should emit the balances from before and after withdrawal", async function () {
          await expect(bank.withdraw(sendValue))
            .to.emit(bank, "withdrawBalances")
            .withArgs(sendValue, "0")
        })
      })
      describe("getBalanceInETH", function () {
        it("should return the user's balance correctly", async function () {
          const tx = await bank.getBalanceInETH()
          await bank.deposit({ value: sendValue })
          const newTx = await bank.getBalanceInETH()
          assert.equal(tx.add(sendValue).toString(), newTx.toString())
        })
      })
      // describe("getBalanceInUSD", function () {
      //   it.only("should return the user's balance in terms of USD", async function () {
      //     const tx = await bank.MINIMUMUSD()
      //     console.log(tx.toString())
      //     const bal = await bank.getBalanceInUSD()
      //     console.log(bal)
      //     const expectedValue = await bank.sendValue.getConversionRate()
      //     console.log(expectedValue)
      //   })
      // })
      describe("receive", function () {
        it("should call the deposit function when money is sent to contract", async function () {
          const [owner] = await ethers.getSigners()
          const tx = await owner.sendTransaction({
            to: bank.address,
            value: sendValue,
          })
          const bal = await bank.connect(owner).getBalanceInETH()
          assert.equal(bal, sendValue.toString())
        })
      })
    })
