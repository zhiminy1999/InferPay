// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 value) external returns (bool);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

interface IAgentRegistry {
    function getAgent(address _agentAddress) external view returns (
        address wallet,
        string memory name,
        string memory description,
        string memory capabilities,
        string memory serviceEndpoint,
        uint256 reputation
    );
}

contract JobEscrow {
    struct Job {
        uint256 id;
        address client;
        address provider;
        address evaluator;
        string description;
        uint256 budget;
        uint256 expiredAt;
        uint8 status; // 0: Open, 1: Funded, 2: Submitted, 3: Completed, 4: Rejected, 5: Expired
        address hook;
        bytes32 deliverable;
    }

    address public usdcToken;
    address public agentRegistry;
    address public owner;
    uint256 public jobCount;

    mapping(uint256 => Job) public jobs;
    mapping(uint256 => bool) public disputed;

    event JobCreated(
        uint256 indexed jobId,
        address indexed client,
        address indexed provider,
        address evaluator,
        uint256 expiredAt,
        address hook
    );
    event BudgetSet(uint256 indexed jobId, uint256 budget);
    event JobFunded(uint256 indexed jobId, uint256 amount);
    event JobSubmitted(uint256 indexed jobId, bytes32 deliverable);
    event JobCompleted(uint256 indexed jobId, bytes32 reason);
    event JobRejected(uint256 indexed jobId, bytes32 reason);
    event JobDisputed(uint256 indexed jobId);
    event DisputeResolved(uint256 indexed jobId, bool resolvedCompleted);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can resolve disputes");
        _;
    }

    constructor(address _usdcToken, address _agentRegistry) {
        usdcToken = _usdcToken;
        agentRegistry = _agentRegistry;
        owner = msg.sender;
    }

    function createJob(
        address provider,
        address evaluator,
        uint256 expiredAt,
        string calldata description,
        address hook
    ) external returns (uint256) {
        // Enforce ERC-8004 registered agent checks
        if (agentRegistry != address(0)) {
            (address provWallet,,,,,) = IAgentRegistry(agentRegistry).getAgent(provider);
            (address evalWallet,,,,,) = IAgentRegistry(agentRegistry).getAgent(evaluator);
            require(provWallet != address(0), "Provider must be registered under ERC-8004");
            require(evalWallet != address(0), "Evaluator must be registered under ERC-8004");
        }

        uint256 jobId = jobCount;
        jobs[jobId] = Job({
            id: jobId,
            client: msg.sender,
            provider: provider,
            evaluator: evaluator,
            description: description,
            budget: 0,
            expiredAt: expiredAt,
            status: 0, // Open
            hook: hook,
            deliverable: bytes32(0)
        });

        jobCount++;

        emit JobCreated(jobId, msg.sender, provider, evaluator, expiredAt, hook);
        return jobId;
    }

    function setBudget(uint256 jobId, uint256 amount, bytes calldata /* optParams */) external {
        Job storage job = jobs[jobId];
        require(msg.sender == job.provider, "Only provider can set budget");
        require(job.status == 0, "Job not open");
        job.budget = amount;
        emit BudgetSet(jobId, amount);
    }

    function fund(uint256 jobId, bytes calldata /* optParams */) external {
        Job storage job = jobs[jobId];
        require(msg.sender == job.client, "Only client can fund job");
        require(job.status == 0, "Job not open");
        require(job.budget > 0, "Budget not set");

        require(
            IERC20(usdcToken).transferFrom(msg.sender, address(this), job.budget),
            "USDC funding transfer failed"
        );

        job.status = 1; // Funded
        emit JobFunded(jobId, job.budget);
    }

    function submit(uint256 jobId, bytes32 deliverable, bytes calldata /* optParams */) external {
        Job storage job = jobs[jobId];
        require(msg.sender == job.provider, "Only provider can submit deliverable");
        require(job.status == 1, "Job not funded");

        job.deliverable = deliverable;
        job.status = 2; // Submitted
        emit JobSubmitted(jobId, deliverable);
    }

    function complete(uint256 jobId, bytes32 reason, bytes calldata /* optParams */) external {
        Job storage job = jobs[jobId];
        require(msg.sender == job.evaluator, "Only evaluator can complete job");
        require(job.status == 2, "Job not submitted for review");

        require(
            IERC20(usdcToken).transfer(job.provider, job.budget),
            "Payment transfer failed"
        );

        job.status = 3; // Completed
        emit JobCompleted(jobId, reason);
    }

    function reject(uint256 jobId, bytes32 reason, bytes calldata /* optParams */) external {
        Job storage job = jobs[jobId];
        require(
            msg.sender == job.evaluator || 
            (msg.sender == job.client && block.timestamp > job.expiredAt),
            "Not authorized to reject/cancel"
        );
        require(job.status == 1 || job.status == 2, "Job not active");

        require(
            IERC20(usdcToken).transfer(job.client, job.budget),
            "Refunding transfer failed"
        );

        job.status = 4; // Rejected/Refunded
        emit JobRejected(jobId, reason);
    }

    function dispute(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(msg.sender == job.client || msg.sender == job.provider, "Not party to job");
        require(job.status == 1 || job.status == 2, "Job must be active to dispute");
        disputed[jobId] = true;
        emit JobDisputed(jobId);
    }

    function resolveDispute(uint256 jobId, bool approvePayment) external onlyOwner {
        require(disputed[jobId], "Job not in dispute");
        Job storage job = jobs[jobId];
        
        address recipient = approvePayment ? job.provider : job.client;
        require(
            IERC20(usdcToken).transfer(recipient, job.budget),
            "Resolution transfer failed"
        );

        job.status = approvePayment ? uint8(3) : uint8(4); // Completed or Rejected/Refunded
        disputed[jobId] = false;
        
        emit DisputeResolved(jobId, approvePayment);
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }
}
