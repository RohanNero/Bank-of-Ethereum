//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "./PriceConverter.sol";

/// @title A contract for storing user's money
/// @author Rohan Nero
/// @notice This contract allows user's to deposit and withdraw money autonomously
/// @dev This implements price feeds as our library
contract Bank {
  // Type Declarations
  using PriceConverter for uint256;

  // State Variables
  uint256 public constant MINIMUMUSD = 7 * 1e18;
  address[] public accounts;
  mapping(address => uint256) private balances;
  AggregatorV3Interface public priceFeed;
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

  constructor(address priceFeedAddress) {
    priceFeed = AggregatorV3Interface(priceFeedAddress);
  }

  receive() external payable {
    deposit();
  }

  /// @notice This function allows you to deposit money into your 'bank account'
  /// @dev This requires you to deposit atleast $7 USD using price feed
  function deposit() public payable {
    uint256 oldBal = balances[msg.sender];
    require(
      msg.value.getConversionRate(priceFeed) > MINIMUMUSD,
      "Must Send Atleast $7 USD!"
    );
    balances[msg.sender] += msg.value;

    // Checking to see if account exists before adding to accounts array.
    if (exists(msg.sender) == false) {
      accounts.push(msg.sender);
    }
    emit depositInfo(msg.sender, msg.value);
    emit depositBalances(oldBal, balances[msg.sender]);
  }

  function withdraw(uint256 _amount) public {
    uint256 oldBal = balances[msg.sender];
    require(balances[msg.sender] >= _amount, "Insufficent Funds!");
    balances[msg.sender] -= _amount;
    (bool sent, ) = payable(msg.sender).call{value: _amount}("");
    require(sent, "Withdrawal Failed!");
    emit withdrawInfo(msg.sender, _amount);
    emit withdrawBalances(oldBal, balances[msg.sender]);
  }

  function getBalanceInETH() public view returns (uint256) {
    return (balances[msg.sender]);
  }

  function getBalanceInUSD() public view returns (uint256) {
    uint256 balanceInUSD = (balances[msg.sender].getConversionRate(priceFeed));
    return (balanceInUSD);
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
}

// 980,683 Original gas cost
// 960,941 After making MINIMUMUSD a constant variable
