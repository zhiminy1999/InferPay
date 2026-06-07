// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {AgentEscrow} from "../src/AgentEscrow.sol";

contract DeployAgentEscrow is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcToken = 0x3600000000000000000000000000000000000000;

        vm.startBroadcast(deployerPrivateKey);
        AgentEscrow agentEscrow = new AgentEscrow(usdcToken);
        console.log("AgentEscrow deployed at:", address(agentEscrow));
        vm.stopBroadcast();
    }
}
