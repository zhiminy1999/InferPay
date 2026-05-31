// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title AgentEscrow
 * @notice Manages session-bound ephemeral wallets with strict on-chain policies.
 * Ensures AI Agents can only spend up to a set budget within a timeframe,
 * only interacting with whitelisted addresses. Remaining funds can be swept back to Master.
 */
contract AgentEscrow {
    IERC20 public usdcToken;
    address public masterWallet;

    struct SessionPolicy {
        address ephemeralWallet;
        uint256 spendLimit;
        uint256 totalSpent;
        uint256 expiration;
        bool isExpired;
        bool isSwept;
    }

    mapping(address => SessionPolicy) public activePolicies;
    mapping(address => mapping(address => bool)) public whitelistedContracts; // ephemeral -> target -> allowed

    event SessionCreated(address indexed ephemeralWallet, uint256 spendLimit, uint256 expiration);
    event WhitelistUpdated(address indexed ephemeralWallet, address indexed target, bool allowed);
    event SpendExecuted(address indexed ephemeralWallet, address indexed target, uint256 amount);
    event SessionSwept(address indexed ephemeralWallet, address indexed masterWallet, uint256 amountSwept);

    modifier onlyMaster() {
        require(msg.sender == masterWallet, "Only master wallet can authorize");
        _;
    }

    modifier onlyEphemeral(address _ephemeral) {
        require(msg.sender == _ephemeral, "Only designated ephemeral wallet can call");
        _;
    }

    constructor(address _usdcToken) {
        usdcToken = IERC20(_usdcToken);
        masterWallet = msg.sender;
    }

    function createSession(
        address _ephemeralWallet,
        uint256 _spendLimit,
        uint256 _duration,
        address[] calldata _whitelist
    ) external onlyMaster {
        require(activePolicies[_ephemeralWallet].ephemeralWallet == address(0) || activePolicies[_ephemeralWallet].isSwept, "Session active");
        
        activePolicies[_ephemeralWallet] = SessionPolicy({
            ephemeralWallet: _ephemeralWallet,
            spendLimit: _spendLimit,
            totalSpent: 0,
            expiration: block.timestamp + _duration,
            isExpired: false,
            isSwept: false
        });

        for (uint256 i = 0; i < _whitelist.length; i++) {
            whitelistedContracts[_ephemeralWallet][_whitelist[i]] = true;
        }

        // Pull limit from Master Wallet to Escrow
        require(usdcToken.transferFrom(masterWallet, address(this), _spendLimit), "Funding escrow failed");

        emit SessionCreated(_ephemeralWallet, _spendLimit, block.timestamp + _duration);
    }

    function executeSpend(
        address _ephemeralWallet,
        address _target,
        uint256 _amount
    ) external onlyEphemeral(_ephemeralWallet) {
        SessionPolicy storage policy = activePolicies[_ephemeralWallet];
        require(!policy.isExpired && block.timestamp <= policy.expiration, "Session expired");
        require(!policy.isSwept, "Session already swept");
        require(whitelistedContracts[_ephemeralWallet][_target], "Target address not whitelisted");
        require(policy.totalSpent + _amount <= policy.spendLimit, "Exceeds session budget limit");

        policy.totalSpent += _amount;
        require(usdcToken.transfer(_target, _amount), "USDC transfer failed");

        emit SpendExecuted(_ephemeralWallet, _target, _amount);
    }

    function sweepSession(address _ephemeralWallet) external {
        SessionPolicy storage policy = activePolicies[_ephemeralWallet];
        require(msg.sender == masterWallet || block.timestamp > policy.expiration, "Unauthorized sweep");
        require(!policy.isSwept, "Already swept");

        policy.isSwept = true;
        uint256 remainingFunds = policy.spendLimit - policy.totalSpent;
        
        if (remainingFunds > 0) {
            require(usdcToken.transfer(masterWallet, remainingFunds), "Sweeping failed");
        }

        emit SessionSwept(_ephemeralWallet, masterWallet, remainingFunds);
    }
}
