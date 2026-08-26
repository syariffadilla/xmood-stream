const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await ethers.getSigners();

  if (!deployer) {
    throw new Error(
      "❌ Deployer account not found! Please check your PRIVATE_KEY in .env file."
    );
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("==================================================");
  console.log("🚀 Starting X-Mood Stream Deployment");
  console.log("==================================================");
  console.log(`🌐 Network:          ${network.name} (Chain ID: ${network.config.chainId || "N/A"})`);
  console.log(`👤 Deployer Address: ${deployer.address}`);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(balance)} ETH`);
  console.log("==================================================");

  if (balance === 0n && network.name !== "hardhat") {
    console.warn("⚠️ Warning: Deployer balance is 0 ETH. The transaction may fail due to lack of gas.");
  }

  // 1. Deploy MockUSDT
  console.log("\n📦 [1/5] Deploying MockUSDT...");
  const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDTFactory.deploy();
  await mockUSDT.waitForDeployment();
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log(`✅ MockUSDT deployed to: ${mockUSDTAddress}`);

  // 2. Deploy RewardToken ($XMS)
  console.log("\n📦 [2/5] Deploying RewardToken ($XMS)...");
  const RewardTokenFactory = await ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardTokenFactory.deploy();
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log(`✅ RewardToken deployed to: ${rewardTokenAddress}`);

  // 3. Deploy XMoodStreamCore
  console.log("\n📦 [3/5] Deploying XMoodStreamCore...");
  const CoreFactory = await ethers.getContractFactory("XMoodStreamCore");
  const coreContract = await CoreFactory.deploy();
  await coreContract.waitForDeployment();
  const coreContractAddress = await coreContract.getAddress();
  console.log(`✅ XMoodStreamCore deployed to: ${coreContractAddress}`);

  // 4. Deploy TipVault (treasury = deployer address)
  const treasuryAddress = deployer.address;
  console.log(`\n📦 [4/5] Deploying TipVault (Treasury: ${treasuryAddress})...`);
  const TipVaultFactory = await ethers.getContractFactory("TipVault");
  const tipVault = await TipVaultFactory.deploy(mockUSDTAddress, treasuryAddress);
  await tipVault.waitForDeployment();
  const tipVaultAddress = await tipVault.getAddress();
  console.log(`✅ TipVault deployed to: ${tipVaultAddress}`);

  // 5. Deploy RewardDistributor
  console.log("\n📦 [5/5] Deploying RewardDistributor...");
  const RewardDistributorFactory = await ethers.getContractFactory("RewardDistributor");
  const rewardDistributor = await RewardDistributorFactory.deploy(
    rewardTokenAddress,
    coreContractAddress,
    tipVaultAddress
  );
  await rewardDistributor.waitForDeployment();
  const rewardDistributorAddress = await rewardDistributor.getAddress();
  console.log(`✅ RewardDistributor deployed to: ${rewardDistributorAddress}`);

  // 6. Grant Minter Roles on RewardToken
  console.log("\n⚙️ Configuring permissions on RewardToken...");
  
  console.log(` - Setting XMoodStreamCore (${coreContractAddress}) as minter...`);
  const tx1 = await rewardToken.setMinter(coreContractAddress, true);
  await tx1.wait();

  console.log(` - Setting RewardDistributor (${rewardDistributorAddress}) as minter...`);
  const tx2 = await rewardToken.setMinter(rewardDistributorAddress, true);
  await tx2.wait();
  console.log("✅ Minter permissions configured successfully.");

  // 7. Save deployed addresses to deployed-addresses.json
  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId || 84532,
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
      MockUSDT: `https://sepolia.basescan.org/address/${mockUSDTAddress}`,
      RewardToken: `https://sepolia.basescan.org/address/${rewardTokenAddress}`,
      XMoodStreamCore: `https://sepolia.basescan.org/address/${coreContractAddress}`,
      TipVault: `https://sepolia.basescan.org/address/${tipVaultAddress}`,
      RewardDistributor: `https://sepolia.basescan.org/address/${rewardDistributorAddress}`,
    },
  };

  const outputPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Saved deployment addresses to: ${outputPath}`);

  console.log("\n==================================================");
  console.log("🎉 ALL CONTRACTS DEPLOYED & CONFIGURED SUCCESSFULLY");
  console.log("==================================================");
  console.table(deploymentInfo.contracts);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
