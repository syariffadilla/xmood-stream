require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

function getAccounts() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey === "your_private_key_here") {
    return [];
  }
  const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  return [formattedKey];
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    baseSepolia: {
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: getAccounts(),
      chainId: 84532,
    },
    botchainTestnet: {
      url: process.env.BOTCHAIN_TESTNET_RPC_URL || "https://rpc.bohr.life",
      accounts: getAccounts(),
      chainId: 968,
      gasPrice: 25000000000,
    },
    botchain: {
      url: process.env.BOTCHAIN_RPC_URL || "https://rpc.botchain.ai",
      accounts: getAccounts(),
      chainId: 677,
      gasPrice: 25000000000,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BASESCAN_API_KEY || "PLACEHOLDER",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
