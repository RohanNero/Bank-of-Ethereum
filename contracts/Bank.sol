//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "hardhat/console.sol";
import "./PriceConverter.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";



error Bank__LinkDepositFailed();
error Bank__InsufficientLinkBalance(uint amountRequested, uint currentLinkBalance);

/// @title A contract for storing user's money
/// @author Rohan Nero
/// @notice This contract allows user's to deposit and withdraw money autonomously
/// @dev This implements price feeds as our library
contract Bank is Ownable {
  // Type Declarations
  using PriceConverter for uint256;


  // Global Variables
  uint256 public constant MINIMUMUSD = 7 * 1e18;
  address[] public accounts;
  mapping(address => uint256) private ethBalances;
  mapping(address => uint256) private linkBalances;
  AggregatorV3Interface public priceFeed;
  IERC20 token;
  // Events and Modifiers

  event depositInfo(address, uint256);
  event depositBalances(uint256, uint256);
  event withdrawInfo(address, uint256);
  event withdrawBalances(uint256, uint256);

  // constructor
  // receive / fallback
  // external
  // public
  // internal
  // private
  // view / pure

  constructor(address priceFeedAddress, address tokenAddress) {
    priceFeed = AggregatorV3Interface(priceFeedAddress);
    token = IERC20(tokenAddress);
  }

  receive() external payable {
    deposit();
  }

  /// @notice This function allows you to deposit money into your 'bank account'
  /// @dev This requires you to deposit atleast $7 USD using price feed
  function deposit() public payable {
    uint256 oldBal = ethBalances[msg.sender];
    // require(
    //   msg.value.getConversionRate(priceFeed) > MINIMUMUSD,
    //   "Must Send Atleast $7 USD!"
    // );
    ethBalances[msg.sender] += msg.value;

    // Checking to see if account exists before adding to accounts array.
    if (exists(msg.sender) == false) {
      accounts.push(msg.sender);
    }
    emit depositInfo(msg.sender, msg.value);
    emit depositBalances(oldBal, ethBalances[msg.sender]);
  }

  function depositApprovedLink() public {
    uint amount = token.allowance(msg.sender, address(this));
    require(token.transferFrom(msg.sender, address(this), amount));
    if (exists(msg.sender) == false) {
      accounts.push(msg.sender);
    }
    linkBalances[msg.sender] += amount;
  }

  function withdraw(uint256 _amount) public {
    uint256 oldBal = ethBalances[msg.sender];
    require(ethBalances[msg.sender] >= _amount, "Insufficent Funds!");
    ethBalances[msg.sender] -= _amount;
    (bool sent, ) = payable(msg.sender).call{value: _amount}("");
    require(sent, "Withdrawal Failed!");
    emit withdrawInfo(msg.sender, _amount);
    emit withdrawBalances(oldBal, ethBalances[msg.sender]);
  }

  function withdrawLink(uint amount) public onlyOwner() {
    if (amount <= linkBalances[msg.sender]) {
      require(token.transfer(msg.sender, amount));
      linkBalances[msg.sender] -= amount;
    } else {
      revert Bank__InsufficientLinkBalance(amount, linkBalances[msg.sender]);
    }
  }

  function withdrawOwnerlessLink() public onlyOwner {
    uint totalOwnedLink;
    for(uint i = 0; i < accounts.length; i++) {
      totalOwnedLink += linkBalances[accounts[i]];
      //console.log("linkBalances:",linkBalances[accounts[i]]);
    } 
    if(totalOwnedLink < getTotalLinkDeposited()) {
      uint difference = (getTotalLinkDeposited()) - totalOwnedLink;
      //console.log("totalOwnedLink:", totalOwnedLink);
      //console.log("totalLinkDeposited:",getTotalLinkDeposited());
      //console.log("difference", difference);
      token.transfer(msg.sender, difference);

    }
  }

  function getBalanceInETH() public view returns (uint256) {
    return (ethBalances[msg.sender]);
  }

  function getBalanceInUSD() public view returns (uint256) {
    uint256 balanceInUSD = (ethBalances[msg.sender].getConversionRate(priceFeed));
    return (balanceInUSD);
  }

  function viewDepositedLinkBalance() public view returns(uint linkBal) {
    linkBal = linkBalances[msg.sender];
  }

  function viewWalletLinkBalance() public view returns(uint walletBal) {
    walletBal = token.balanceOf(msg.sender);
  }

  function getTotalLinkDeposited() public view onlyOwner returns(uint totalLinkDeposited) {
    totalLinkDeposited = token.balanceOf(address(this));
  }

  function getThisAddress() public view returns(address) {
    return address(this);
  }

  function getLinkTokenAddress() public view returns(address) {
    return address(token);
  }

  /// @notice This function loops through the accounts array to find existing accounts
  /// @dev This allows the deposit function to only add new accounts to the accounts array
  function exists(address _account) public view returns (bool) {
    for (uint256 i = 0; i < accounts.length; i++) {
      if (accounts[i] == _account) {
        return true;
      }
    }
    return false;
  }

  // function getLinkAllowance() public view returns(uint allowance) {
  //   allowance = token.allowance(msg.sender, address(this));
  //   console.log("allowance:", allowance);
  // }

  
}

// 980,683 Original gas cost
// 960,941 After making MINIMUMUSD a constant variable
