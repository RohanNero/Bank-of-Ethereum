const networkConfig = {
  4: {
    name: "rinkeby",
    ethUsdPriceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
  },
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
    linkTokenAddress: "0x326C977E6efc84E512bB9C30f76E30c160eD06FB",
  },
  137: {
    name: "polygon",
    ethUsdPriceFeed: "0xF9680D99D6C9589e2a93a78A04A279e509205945",
  },
  43113: {
    name: "fuji",
    ethUsdPriceFeed: "0x86d67c3D38D2bCeE722E601025C25a575021c6EA",
    linkTokenAddress: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
  },
  31337: {},
};

const developmentChains = ["hardhat", "localhost"];
const ethChains = ["goerli", "mainnet"];
const DECIMALS = 8;
const INITIAL_ANSWER = 200000000000;

module.exports = {
  networkConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
};
