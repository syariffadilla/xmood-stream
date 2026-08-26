// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title TipVault
 * @dev Handles tipping in mUSDT with a 95% creator / 5% treasury split.
 */
contract TipVault is Ownable {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdtToken;
    address public treasury;

    uint256 public constant CREATOR_FEE_BPS = 9500; // 95%
    uint256 public constant TREASURY_FEE_BPS = 500;  // 5%
    uint256 public constant BPS_DENOMINATOR = 10000;

    mapping(address => uint256) public totalTipsReceived; // user => total USDT received (in micro USDT)
    mapping(address => uint256) public totalTipsSent;     // user => total USDT sent
    mapping(uint256 => uint256) public postTips;          // postId => total USDT received

    event TipSent(
        address indexed from,
        address indexed to,
        uint256 indexed postId,
        uint256 amount
    );
    event TreasuryUpdated(address indexed newTreasury);

    constructor(address _usdtToken, address _treasury) Ownable(msg.sender) {
        require(_usdtToken != address(0), "Invalid USDT token address");
        require(_treasury != address(0), "Invalid treasury address");
        usdtToken = IERC20(_usdtToken);
        treasury = _treasury;
    }

    /**
     * @notice Set new treasury address
     * @param _newTreasury New treasury address
     */
    function setTreasury(address _newTreasury) external onlyOwner {
        require(_newTreasury != address(0), "Invalid treasury address");
        treasury = _newTreasury;
        emit TreasuryUpdated(_newTreasury);
    }

    /**
     * @notice Send a tip in mUSDT for a post
     * @param postId ID of the post being tipped
     * @param creator Address of the post author/creator
     * @param amount Total amount of mUSDT to tip (6 decimals)
     */
    function tipPost(uint256 postId, address creator, uint256 amount) external {
        require(creator != address(0), "Invalid creator address");
        require(creator != msg.sender, "Cannot tip your own post");
        require(amount > 0, "Amount must be greater than zero");

        uint256 treasuryAmount = (amount * TREASURY_FEE_BPS) / BPS_DENOMINATOR;
        uint256 creatorAmount = amount - treasuryAmount;

        // Update tracking
        totalTipsReceived[creator] += creatorAmount;
        totalTipsSent[msg.sender] += amount;
        postTips[postId] += amount;

        // Transfer funds via SafeERC20
        usdtToken.safeTransferFrom(msg.sender, creator, creatorAmount);
        if (treasuryAmount > 0) {
            usdtToken.safeTransferFrom(msg.sender, treasury, treasuryAmount);
        }

        emit TipSent(msg.sender, creator, postId, amount);
    }
}
