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

  const filename = isBotChain ? "deployed-addresses-botchain.json" : "deployed-addresses.json";
  const outputPath = path.join(__dirname, "..", filename);
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Saved deployment addresses to: ${outputPath}`);

  console.log("\n==================================================");
  console.log("🎉 ALL CONTRACTS DEPLOYED & CONFIGURED SUCCESSFULLY ON BOT CHAIN!");
  console.log("==================================================");
  console.table(deploymentInfo.contracts);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
