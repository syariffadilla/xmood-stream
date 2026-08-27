const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log("🔍 AUTOMATIC TEST SUITE: BOT CHAIN MAINNET (677)");
  console.log("==================================================");

  const rpcUrl = "https://rpc.botchain.ai";
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const network = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();
  console.log(`🌐 Connected to Network: Chain ID ${network.chainId} (Current Block: ${blockNumber})`);

  const addressesPath = path.join(__dirname, "..", "deployed-addresses-botchain-mainnet.json");
  const deployment = JSON.parse(fs.readFileSync(addressesPath, "utf-8"));
  const contracts = deployment.contracts;

  let passed = 0;
  let total = 0;

  function assertTest(condition, testName, details = "") {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName} ${details ? `(${details})` : ""}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ""}`);
    }
  }

  console.log("\n📦 1. Testing MockUSDT Contract...");
  const mockUsdtAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function totalSupply() view returns (uint256)"
  ];
  const mockUSDT = new ethers.Contract(contracts.MockUSDT, mockUsdtAbi, provider);
  const usdtName = await mockUSDT.name();
  const usdtSymbol = await mockUSDT.symbol();
  const usdtDecimals = await mockUSDT.decimals();
  assertTest(usdtName === "Mock USDT", "MockUSDT Name", usdtName);
  assertTest(usdtSymbol === "mUSDT", "MockUSDT Symbol", usdtSymbol);
  assertTest(Number(usdtDecimals) === 6, "MockUSDT Decimals", usdtDecimals.toString());

  console.log("\n📦 2. Testing RewardToken ($XMS) Contract...");
  const rewardTokenAbi = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function isMinter(address) view returns (bool)",
    "function MAX_SUPPLY() view returns (uint256)"
  ];
  const rewardToken = new ethers.Contract(contracts.RewardToken, rewardTokenAbi, provider);
  const xmsName = await rewardToken.name();
  const xmsSymbol = await rewardToken.symbol();
  const xmsDecimals = await rewardToken.decimals();
  const isCoreMinter = await rewardToken.isMinter(contracts.XMoodStreamCore);
  const isDistributorMinter = await rewardToken.isMinter(contracts.RewardDistributor);

  assertTest(xmsName === "X-Mood Stream Reward", "RewardToken Name", xmsName);
  assertTest(xmsSymbol === "XMS", "RewardToken Symbol", xmsSymbol);
  assertTest(Number(xmsDecimals) === 18, "RewardToken Decimals", xmsDecimals.toString());
  assertTest(isCoreMinter === true, "XMoodStreamCore Minter Permission", `Allowed: ${isCoreMinter}`);
  assertTest(isDistributorMinter === true, "RewardDistributor Minter Permission", `Allowed: ${isDistributorMinter}`);

  console.log("\n📦 3. Testing XMoodStreamCore Contract...");
  const coreAbi = [
    "function getTotalPosts() view returns (uint256)",
    "function owner() view returns (address)"
  ];
  const core = new ethers.Contract(contracts.XMoodStreamCore, coreAbi, provider);
  const totalPosts = await core.getTotalPosts();
  const coreOwner = await core.owner();
  assertTest(typeof totalPosts === "bigint", "Total Posts Getter", `Total: ${totalPosts}`);
  assertTest(coreOwner.toLowerCase() === deployment.deployer.toLowerCase(), "Core Contract Owner", coreOwner);

  console.log("\n📦 4. Testing TipVault Contract...");
  const tipVaultAbi = [
    "function usdtToken() view returns (address)",
    "function treasury() view returns (address)",
    "function TREASURY_FEE_BPS() view returns (uint256)",
    "function CREATOR_FEE_BPS() view returns (uint256)"
  ];
  const tipVault = new ethers.Contract(contracts.TipVault, tipVaultAbi, provider);
  const tipUsdt = await tipVault.usdtToken();
  const tipTreasury = await tipVault.treasury();
  const treasuryFee = await tipVault.TREASURY_FEE_BPS();
  const creatorFee = await tipVault.CREATOR_FEE_BPS();

  assertTest(tipUsdt.toLowerCase() === contracts.MockUSDT.toLowerCase(), "TipVault USDT Binding", tipUsdt);
  assertTest(tipTreasury.toLowerCase() === deployment.treasury.toLowerCase(), "TipVault Treasury Address", tipTreasury);
  assertTest(Number(treasuryFee) === 500, "TipVault Treasury Fee (5%)", `${treasuryFee} bps`);
  assertTest(Number(creatorFee) === 9500, "TipVault Creator Split (95%)", `${creatorFee} bps`);

  console.log("\n📦 5. Testing RewardDistributor Contract...");
  const distributorAbi = [
    "function rewardToken() view returns (address)",
    "function coreContract() view returns (address)",
    "function tipVault() view returns (address)"
  ];
  const distributor = new ethers.Contract(contracts.RewardDistributor, distributorAbi, provider);
  const distRewardToken = await distributor.rewardToken();
  const distCore = await distributor.coreContract();
  const distVault = await distributor.tipVault();

  assertTest(distRewardToken.toLowerCase() === contracts.RewardToken.toLowerCase(), "Distributor RewardToken Binding", distRewardToken);
  assertTest(distCore.toLowerCase() === contracts.XMoodStreamCore.toLowerCase(), "Distributor Core Binding", distCore);
  assertTest(distVault.toLowerCase() === contracts.TipVault.toLowerCase(), "Distributor TipVault Binding", distVault);

  console.log("\n==================================================");
  console.log(`🎉 TEST SUMMARY: ${passed}/${total} TESTS PASSED!`);
  console.log("==================================================");

  if (passed !== total) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
