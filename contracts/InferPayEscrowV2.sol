// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title InferPayEscrowV2
 * @notice Multi-token version of InferPayEscrow supporting USDC, EURC, etc.
 */
contract InferPayEscrowV2 {
    address public admin;

    struct InferenceJob {
        address user;
        address token;
        string modelId;
        uint256 amount;
        bool isComplete;
    }

    mapping(uint256 => InferenceJob) public jobs;
    uint256 public nextJobId;

    event JobRequested(uint256 indexed jobId, address indexed user, address token, string modelId, uint256 amount);
    event JobCompleted(uint256 indexed jobId, address indexed node, address token, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    function requestInference(address token, string calldata modelId, uint256 amount) external returns (uint256) {
        require(amount > 0, "Amount > 0");
        require(IERC20(token).transferFrom(msg.sender, address(this), amount), "Deposit failed");
        
        uint256 jobId = nextJobId++;
        jobs[jobId] = InferenceJob(msg.sender, token, modelId, amount, false);
        
        emit JobRequested(jobId, msg.sender, token, modelId, amount);
        return jobId;
    }

    function completeJob(uint256 jobId, address computeNode) external {
        require(msg.sender == admin, "Only admin");
        InferenceJob storage job = jobs[jobId];
        require(!job.isComplete, "Already complete");

        job.isComplete = true;
        require(IERC20(job.token).transfer(computeNode, job.amount), "Transfer failed");

        emit JobCompleted(jobId, computeNode, job.token, job.amount);
    }
}
