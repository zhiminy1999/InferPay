// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
}

/**
 * @title AgentConsensusV2
 * @notice Multi-token multi-agent consensus workflow supporting USDC, EURC, etc.
 */
contract AgentConsensusV2 {
    address public admin;

    struct Proposal {
        uint256 id;
        address payable recipient;
        address token; // token address choice (USDC or EURC)
        uint256 amount;
        string purpose;
        uint256 approvalsCount;
        bool executed;
        bool rejected;
        uint256 creationTime;
    }

    // Agent registry
    mapping(address => bool) public authorizedAgents;
    address[] public agentList;

    // Proposal tracking
    Proposal[] public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Safety levels
    uint256 public requiredApprovals;

    event AgentAuthorized(address indexed agent, bool status);
    event ProposalCreated(uint256 indexed id, address indexed recipient, address token, uint256 amount, string purpose);
    event ProposalVoted(uint256 indexed id, address indexed agent, bool approve);
    event ProposalExecuted(uint256 indexed id, address indexed recipient, address token, uint256 amount);
    event HumanOverrideTriggered(uint256 indexed id, address indexed administrator);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call");
        _;
    }

    modifier onlyAgent() {
        require(authorizedAgents[msg.sender], "Only authorized agents can call");
        _;
    }

    constructor(address[] memory _initialAgents, uint256 _requiredApprovals) {
        admin = msg.sender;
        requiredApprovals = _requiredApprovals;

        for (uint256 i = 0; i < _initialAgents.length; i++) {
            authorizedAgents[_initialAgents[i]] = true;
            agentList.push(_initialAgents[i]);
            emit AgentAuthorized(_initialAgents[i], true);
        }
    }

    function createProposal(
        address payable _recipient,
        address _token,
        uint256 _amount,
        string calldata _purpose
    ) external returns (uint256) {
        uint256 id = proposals.length;
        proposals.push(Proposal({
            id: id,
            recipient: _recipient,
            token: _token,
            amount: _amount,
            purpose: _purpose,
            approvalsCount: 0,
            executed: false,
            rejected: false,
            creationTime: block.timestamp
        }));

        emit ProposalCreated(id, _recipient, _token, _amount, _purpose);
        return id;
    }

    function voteProposal(uint256 _proposalId, bool _approve) external onlyAgent {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.rejected, "Proposal already rejected");
        require(!hasVoted[_proposalId][msg.sender], "Agent already voted on this proposal");

        hasVoted[_proposalId][msg.sender] = true;

        if (_approve) {
            proposal.approvalsCount++;
            emit ProposalVoted(_proposalId, msg.sender, true);
        } else {
            proposal.rejected = true;
            emit ProposalVoted(_proposalId, msg.sender, false);
        }

        // Auto execute if approvals met
        if (proposal.approvalsCount >= requiredApprovals && !proposal.executed && !proposal.rejected) {
            proposal.executed = true;
            require(IERC20(proposal.token).transfer(proposal.recipient, proposal.amount), "Transfer failed");
            emit ProposalExecuted(_proposalId, proposal.recipient, proposal.token, proposal.amount);
        }
    }

    function humanBypassExecute(uint256 _proposalId) external onlyAdmin {
        Proposal storage proposal = proposals[_proposalId];
        require(!proposal.executed, "Proposal already executed");
        
        proposal.executed = true;
        require(IERC20(proposal.token).transfer(proposal.recipient, proposal.amount), "Bypass transfer failed");
        
        emit HumanOverrideTriggered(_proposalId, msg.sender);
        emit ProposalExecuted(_proposalId, proposal.recipient, proposal.token, proposal.amount);
    }

    function getProposalCount() external view returns (uint256) {
        return proposals.length;
    }
}
