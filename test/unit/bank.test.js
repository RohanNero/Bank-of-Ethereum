const { expect, assert } = require("chai")
const { Contract } = require("ethers")
const { ethers } = require("hardhat")
const {
  isCallTrace,
} = require("hardhat/internal/hardhat-network/stack-traces/message-trace")
const { getFunctionDocumentation } = require("typechain")

describe("Bank", function () {
  beforeEach(async function () {
    Bank = await ethers.getContractFactory("Bank")
    bank = await Bank.deploy()
  })
  describe("Deposit", function () {
    it("should revert if called with 0 value", async function () {
      const txResponse = bank.deposit()
      await expect(txResponse).to.be.revertedWith("No Value Sent!")
    })
    it("should update user balance after deposit", async function () {
      //const [user] = await ethers.getSigners()
      const oldBal = await bank.getBalance()
      const txResponse = bank.deposit({ value: 100 })
      const newBal = await bank.getBalance()
      assert.equal(oldBal.add(100).toString(), newBal.toString())
    })
    it("should add user's address to the 'accounts' array", async function () {
      // This test only works whilst the "accounts" array is at the 0 storage index in the Bank contract.

      const [user, otherAccount] = await ethers.getSigners()
      const initialLength = ethers.BigNumber.from(
        await ethers.provider.getStorageAt(bank.address, 0)
      )
      await bank.deposit({ value: 100 })
      await bank.connect(otherAccount).deposit({ value: 17 })
      const finalLength = ethers.BigNumber.from(
        await ethers.provider.getStorageAt(bank.address, 0)
      )
      assert.equal(initialLength.add(2).toString(), finalLength.toString())
    })
    it("should emit the deposit info", async function () {
      const [user] = await ethers.getSigners()
      await expect(bank.deposit({ value: 100 }))
        .to.emit(bank, "depositInfo")
        .withArgs(user.address, "100")
    })
    it("should emit the balances from before and after deposit", async function () {
      await expect(bank.deposit({ value: 777 }))
        .to.emit(bank, "depositBalances")
        .withArgs("0", "777")
    })
  })
  describe("withdraw", function () {
    beforeEach(async function () {
      await bank.deposit({ value: 100 })
    })
    it("should revert if you try to withdraw more than you have", async function () {
      await expect(bank.withdraw(101)).to.be.revertedWith("Insufficent Funds!")
    })
    it("should update the user's balance after withdraw", async function () {
      const oldBal = await bank.getBalance()
      await bank.withdraw(37)
      const newBal = await bank.getBalance()
      assert.equal(oldBal.sub(37).toString(), newBal.toString())
    })
    it("should emit the withdraw info", async function () {
      const [user] = await ethers.getSigners()
      await expect(bank.withdraw(77))
        .to.emit(bank, "withdrawInfo")
        .withArgs(user.address, "77")
    })
    it("should emit the balances from before and after withdrawal", async function () {
      await expect(bank.withdraw(77))
        .to.emit(bank, "withdrawBalances")
        .withArgs("100", "23")
    })
  })
  describe("getBalance", function () {
    it("should return the user's balance correctly", async function () {
      const tx = await bank.getBalance()
      await bank.deposit({ value: 100 })
      const newTx = await bank.getBalance()
      assert.equal(tx.add(100).toString(), newTx.toString())
    })
  })
  describe("receive", function () {
    it("should call the deposit function when money is sent to contract", async function () {
      const [user] = await ethers.getSigners()
      const oldBal = await bank.getBalance()
      await expect(user.sendTransaction({
        to: bank.address,
        value: 100,
      })).to.emit(bank, "depositInfo").withArgs(user.address, "100")
    })
  })
})
