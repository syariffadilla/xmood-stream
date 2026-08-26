// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockUSDT
 * @dev Mock USDT token with 6 decimals and a public faucet mint function for testnet testing.
 */
contract MockUSDT is ERC20 {
    constructor() ERC20("Mock USDT", "mUSDT") {
        // Mint initial supply of 1,000,000 mUSDT to deployer
        _mint(msg.sender, 1_000_000 * 10 ** decimals());
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    /**
     * @notice Open mint function for testnet faucet
     * @param to Recipient address
     * @param amount Amount to mint (in 6 decimals)
     */
    function mint(address to, uint256 amount) external {
        require(to != address(0), "Invalid recipient");
        _mint(to, amount);
    }
}
