// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../contracts/MemeCoinFactory.sol";
import "../contracts/LaunchPad.sol";

contract DeployLaunchPad is Script {
    LaunchPad public launchPad;
    MemeCoinFactory public memeFactory;

    function runWithFactory(address factoryAddress) public returns (LaunchPad) {
        vm.startBroadcast();
        launchPad = new LaunchPad(factoryAddress);
        vm.stopBroadcast();

        console.log("LaunchPad deployed at:", address(launchPad));
        return launchPad;
    }
}
