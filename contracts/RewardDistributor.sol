// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./RewardToken.sol";
import "./XMoodStreamCore.sol";
import "./TipVault.sol";

/**
 * @title RewardDistributor
 * @dev Distributes $XMS reward tokens to active creators based on posts and tips received, with a 24-hour cooldown.
 */
contract RewardDistributor is Ownable {
    RewardToken public immutable rewardToken;
    XMoodStreamCore public immutable coreContract;
    TipVault public immutable tipVault;

    uint256 public constant CLAIM_COOLDOWN = 24 hours;

    // Reward rates
    uint256 public constant REWARD_PER_POST = 10 * 10 ** 18;             // 10 $XMS per post
    uint256 public constant REWARD_PER_USDT_TIPS = 1 * 10 ** 17;        // 0.1 $XMS per 1 mUSDT (1 $XMS per 10 mUSDT)
    uint256 public constant BASE_DAILY_REWARD = 5 * 10 ** 18;           // 5 $XMS base daily activity reward

    mapping(address => uint256) public lastClaimTimestamp;
    mapping(address => uint256) public postsClaimed;
    mapping(address => uint256) public tipsClaimed;
    mapping(address => uint256) public totalRewardsClaimed;

    event RewardClaimed(address indexed user, uint256 amount, uint256 timestamp);

    constructor(
        address _rewardToken,
        address _coreContract,
        address _tipVault
    ) Ownable(msg.sender) {
        require(_rewardToken != address(0), "Invalid reward token address");
        require(_coreContract != address(0), "Invalid core contract address");
        require(_tipVault != address(0), "Invalid tip vault address");

        rewardToken = RewardToken(_rewardToken);
        coreContract = XMoodStreamCore(_coreContract);
        tipVault = TipVault(_tipVault);
    }

    /**
     * @notice Calculate pending $XMS reward for a user
     * @param user User address to check
     */
    function calculatePendingReward(address user) public view returns (uint256) {
        uint256 currentPosts = coreContract.getUserPostCount(user);
        uint256 currentTips = tipVault.totalTipsReceived(user); // in 6 decimals

        uint256 newPosts = currentPosts > postsClaimed[user] ? currentPosts - postsClaimed[user] : 0;
        uint256 newTips = currentTips > tipsClaimed[user] ? currentTips - tipsClaimed[user] : 0;

        uint256 postReward = newPosts * REWARD_PER_POST;
        // newTips is in 10^6 (micro-USDT). REWARD_PER_USDT_TIPS is 10^17 wei per 1 USDT (10^6 units).
        // (newTips * 10^17) / 10^6 = newTips * 10^11
        uint256 tipReward = (newTips * REWARD_PER_USDT_TIPS) / 10 ** 6;

        return BASE_DAILY_REWARD + postReward + tipReward;
    }

    /**
     * @notice Check if a user is eligible to claim reward right now
     * @param user User address
     */
    function canClaim(address user) public view returns (bool) {
        if (lastClaimTimestamp[user] == 0) {
            return true;
        }
        return block.timestamp >= lastClaimTimestamp[user] + CLAIM_COOLDOWN;
    }

    /**
     * @notice Seconds remaining until user can claim again
     * @param user User address
     */
    function timeUntilNextClaim(address user) external view returns (uint256) {
        if (canClaim(user)) {
            return 0;
        }
        return (lastClaimTimestamp[user] + CLAIM_COOLDOWN) - block.timestamp;
    }

    /**
     * @notice Claim pending $XMS reward
     */
    function claimReward() external {
        require(canClaim(msg.sender), "Claim cooldown is active (24 hours)");

        uint256 rewardAmount = calculatePendingReward(msg.sender);
        require(rewardAmount > 0, "No rewards to claim");

        // Update state
        postsClaimed[msg.sender] = coreContract.getUserPostCount(msg.sender);
        tipsClaimed[msg.sender] = tipVault.totalTipsReceived(msg.sender);
        lastClaimTimestamp[msg.sender] = block.timestamp;
        totalRewardsClaimed[msg.sender] += rewardAmount;

        // Mint reward tokens to user
        rewardToken.mint(msg.sender, rewardAmount);

        emit RewardClaimed(msg.sender, rewardAmount, block.timestamp);
    }
}
