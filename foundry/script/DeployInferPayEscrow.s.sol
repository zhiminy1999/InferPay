// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {InferPayEscrow} from "../src/InferPayEscrow.sol";

contract DeployInferPayEscrow is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address usdcToken = 0x3600000000000000000000000000000000000000;

        vm.startBroadcast(deployerPrivateKey);
        InferPayEscrow inferPayEscrow = new InferPayEscrow(usdcToken);
        console.log("InferPayEscrow deployed at:", address(inferPayEscrow));
        vm.stopBroadcast();
    }
}
