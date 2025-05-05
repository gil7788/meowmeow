// packages/foundry/script/DeployMemeCoinFactory.s.sol
pragma solidity ^0.8.26;

import "forge-std/Script.sol";
import { MemeCoinFactory } from "../contracts/MemeCoinFactory.sol";

contract DeployMemeCoinFactory is Script {
    function setUp() public { }

    function run() public {
        vm.startBroadcast();
        new MemeCoinFactory();
        vm.stopBroadcast();
    }
}
