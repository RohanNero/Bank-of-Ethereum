const {getNamedAccounts, network, ethers} = require("hardhat");


module.exports = async function () {

    const { deployer } = await getNamedAccounts();

    const Bank = await ethers.getContractFactory('Bank');
    const bank = await Bank.deploy();
    await bank.deployed();
    console.log(bank.address)

}