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
      let mockLinkToken
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
        mockLinkToken = await ethers.getContract("MockLinkToken", deployer)
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
        // it("should revert if called with 0 value", async function () {
        //   const txResponse = bank.deposit()
        //   await expect(txResponse).to.be.revertedWith(
        //     "Must Send Atleast $7 USD!"
        //   )
        // })
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
      describe("getBalanceInUSD", function () {
        it("should return the user's ETH balance in terms of USD", async function () {
          const oneEth = ethers.utils.parseEther("1")
          //console.log(oneEth.toString())
          await bank.deposit({value: oneEth})
          const bal = await bank.getBalanceInUSD()
          //console.log(bal.toString())
          assert.equal(bal.toString(), "2000000000000000000000")
        })
      })
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
      describe("viewDepositedLinkBalance", function() {
        beforeEach(async function() {
          await mockLinkToken.approve(bank.address, 7)
          
        })
        it("returns user's LINK balance correctly", async function() {
          const initialBal = await bank.viewDepositedLinkBalance()
          await bank.depositApprovedLink()
          const finalBal = await bank.viewDepositedLinkBalance()
          // console.log(`initialBal: ${initialBal}`)
          // console.log(`finalBal: ${finalBal}`)
          assert.equal(initialBal.add(7).toString(), finalBal.toString())
        })
      })
      describe("withdrawLink", function() {
        beforeEach(async function() {
          await mockLinkToken.approve(bank.address, 100)
          await bank.depositApprovedLink()
        })
        it("allows owner to withdraw LINK correctly", async function() {
          const initialBal = await bank.viewDepositedLinkBalance()
          await bank.withdrawLink(100)
          const finalBal = await bank.viewDepositedLinkBalance()
          //console.log(`initialBal: ${initialBal}`)
          //console.log(`finalBal: ${finalBal}`)
          assert.equal(initialBal.sub(100).toString(), finalBal.toString())
        })
        it("reverts if withdraw exceeds balance", async function() {
          await expect(bank.withdrawLink(777)).to.be.revertedWith("Bank__InsufficientLinkBalance(777, 100)")
        })
      
      })
      describe("depositApprovedLink", function() {
        it("allows users to deposit link correctly", async function() {
          //console.log((await mockLinkToken.balanceOf(deployer)).toString())
          const initialBal = await bank.viewDepositedLinkBalance()
          await mockLinkToken.approve(bank.address, 100)
          await bank.depositApprovedLink()
          const finalBal = await bank.viewDepositedLinkBalance()
          //console.log(`initialBal: ${initialBal}`)
          //console.log(`finalBal: ${finalBal}`)
        })
      })
      describe("withdrawOwnerlessLink", function() {
        beforeEach(async function() {
          await mockLinkToken.approve(bank.address, 250)
          await bank.depositApprovedLink()
          await mockLinkToken.transfer(bank.address, 50)
        })
        it("withdraws only LINK without a declared owner", async function() {
          const linkBalance = await bank.viewWalletLinkBalance()
          const totalLinkDeposited = await bank.getTotalLinkDeposited()
          //console.log(`totalLinkDeposited: ${totalLinkDeposited.toString()}`)
          //console.log(`deployer's walletLinkBalance: ${linkBalance}`)
          await bank.withdrawOwnerlessLink()
          const newLinkBalance = await bank.viewWalletLinkBalance()
          const newTotalLinkDeposited = await bank.getTotalLinkDeposited()
          //console.log(`newTotalLinkDeposited: ${newTotalLinkDeposited.toString()}`)
          //console.log(`newLinkBalance: ${newLinkBalance}`)
          assert.equal(totalLinkDeposited.sub(50).toString(), newTotalLinkDeposited.toString())
        })
      })
      describe("getThisAddress", function() {
        it("returns address correctly", async function() {
          const addr = await bank.getThisAddress()
          //console.log(addr)
        })
        
      })
      describe("getLinkTokenAddress", function() {
        it("returns correct link token address", async function() {
          const addr = await bank.getLinkTokenAddress()
          // console.log(`link address: ${addr}`)
          // console.log(`mock address: ${mockLinkToken.address}`)
        })
        
      })
      describe("viewWalletLinkBalance", function() {
        it("returns amount of LINK in balance correctly", async function() {
          // amount I minted to msg.sender from mockLinkToken contract
          const expectedValue = "1000"
          const returnedValue = await bank.viewWalletLinkBalance()
          assert.equal(expectedValue, returnedValue.toString())
        })
      })
    })
