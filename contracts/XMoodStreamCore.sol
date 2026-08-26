// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title XMoodStreamCore
 * @dev Core contract for posting content hashes on-chain.
 */
contract XMoodStreamCore is Ownable {
    struct Post {
        uint256 id;
        address author;
        string contentHash;
        uint256 timestamp;
    }

    uint256 private _postCounter;
    mapping(uint256 => Post) private _posts;
    mapping(address => uint256[]) private _userPosts;

    event PostCreated(
        address indexed author,
        uint256 indexed postId,
        string contentHash,
        uint256 timestamp
    );

    constructor() Ownable(msg.sender) {}

    /**
     * @notice Create a new post
     * @param contentHash IPFS CID or text content hash
     * @return postId The unique ID of the newly created post
     */
    function createPost(string memory contentHash) external returns (uint256) {
        require(bytes(contentHash).length > 0, "Content hash cannot be empty");

        _postCounter++;
        uint256 newPostId = _postCounter;

        _posts[newPostId] = Post({
            id: newPostId,
            author: msg.sender,
            contentHash: contentHash,
            timestamp: block.timestamp
        });

        _userPosts[msg.sender].push(newPostId);

        emit PostCreated(msg.sender, newPostId, contentHash, block.timestamp);

        return newPostId;
    }

    /**
     * @notice Get post details by ID
     * @param postId ID of the post
     */
    function getPost(uint256 postId) external view returns (Post memory) {
        require(postId > 0 && postId <= _postCounter, "Post does not exist");
        return _posts[postId];
    }

    /**
     * @notice Get total number of posts created on platform
     */
    function getTotalPosts() external view returns (uint256) {
        return _postCounter;
    }

    /**
     * @notice Get list of post IDs by a specific author
     * @param user Author address
     */
    function getUserPosts(address user) external view returns (uint256[] memory) {
        return _userPosts[user];
    }

    /**
     * @notice Get number of posts made by a specific author
     * @param user Author address
     */
    function getUserPostCount(address user) external view returns (uint256) {
        return _userPosts[user].length;
    }
}
