// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title RewardToken ($XMS)
 * @dev ERC-20 utility & reward token with max supply cap and restricted minters.
 */
contract RewardToken is ERC20, Ownable {
    uint256 public constant MAX_SUPPLY = 100_000_000 * 10 ** 18; // 100,000,000 $XMS

    mapping(address => bool) public isMinter;

    event MinterSet(address indexed minter, bool status);

    modifier onlyMinter() {
        require(isMinter[msg.sender] || msg.sender == owner(), "Caller is not a minter or owner");
        _;
    }

    constructor() ERC20("X-Mood Stream Reward", "XMS") Ownable(msg.sender) {
        // Initial minter is deployer/owner
        isMinter[msg.sender] = true;
        emit MinterSet(msg.sender, true);
    }

    /**
     * @notice Set minter authorization
     * @param minter Address to authorize or revoke
     * @param status True to allow, false to revoke
     */
    function setMinter(address minter, bool status) external onlyOwner {
        require(minter != address(0), "Invalid minter address");
        isMinter[minter] = status;
        emit MinterSet(minter, status);
    }

    /**
     * @notice Mint reward tokens to a recipient
     * @param to Recipient address
     * @param amount Amount to mint (18 decimals)
     */
    function mint(address to, uint256 amount) external onlyMinter {
        require(to != address(0), "Cannot mint to zero address");
        require(totalSupply() + amount <= MAX_SUPPLY, "Max supply exceeded");
        _mint(to, amount);
    }
}
