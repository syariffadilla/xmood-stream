const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey || privateKey === "your_private_key_here") {
    throw new Error("❌ Deployer account not found! Please check your PRIVATE_KEY in .env file.");
  }
  const formattedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;

  const isBotChain = network.name === "botchain" || network.name === "botchainTestnet" || network.config.chainId === 968 || network.config.chainId === 677;
  const chainId = network.config.chainId || (isBotChain ? 968 : 84532);
  const rpcUrl = network.config.url || (isBotChain ? "https://rpc.bohr.life" : "https://sepolia.base.org");
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const deployer = new ethers.Wallet(formattedKey, provider);

  const balance = await provider.getBalance(deployer.address);
  const currencySymbol = isBotChain ? "BOT" : "ETH";
  const explorerBase = isBotChain ? "https://scan.botchain.ai" : "https://sepolia.basescan.org";

  console.log("==================================================");
  console.log("🚀 Starting X-Mood Stream Deployment to BOT Chain");
  console.log("==================================================");
  console.log(`🌐 Network:          ${network.name} (Chain ID: ${chainId})`);
  console.log(`👤 Deployer Address: ${deployer.address}`);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ${currencySymbol}`);
  console.log("==================================================");

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const gasPrice = 25000000000n; // 25 Gwei

  async function deployRaw(contractName, constructorArgs = []) {
    const artifact = await hre.artifacts.readArtifact(contractName);
    const iface = new ethers.Interface(artifact.abi);
    
    let bytecode = artifact.bytecode;
    if (constructorArgs.length > 0) {
      const encodedArgs = iface.encodeDeploy(constructorArgs);
      bytecode = ethers.concat([bytecode, encodedArgs]);
    }

    const nonce = await provider.getTransactionCount(deployer.address, "latest");
    console.log(`\n📦 Deploying ${contractName} (Nonce: ${nonce})...`);

    const tx = new ethers.Transaction();
    tx.type = 0;
    tx.chainId = chainId;
    tx.nonce = nonce;
    tx.gasPrice = gasPrice;
    tx.gasLimit = 4500000n;
    tx.data = bytecode;
    tx.to = null;

    const sig = deployer.signingKey.sign(tx.unsignedHash);
    tx.signature = sig;

    const txResponse = await provider.broadcastTransaction(tx.serialized);
    const txHash = txResponse.hash || txResponse;
    console.log(`    Tx Hash: ${txHash}`);

    let receipt = null;
    let attempts = 0;
    while (!receipt && attempts < 40) {
      receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        process.stdout.write(".");
        await sleep(2000);
        attempts++;
      }
    }

    if (!receipt || !receipt.contractAddress) {
      throw new Error(`\n❌ Deployment of ${contractName} failed to confirm.`);
    }

    const deployedAddress = receipt.contractAddress;
    console.log(`\n✅ ${contractName} deployed to: ${deployedAddress} (Block: ${receipt.blockNumber})`);
    await sleep(2500);

    const contract = new ethers.Contract(deployedAddress, artifact.abi, deployer);
    return { contract, address: deployedAddress };
  }

  async function sendContractCall(contract, functionName, args = []) {
    const contractAddress = await contract.getAddress();
    const data = contract.interface.encodeFunctionData(functionName, args);
    const nonce = await provider.getTransactionCount(deployer.address, "latest");

    console.log(`\n⚙️ Calling ${functionName}(${args.join(", ")}) [Nonce: ${nonce}]...`);

    const tx = new ethers.Transaction();
    tx.type = 0;
    tx.chainId = chainId;
    tx.nonce = nonce;
    tx.gasPrice = gasPrice;
    tx.gasLimit = 500000n;
    tx.data = data;
    tx.to = contractAddress;

    const sig = deployer.signingKey.sign(tx.unsignedHash);
    tx.signature = sig;

    const txResponse = await provider.broadcastTransaction(tx.serialized);
    const txHash = txResponse.hash || txResponse;
    console.log(`    Tx Hash: ${txHash}`);

    let receipt = null;
    let attempts = 0;
    while (!receipt && attempts < 30) {
      receipt = await provider.getTransactionReceipt(txHash);
      if (!receipt) {
        process.stdout.write(".");
        await sleep(2000);
        attempts++;
      }
    }
    console.log(`\n    Confirmed in Block ${receipt?.blockNumber}`);
    await sleep(2500);
  }

  // 1. Deploy MockUSDT
  const { contract: mockUSDT, address: mockUSDTAddress } = await deployRaw("MockUSDT");

  // 2. Deploy RewardToken ($XMS)
  const { contract: rewardToken, address: rewardTokenAddress } = await deployRaw("RewardToken");

  // 3. Deploy XMoodStreamCore
  const { contract: coreContract, address: coreContractAddress } = await deployRaw("XMoodStreamCore");

  // 4. Deploy TipVault (treasury = deployer address)
  const treasuryAddress = deployer.address;
  const { contract: tipVault, address: tipVaultAddress } = await deployRaw("TipVault", [
    mockUSDTAddress,
    treasuryAddress,
  ]);

  // 5. Deploy RewardDistributor
  const { contract: rewardDistributor, address: rewardDistributorAddress } = await deployRaw("RewardDistributor", [
    rewardTokenAddress,
    coreContractAddress,
    tipVaultAddress,
  ]);

  // 6. Grant Minter Roles on RewardToken
  console.log("\n⚙️ Configuring permissions on RewardToken...");
  
  console.log(` - Setting XMoodStreamCore as minter...`);
  await sendContractCall(rewardToken, "setMinter", [coreContractAddress, true]);

  console.log(` - Setting RewardDistributor as minter...`);
  await sendContractCall(rewardToken, "setMinter", [rewardDistributorAddress, true]);
  
  console.log("✅ All minter permissions configured successfully.");

  // 7. Save deployed addresses
  const deploymentInfo = {
    network: network.name,
    chainId: chainId,
    chainName: chainId === 677 ? "BOT Chain Mainnet" : (chainId === 968 ? "BOT Chain Testnet" : "Base Sepolia"),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    treasury: treasuryAddress,
    contracts: {
      MockUSDT: mockUSDTAddress,
      RewardToken: rewardTokenAddress,
      XMoodStreamCore: coreContractAddress,
      TipVault: tipVaultAddress,
      RewardDistributor: rewardDistributorAddress,
    },
    explorerUrls: {
      MockUSDT: `${explorerBase}/address/${mockUSDTAddress}`,
      RewardToken: `${explorerBase}/address/${rewardTokenAddress}`,
      XMoodStreamCore: `${explorerBase}/address/${coreContractAddress}`,
      TipVault: `${explorerBase}/address/${tipVaultAddress}`,
      RewardDistributor: `${explorerBase}/address/${rewardDistributorAddress}`,
    },
  };

  const filename = chainId === 677 ? "deployed-addresses-botchain-mainnet.json" : (isBotChain ? "deployed-addresses-botchain.json" : "deployed-addresses.json");
  const outputPath = path.join(__dirname, "..", filename);
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Saved deployment addresses to: ${outputPath}`);

  if (chainId === 677) {
    const backupPath = path.join(__dirname, "..", "deployed-addresses-botchain.json");
    fs.writeFileSync(backupPath, JSON.stringify(deploymentInfo, null, 2));
  }

  // Update frontend addresses.js
  const frontendAddressesPath = path.join(__dirname, "..", "frontend", "src", "contracts", "addresses.js");
  if (fs.existsSync(frontendAddressesPath)) {
    const isMainnet = chainId === 677;
    const chainTitle = isMainnet ? "BOT Chain Mainnet" : (chainId === 968 ? "BOT Chain Testnet" : "Base Sepolia");

    const content = `export const CONTRACT_ADDRESSES = {
  chainId: ${chainId},
  chainName: '${chainTitle}',
  explorer: '${explorerBase}',
  MockUSDT: '${mockUSDTAddress}',
  RewardToken: '${rewardTokenAddress}',
  XMoodStreamCore: '${coreContractAddress}',
  TipVault: '${tipVaultAddress}',
  RewardDistributor: '${rewardDistributorAddress}',
};

export const MULTICHAIN_CONTRACTS = {
  968: {
    chainId: 968,
    chainName: 'BOT Chain Testnet',
    explorer: 'https://scan.botchain.ai',
    MockUSDT: '0xBe73e5e6dda3FcA356D2bB9228C33258c526147E',
    RewardToken: '0x6cCd0e61710044c3060Fd51F572bF2f677275a87',
    XMoodStreamCore: '0x16C5cb15a0CeB9f5dc83b9FE58aa475B0363DdaC',
    TipVault: '0x00299f76c116d2F03E342E6911e16a892b02C4E3',
    RewardDistributor: '0xF49ddF41b02a714c38347Cc724f094706fDBd86c',
  },
  677: {
    chainId: 677,
    chainName: 'BOT Chain Mainnet',
    explorer: 'https://scan.botchain.ai',
    MockUSDT: '${isMainnet ? mockUSDTAddress : "0xBe73e5e6dda3FcA356D2bB9228C33258c526147E"}',
    RewardToken: '${isMainnet ? rewardTokenAddress : "0x6cCd0e61710044c3060Fd51F572bF2f677275a87"}',
    XMoodStreamCore: '${isMainnet ? coreContractAddress : "0x16C5cb15a0CeB9f5dc83b9FE58aa475B0363DdaC"}',
    TipVault: '${isMainnet ? tipVaultAddress : "0x00299f76c116d2F03E342E6911e16a892b02C4E3"}',
    RewardDistributor: '${isMainnet ? rewardDistributorAddress : "0xF49ddF41b02a714c38347Cc724f094706fDBd86c"}',
  },
  84532: {
    chainId: 84532,
    chainName: 'Base Sepolia',
    explorer: 'https://sepolia.basescan.org',
    MockUSDT: '0x8Fa6d0E71962A00E093f913D7A59d38e72aaE869',
    RewardToken: '0xedE78e63e0d50FF92e936a6699E0303208a0892F',
    XMoodStreamCore: '0xe417f89D94CE38364Da1757BE68910765AdEdEC2',
    TipVault: '0x5a72dC0f66e85aD54dCc4Ca7377b0Da5F788923E',
    RewardDistributor: '0xd8b005D006994cDEDFABf0DF170D0d2C58F27335',
  },
};
`;
    fs.writeFileSync(frontendAddressesPath, content);
    console.log(`💾 Updated frontend addresses at: ${frontendAddressesPath}`);
  }

  console.log("\n==================================================");
  console.log("🎉 ALL CONTRACTS DEPLOYED & CONFIGURED SUCCESSFULLY ON BOT CHAIN!");
  console.log("==================================================");
  console.table(deploymentInfo.contracts);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
