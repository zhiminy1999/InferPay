// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

/**
 * @title AgentEscrowV2
 * @notice Multi-token version of AgentEscrow supporting USDC, EURC, etc.
 * Supports multi-tenant budgets where each session records its own creator as masterWallet.
 */
contract AgentEscrowV2 {
    address public contractOwner;
    mapping(address => bool) public isAllowedToken;

    struct SessionPolicy {
        address ephemeralWallet;
        address masterWallet;
        address token;
        uint256 spendLimit;
        uint256 totalSpent;
        uint256 expiration;
        bool isExpired;
        bool isSwept;
    }

    mapping(address => SessionPolicy) public activePolicies;
    mapping(address => mapping(address => bool)) public whitelistedContracts; // ephemeral -> target -> allowed

    event SessionCreated(address indexed ephemeralWallet, address indexed token, uint256 spendLimit, uint256 expiration);
    event WhitelistUpdated(address indexed ephemeralWallet, address indexed target, bool allowed);
    event SpendExecuted(address indexed ephemeralWallet, address indexed target, uint256 amount);
    event SessionSwept(address indexed ephemeralWallet, address indexed masterWallet, uint256 amountSwept);
    event TokenAllowedUpdated(address indexed token, bool allowed);

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Only owner can call");
        _;
    }

    modifier onlyEphemeral(address _ephemeral) {
        require(msg.sender == _ephemeral, "Only designated ephemeral wallet can call");
        _;
    }

    constructor(address[] memory _allowedTokens) {
        contractOwner = msg.sender;
        for (uint256 i = 0; i < _allowedTokens.length; i++) {
            isAllowedToken[_allowedTokens[i]] = true;
            emit TokenAllowedUpdated(_allowedTokens[i], true);
        }
    }

    function setTokenAllowed(address _token, bool _allowed) external onlyOwner {
        isAllowedToken[_token] = _allowed;
        emit TokenAllowedUpdated(_token, _allowed);
    }

    function createSession(
        address _ephemeralWallet,
        address _token,
        uint256 _spendLimit,
        uint256 _duration,
        address[] calldata _whitelist
    ) external {
        require(isAllowedToken[_token], "Token not allowed");
        require(activePolicies[_ephemeralWallet].ephemeralWallet == address(0) || activePolicies[_ephemeralWallet].isSwept, "Session active");
        
        activePolicies[_ephemeralWallet] = SessionPolicy({
            ephemeralWallet: _ephemeralWallet,
            masterWallet: msg.sender,
            token: _token,
            spendLimit: _spendLimit,
            totalSpent: 0,
            expiration: block.timestamp + _duration,
            isExpired: false,
            isSwept: false
        });

        for (uint256 i = 0; i < _whitelist.length; i++) {
            whitelistedContracts[_ephemeralWallet][_whitelist[i]] = true;
        }

        // Pull limit from caller's wallet to Escrow
        require(IERC20(_token).transferFrom(msg.sender, address(this), _spendLimit), "Funding escrow failed");

        emit SessionCreated(_ephemeralWallet, _token, _spendLimit, block.timestamp + _duration);
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
        require(IERC20(policy.token).transfer(_target, _amount), "Transfer failed");

        emit SpendExecuted(_ephemeralWallet, _target, _amount);
    }

    // Anyone can call sweepSession after expiration, but only the session's masterWallet can sweep before expiration
    function sweepSession(address _ephemeralWallet) external {
        SessionPolicy storage policy = activePolicies[_ephemeralWallet];
        require(msg.sender == policy.masterWallet || block.timestamp > policy.expiration, "Unauthorized sweep");
        require(!policy.isSwept, "Already swept");

        policy.isSwept = true;
        uint256 remainingFunds = policy.spendLimit - policy.totalSpent;
        
        if (remainingFunds > 0) {
            require(IERC20(policy.token).transfer(policy.masterWallet, remainingFunds), "Sweeping failed");
        }

        emit SessionSwept(_ephemeralWallet, policy.masterWallet, remainingFunds);
    }
}
