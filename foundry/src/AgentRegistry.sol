// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title AgentRegistry
 * @notice A minimal ERC-8004 inspired Agent Identity & Reputation Registry for the Arc Network.
 * Maps agent addresses to their metadata (name, description, capabilities, endpoint) and tracks reputation.
 */
contract AgentRegistry {
    struct Agent {
        address wallet;
        string name;
        string description;
        string capabilities;
        string serviceEndpoint;
        uint256 reputation;
    }

    mapping(address => Agent) public agents;
    address[] public agentAddresses;

    event AgentRegistered(
        address indexed agentAddress,
        string name,
        string description,
        string capabilities,
        string serviceEndpoint
    );
    event ReputationUpdated(address indexed agentAddress, uint256 newReputation);

    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerAgent(
        address _agentAddress,
        string calldata _name,
        string calldata _description,
        string calldata _capabilities,
        string calldata _serviceEndpoint
    ) external {
        require(_agentAddress == msg.sender, "Can only register own agent address");
        
        if (agents[_agentAddress].wallet == address(0)) {
            agentAddresses.push(_agentAddress);
        }

        agents[_agentAddress] = Agent({
            wallet: _agentAddress,
            name: _name,
            description: _description,
            capabilities: _capabilities,
            serviceEndpoint: _serviceEndpoint,
            reputation: 100
        });

        emit AgentRegistered(_agentAddress, _name, _description, _capabilities, _serviceEndpoint);
    }

    function setReputation(address _agentAddress, uint256 _reputation) external onlyOwner {
        require(agents[_agentAddress].wallet != address(0), "Agent not registered");
        agents[_agentAddress].reputation = _reputation;
        emit ReputationUpdated(_agentAddress, _reputation);
    }

    function getAgent(address _agentAddress) external view returns (
        address wallet,
        string memory name,
        string memory description,
        string memory capabilities,
        string memory serviceEndpoint,
        uint256 reputation
    ) {
        Agent memory a = agents[_agentAddress];
        return (a.wallet, a.name, a.description, a.capabilities, a.serviceEndpoint, a.reputation);
    }

    function getAllAgentAddresses() external view returns (address[] memory) {
        return agentAddresses;
    }
}
