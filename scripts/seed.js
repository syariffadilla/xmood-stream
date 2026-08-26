const { ethers, network } = require("hardhat");
const fs = require("fs");
const path = require("path");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("❌ Deployer account not found. Please check .env file.");
  }

  console.log("==================================================");
  console.log("🌱 STARTING X-MOOD STREAM ON-CHAIN SEED SCRIPT");
  console.log("==================================================");
  console.log(`🌐 Network:          ${network.name}`);
  console.log(`👤 Deployer:         ${deployer.address}`);

  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  console.log(`💰 Deployer Balance: ${ethers.formatEther(deployerBalance)} ETH`);
  console.log("==================================================\n");

  // Load deployed addresses
  const deployedPath = path.join(__dirname, "..", "deployed-addresses.json");
  if (!fs.existsSync(deployedPath)) {
    throw new Error("❌ deployed-addresses.json not found! Please run deploy script first.");
  }
  const deployment = JSON.parse(fs.readFileSync(deployedPath, "utf8"));
  const { MockUSDT: usdtAddr, RewardToken: xmsAddr, XMoodStreamCore: coreAddr, TipVault: tipVaultAddr, RewardDistributor: distAddr } = deployment.contracts;

  const mockUSDT = await ethers.getContractAt("MockUSDT", usdtAddr, deployer);
  const rewardToken = await ethers.getContractAt("RewardToken", xmsAddr, deployer);
  const coreContract = await ethers.getContractAt("XMoodStreamCore", coreAddr, deployer);
  const tipVault = await ethers.getContractAt("TipVault", tipVaultAddr, deployer);
  const rewardDistributor = await ethers.getContractAt("RewardDistributor", distAddr, deployer);

  // 1. Generate 6 dummy wallets
  console.log("🔑 [1/6] Generating 6 dummy testnet wallets...");
  const dummyWallets = [];
  const seedInfo = [];

  for (let i = 0; i < 6; i++) {
    const randomWallet = ethers.Wallet.createRandom(ethers.provider);
    dummyWallets.push(randomWallet);
    seedInfo.push({
      index: i + 1,
      address: randomWallet.address,
      privateKey: randomWallet.privateKey,
    });
  }

  // Save to seed-wallets.json
  const seedFile = path.join(__dirname, "..", "seed-wallets.json");
  fs.writeFileSync(seedFile, JSON.stringify(seedInfo, null, 2));
  console.log(`💾 Saved 6 seed wallets to: seed-wallets.json\n`);

  // 2. Fund each wallet with 0.002 ETH for gas
  console.log("⛽ [2/6] Funding wallets with 0.002 ETH testnet gas...");
  const ethAmount = ethers.parseEther("0.002");

  for (let i = 0; i < dummyWallets.length; i++) {
    try {
      const tx = await deployer.sendTransaction({
        to: dummyWallets[i].address,
        value: ethAmount,
      });
      await tx.wait();
      console.log(`   ✅ Funded Wallet #${i + 1} (${dummyWallets[i].address.slice(0, 8)}...) with 0.002 ETH`);
    } catch (err) {
      console.error(`   ⚠️ Failed to fund Wallet #${i + 1}:`, err.message);
    }
  }

  // 3. Mint 500 mUSDT to each wallet
  console.log("\n💵 [3/6] Minting 500 mUSDT to each seed wallet...");
  const mintUsdtAmount = ethers.parseUnits("500", 6);

  for (let i = 0; i < dummyWallets.length; i++) {
    try {
      const tx = await mockUSDT.mint(dummyWallets[i].address, mintUsdtAmount);
      await tx.wait();
      console.log(`   ✅ Minted 500 mUSDT to Wallet #${i + 1} (${dummyWallets[i].address.slice(0, 8)}...)`);
    } catch (err) {
      console.error(`   ⚠️ Failed to mint mUSDT to Wallet #${i + 1}:`, err.message);
    }
  }

  // 4. Create 10 realistic on-chain posts
  console.log("\n📝 [4/6] Broadcasting 10 realistic SocialFi posts to XMoodStreamCore...");

  const postContents = [
    "Just deployed our SocialFi smart contracts on Base Sepolia. 95% creator split is officially live! ⚡🚀 #BaseSepolia",
    "Analyzing layer 2 gas metrics across Base and Ethereum mainnet. Sub-cent transaction fees enable true micro-tipping!",
    "Decentralized micro-blogging solves the web2 platform lock-in problem. Every post is a verifiable asset on-chain.",
    "Good morning Web3! Daily check-in complete on X-Mood Stream. Who else is claiming their $XMS rewards today? ☕",
    "Deep dive into dual-token tokenomics: separating value exchange (USDT) from utility rewards ($XMS) creates sustainable platform loops.",
    "Setting up algorithmic price alerts for decentralized liquidity pools. What are your favorite on-chain analytics tools?",
    "Micro-tipping peer creators on-chain directly from wallet to wallet feels magical without intermediary hold times.",
    "Smart contract tip split verified: 95% straight to author, 5% protocol treasury. Non-custodial transparency at its best!",
    "Building the future of social finance on Base. Fast block times and seamless EVM compatibility make all the difference.",
    "Weekly SocialFi digest: Creator earnings up 40% as more users discover direct on-chain tipping mechanics."
  ];

  const createdPosts = [];

  for (let i = 0; i < postContents.length; i++) {
    const walletIndex = i % dummyWallets.length;
    const authorWallet = dummyWallets[walletIndex];

    try {
      const coreWithSigner = coreContract.connect(authorWallet);
      const tx = await coreWithSigner.createPost(postContents[i]);
      const receipt = await tx.wait();

      const total = await coreContract.getTotalPosts();
      const postId = Number(total);
      createdPosts.push({ postId, author: authorWallet.address, content: postContents[i] });

      console.log(`   ✅ Post #${postId} broadcasted by Wallet #${walletIndex + 1} (${authorWallet.address.slice(0, 6)}...): "${postContents[i].slice(0, 45)}..."`);
      await sleep(2000); // 2 second pause for natural timestamp variance
    } catch (err) {
      console.error(`   ⚠️ Failed to create post #${i + 1}:`, err.message);
    }
  }

  // 5. Cross-tipping between wallets
  console.log("\n💖 [5/6] Simulating cross-tipping (USDT) between creators...");

  const tipActions = [
    { fromIdx: 0, targetPostIdx: 1, amountUsdt: "25" },
    { fromIdx: 1, targetPostIdx: 2, amountUsdt: "15" },
    { fromIdx: 2, targetPostIdx: 0, amountUsdt: "40" },
    { fromIdx: 3, targetPostIdx: 4, amountUsdt: "10" },
    { fromIdx: 4, targetPostIdx: 5, amountUsdt: "35" },
    { fromIdx: 5, targetPostIdx: 0, amountUsdt: "50" },
    { fromIdx: 1, targetPostIdx: 6, amountUsdt: "8" },
    { fromIdx: 2, targetPostIdx: 7, amountUsdt: "12" },
  ];

  for (let i = 0; i < tipActions.length; i++) {
    const { fromIdx, targetPostIdx, amountUsdt } = tipActions[i];
    const fromWallet = dummyWallets[fromIdx];
    const targetPost = createdPosts[targetPostIdx];

    if (!targetPost) continue;

    try {
      const tipAmountUnits = ethers.parseUnits(amountUsdt, 6);
      const usdtWithSigner = mockUSDT.connect(fromWallet);
      const tipVaultWithSigner = tipVault.connect(fromWallet);

      // Approve TipVault
      const approveTx = await usdtWithSigner.approve(tipVaultAddr, tipAmountUnits);
      await approveTx.wait();

      // Send Tip
      const tipTx = await tipVaultWithSigner.tipPost(targetPost.postId, targetPost.author, tipAmountUnits);
      await tipTx.wait();

      console.log(`   ✅ Wallet #${fromIdx + 1} sent ${amountUsdt} mUSDT tip to Post #${targetPost.postId} (${targetPost.author.slice(0, 6)}...)`);
      await sleep(1500);
    } catch (err) {
      console.error(`   ⚠️ Tip action failed (Wallet #${fromIdx + 1} -> Post #${targetPost?.postId}):`, err.message);
    }
  }

  // 6. Claim rewards for each wallet
  console.log("\n🎁 [6/6] Claiming $XMS rewards for each seed wallet...");

  for (let i = 0; i < dummyWallets.length; i++) {
    const wallet = dummyWallets[i];
    try {
      const distributorWithSigner = rewardDistributor.connect(wallet);
      const canClaim = await distributorWithSigner.canClaim(wallet.address);

      if (canClaim) {
        const tx = await distributorWithSigner.claimReward();
        await tx.wait();
        const balance = await rewardToken.balanceOf(wallet.address);
        console.log(`   ✅ Wallet #${i + 1} claimed rewards. New $XMS balance: ${ethers.formatUnits(balance, 18)} XMS`);
      }
    } catch (err) {
      console.error(`   ⚠️ Reward claim for Wallet #${i + 1}:`, err.message);
    }
  }

  // 7. Final Summary
  console.log("\n==================================================");
  console.log("🎉 SEED DATA GENERATION COMPLETE!");
  console.log("==================================================");

  const summary = [];
  for (let i = 0; i < dummyWallets.length; i++) {
    const w = dummyWallets[i];
    const ethBal = await ethers.provider.getBalance(w.address);
    const usdtBal = await mockUSDT.balanceOf(w.address);
    const xmsBal = await rewardToken.balanceOf(w.address);
    const tipsRecv = await tipVault.totalTipsReceived(w.address);

    summary.push({
      Wallet: `Wallet #${i + 1}`,
      Address: `${w.address.slice(0, 6)}...${w.address.slice(-4)}`,
      ETH: `${parseFloat(ethers.formatEther(ethBal)).toFixed(4)}`,
      mUSDT: `${parseFloat(ethers.formatUnits(usdtBal, 6)).toFixed(1)}`,
      XMS: `${parseFloat(ethers.formatUnits(xmsBal, 18)).toFixed(1)}`,
      TipsReceived: `${parseFloat(ethers.formatUnits(tipsRecv, 6)).toFixed(1)} USDT`,
    });
  }

  console.table(summary);
  console.log("\n👉 Sekarang buka/refresh http://localhost:3000/feed dan /leaderboard untuk melihat data on-chain live!");
}

main().catch((error) => {
  console.error("❌ Seed process encountered an error:", error);
  process.exitCode = 1;
});
