// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/BondingCurve.sol";

contract BondingCurveTest is Test {
    BondingCurve public auction;
    uint256 public constant MIN_PRICE = 1 gwei;
    uint256 public constant FEE = 1 gwei;

    function setUp() public {
        auction = new BondingCurve(MIN_PRICE, FEE);
    }

    function testSellBurnTokens() public { }
}
