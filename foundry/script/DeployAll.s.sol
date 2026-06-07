// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {AgentEscrow} from "../src/AgentEscrow.sol";
import {AgentConsensus} from "../src/AgentConsensus.sol";
import {InferPayEscrow} from "../src/InferPayEscrow.sol";

contract DeployAll is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        
        address usdcToken = 0x3600000000000000000000000000000000000000;

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy AgentEscrow
        AgentEscrow agentEscrow = new AgentEscrow(usdcToken);
        console.log("AgentEscrow deployed at:", address(agentEscrow));

        // 2. Deploy AgentConsensus
        address[] memory initialAgents = new address[](3);
        initialAgents[0] = deployerAddress;
        initialAgents[1] = address(0x1000000000000000000000000000000000000001);
        initialAgents[2] = address(0x2000000000000000000000000000000000000002);
        
        AgentConsensus agentConsensus = new AgentConsensus(usdcToken, initialAgents, 2);
        console.log("AgentConsensus deployed at:", address(agentConsensus));

        // 3. Deploy InferPayEscrow
        InferPayEscrow inferPayEscrow = new InferPayEscrow(usdcToken);
        console.log("InferPayEscrow deployed at:", address(inferPayEscrow));

        vm.stopBroadcast();
    }
}
