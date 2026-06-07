// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {JobEscrow} from "../src/JobEscrow.sol";

contract DeployJobEscrow is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        address usdc = 0x3600000000000000000000000000000000000000;
        address agentRegistry = 0xb4a614a597280888D3EEAB8a44562EAB59871270;

        JobEscrow jobEscrow = new JobEscrow(usdc, agentRegistry);
        console.log("JobEscrow deployed at:", address(jobEscrow));

        vm.stopBroadcast();
    }
}
