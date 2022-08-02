//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
  // No state variables inside of libraries
  // All functions must be internal

  function getPrice(AggregatorV3Interface priceFeed)
    internal
    view
    returns (uint256 _price)
  {
    (, int256 price, , , ) = priceFeed.latestRoundData();
    return uint256(price * 1e10);
  }

  function getConversionRate(uint256 ethAmount, AggregatorV3Interface priceFeed)
    internal
    view
    returns (uint256)
  {
    uint256 price = getPrice(priceFeed);
    uint256 ethAmountInUsd = (price * ethAmount) / 1e18;
    return (ethAmountInUsd);
  }
}
