//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockLinkToken is ERC20 {

    constructor(uint totalSupply) ERC20("Mock Link", "MLT") {
        _mint(msg.sender, totalSupply);
    }
}