// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {AgentConsensus} from "../src/AgentConsensus.sol";

contract DeployAgentConsensus is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployerAddress = vm.addr(deployerPrivateKey);
        address usdcToken = 0x3600000000000000000000000000000000000000;

        vm.startBroadcast(deployerPrivateKey);

        address[] memory initialAgents = new address[](3);
        initialAgents[0] = deployerAddress;
        initialAgents[1] = address(0x0c200b495d3EF602151caa364e071Bd71829978B);
        initialAgents[2] = address(0xB2a136968F2a8085371577Cbbe173F79b93caF1a);

        AgentConsensus agentConsensus = new AgentConsensus(usdcToken, initialAgents, 2);
        console.log("AgentConsensus deployed at:", address(agentConsensus));

        vm.stopBroadcast();
    }
}
