// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/MemeCoinFactory.sol";

contract DeployMemeCoinFactory is Script {
    MemeCoinFactory public factory;

    function run() public {
        vm.startBroadcast();
        factory = new MemeCoinFactory();
        vm.stopBroadcast();

        console.log("MemeCoinFactory deployed at:", address(factory));
    }

    function getFactory() public view returns (address) {
        return address(factory);
    }
}
