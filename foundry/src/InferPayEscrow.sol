// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

contract InferPayEscrow {
    IERC20 public usdcToken;
    address public admin;

    struct InferenceJob {
        address user;
        string modelId;
        uint256 amount;
        bool isComplete;
    }

    mapping(uint256 => InferenceJob) public jobs;
    uint256 public nextJobId;

    event JobRequested(uint256 indexed jobId, address indexed user, string modelId, uint256 amount);
    event JobCompleted(uint256 indexed jobId, address indexed node, uint256 amount);

    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
        admin = msg.sender;
    }

    function requestInference(string calldata modelId, uint256 amount) external returns (uint256) {
        require(amount > 0, "Amount > 0");
        require(usdcToken.transferFrom(msg.sender, address(this), amount), "Deposit failed");
        
        uint256 jobId = nextJobId++;
        jobs[jobId] = InferenceJob(msg.sender, modelId, amount, false);
        
        emit JobRequested(jobId, msg.sender, modelId, amount);
        return jobId;
    }

    function completeJob(uint256 jobId, address computeNode) external {
        require(msg.sender == admin, "Only admin");
        InferenceJob storage job = jobs[jobId];
        require(!job.isComplete, "Already complete");

        job.isComplete = true;
        require(usdcToken.transfer(computeNode, job.amount), "Transfer failed");

        emit JobCompleted(jobId, computeNode, job.amount);
    }
}
