const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("X-Mood Stream Protocol - Unit Tests", function () {
  let mockUSDT, rewardToken, coreContract, tipVault, rewardDistributor;
  let owner, treasury, creator, tipper, user2;

  const ONE_DAY = 24 * 60 * 60; // 86400 seconds

  beforeEach(async function () {
    [owner, treasury, creator, tipper, user2] = await ethers.getSigners();

    // 1. Deploy MockUSDT
    const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDTFactory.deploy();
    await mockUSDT.waitForDeployment();

    // 2. Deploy RewardToken ($XMS)
    const RewardTokenFactory = await ethers.getContractFactory("RewardToken");
    rewardToken = await RewardTokenFactory.deploy();
    await rewardToken.waitForDeployment();

    // 3. Deploy XMoodStreamCore
    const CoreFactory = await ethers.getContractFactory("XMoodStreamCore");
    coreContract = await CoreFactory.deploy();
    await coreContract.waitForDeployment();

    // 4. Deploy TipVault
    const TipVaultFactory = await ethers.getContractFactory("TipVault");
    tipVault = await TipVaultFactory.deploy(await mockUSDT.getAddress(), treasury.address);
    await tipVault.waitForDeployment();

    // 5. Deploy RewardDistributor
    const RewardDistributorFactory = await ethers.getContractFactory("RewardDistributor");
    rewardDistributor = await RewardDistributorFactory.deploy(
      await rewardToken.getAddress(),
      await coreContract.getAddress(),
      await tipVault.getAddress()
    );
    await rewardDistributor.waitForDeployment();

    // Authorize RewardDistributor as minter on RewardToken
    await rewardToken.setMinter(await rewardDistributor.getAddress(), true);
  });

  describe("1. Deployment & Token Configuration", function () {
    it("Should deploy MockUSDT with 6 decimals and correct name", async function () {
      expect(await mockUSDT.name()).to.equal("Mock USDT");
      expect(await mockUSDT.symbol()).to.equal("mUSDT");
      expect(await mockUSDT.decimals()).to.equal(6);
    });

    it("Should allow open faucet minting on MockUSDT", async function () {
      const mintAmount = ethers.parseUnits("500", 6); // 500 mUSDT
      await mockUSDT.connect(tipper).mint(tipper.address, mintAmount);
      expect(await mockUSDT.balanceOf(tipper.address)).to.equal(mintAmount);
    });

    it("Should deploy RewardToken with 18 decimals and 100M cap", async function () {
      expect(await rewardToken.name()).to.equal("X-Mood Stream Reward");
      expect(await rewardToken.symbol()).to.equal("XMS");
      expect(await rewardToken.decimals()).to.equal(18);
      expect(await rewardToken.MAX_SUPPLY()).to.equal(ethers.parseUnits("100000000", 18));
    });

    it("Should only allow authorized minters to mint RewardToken", async function () {
      const mintAmount = ethers.parseUnits("100", 18);
      // Non-minter fails
      await expect(
        rewardToken.connect(tipper).mint(tipper.address, mintAmount)
      ).to.be.revertedWith("Caller is not a minter or owner");

      // Owner or authorized minter succeeds
      await rewardToken.connect(owner).mint(tipper.address, mintAmount);
      expect(await rewardToken.balanceOf(tipper.address)).to.equal(mintAmount);
    });
  });

  describe("2. XMoodStreamCore Posting", function () {
    it("Should create post, store content hash, and emit PostCreated event", async function () {
      const contentHash = "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco";

      await expect(coreContract.connect(creator).createPost(contentHash))
        .to.emit(coreContract, "PostCreated")
        .withArgs(creator.address, 1, contentHash, (val) => val > 0);

      expect(await coreContract.getTotalPosts()).to.equal(1);

      const post = await coreContract.getPost(1);
      expect(post.id).to.equal(1);
      expect(post.author).to.equal(creator.address);
      expect(post.contentHash).to.equal(contentHash);

      expect(await coreContract.getUserPostCount(creator.address)).to.equal(1);
    });

    it("Should reject post with empty content hash", async function () {
      await expect(coreContract.connect(creator).createPost("")).to.be.revertedWith(
        "Content hash cannot be empty"
      );
    });
  });

  describe("3. TipVault & Revenue Split", function () {
    const tipAmount = ethers.parseUnits("100", 6); // 100 mUSDT

    beforeEach(async function () {
      // Creator makes post #1
      await coreContract.connect(creator).createPost("QmTestHash123");
      // Tipper mints 100 mUSDT & approves TipVault
      await mockUSDT.connect(tipper).mint(tipper.address, tipAmount);
      await mockUSDT.connect(tipper).approve(await tipVault.getAddress(), tipAmount);
    });

    it("Should split tip: 95% to Creator and 5% to Treasury", async function () {
      const creatorBefore = await mockUSDT.balanceOf(creator.address);
      const treasuryBefore = await mockUSDT.balanceOf(treasury.address);

      await expect(tipVault.connect(tipper).tipPost(1, creator.address, tipAmount))
        .to.emit(tipVault, "TipSent")
        .withArgs(tipper.address, creator.address, 1, tipAmount);

      const expectedCreatorAmount = ethers.parseUnits("95", 6); // 95%
      const expectedTreasuryAmount = ethers.parseUnits("5", 6);  // 5%

      expect(await mockUSDT.balanceOf(creator.address) - creatorBefore).to.equal(expectedCreatorAmount);
      expect(await mockUSDT.balanceOf(treasury.address) - treasuryBefore).to.equal(expectedTreasuryAmount);

      expect(await tipVault.totalTipsReceived(creator.address)).to.equal(expectedCreatorAmount);
      expect(await tipVault.totalTipsSent(tipper.address)).to.equal(tipAmount);
      expect(await tipVault.postTips(1)).to.equal(tipAmount);
    });

    it("Should reject tipping self", async function () {
      await mockUSDT.connect(creator).mint(creator.address, tipAmount);
      await mockUSDT.connect(creator).approve(await tipVault.getAddress(), tipAmount);

      await expect(
        tipVault.connect(creator).tipPost(1, creator.address, tipAmount)
      ).to.be.revertedWith("Cannot tip your own post");
    });
  });

  describe("4. RewardDistributor & 24h Cooldown", function () {
    beforeEach(async function () {
      // Creator creates 2 posts
      await coreContract.connect(creator).createPost("QmPost1");
      await coreContract.connect(creator).createPost("QmPost2");

      // Tipper sends 100 mUSDT tip (creator receives 95 mUSDT)
      const tipAmount = ethers.parseUnits("100", 6);
      await mockUSDT.connect(tipper).mint(tipper.address, tipAmount);
      await mockUSDT.connect(tipper).approve(await tipVault.getAddress(), tipAmount);
      await tipVault.connect(tipper).tipPost(1, creator.address, tipAmount);
    });

    it("Should calculate pending rewards accurately", async function () {
      // Base: 5 XMS
      // 2 posts * 10 XMS = 20 XMS
      // 95 mUSDT * 0.1 XMS = 9.5 XMS
      // Total = 5 + 20 + 9.5 = 34.5 XMS = 34.5 * 10^18
      const pendingReward = await rewardDistributor.calculatePendingReward(creator.address);
      const expectedReward = ethers.parseUnits("34.5", 18);
      expect(pendingReward).to.equal(expectedReward);
    });

    it("Should allow claim and mint $XMS to user", async function () {
      const pendingReward = await rewardDistributor.calculatePendingReward(creator.address);

      await expect(rewardDistributor.connect(creator).claimReward())
        .to.emit(rewardDistributor, "RewardClaimed")
        .withArgs(creator.address, pendingReward, (val) => val > 0);

      expect(await rewardToken.balanceOf(creator.address)).to.equal(pendingReward);
      expect(await rewardDistributor.canClaim(creator.address)).to.equal(false);
    });

    it("Should enforce 24-hour cooldown on claimReward", async function () {
      // First claim succeeds
      await rewardDistributor.connect(creator).claimReward();

      // Second immediate claim fails
      await expect(
        rewardDistributor.connect(creator).claimReward()
      ).to.be.revertedWith("Claim cooldown is active (24 hours)");

      // Advance time by 24 hours + 1 second
      await time.increase(ONE_DAY + 1);

      // Now eligible again
      expect(await rewardDistributor.canClaim(creator.address)).to.equal(true);
      await expect(rewardDistributor.connect(creator).claimReward()).to.not.be.reverted;
    });
  });
});
