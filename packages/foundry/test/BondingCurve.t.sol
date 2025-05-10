// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/BondingCurve.sol";

contract BondingCurveTest is Test {
    BondingCurve public curve;
    uint256 public constant MIN_PRICE = 1 gwei;
    uint256 public constant FEE = 3e16; // 3% fee, i.e. 0.03 * 1e18

    function setUp() public {
        curve = new BondingCurve(MIN_PRICE, FEE);
    }

    function testPriceReturnsMinWhenSupplyZero() public view {
        uint256 result = curve.getMintCost(2, 3);

        uint256 base = 3 ** 2 + 4 ** 2 + 5 ** 2; // = 9 + 16 + 25 = 52
        uint256 expected = (base * (1e18 + FEE)) / 1e18 + 1;

        assertEq(result, expected);
    }

    function testPriceReturnsSupplyWhenNonZero() public view {
        uint256 result = curve.getMintCost(0, 5);

        uint256 base = 1 ** 2 + 2 ** 2 + 3 ** 2 + 4 ** 2 + 5 ** 2; // = 1+4+9+16+25 = 55
        uint256 expected = (base * (1e18 + FEE)) / 1e18 + 1;

        assertEq(result, expected);
    }

    function testMintCostMatchesFormula() public view {
        uint256 supply = 3;
        uint256 amountToMint = 2;

        uint256 base = 4 ** 2 + 5 ** 2; // 16 + 25 = 41
        uint256 expected = (base * (1e18 + FEE)) / 1e18 + 1;
        uint256 result = curve.getMintCost(supply, amountToMint);

        assertEq(result, expected);
    }

    function testBurnRefundMatchesFormula() public view {
        uint256 supply = 10;
        uint256 amountToBurn = 3;

        uint256 base = 10 ** 2 + 9 ** 2 + 8 ** 2; // 100 + 81 + 64 = 245
        uint256 expected = (base * (1e18 - FEE)) / 1e18;
        uint256 result = curve.getBurnRefund(supply, amountToBurn);

        assertEq(result, expected);
    }

    function testBurnRevertsIfBurningTooMuch() public {
        uint256 supply = 5;
        uint256 amountToBurn = 6;

        vm.expectRevert(); // Should revert due to require check
        curve.getBurnRefund(supply, amountToBurn);
    }

    // function testMarketCapIsCorrect() view public {
    //     uint256 supply = 7;
    //     uint256 expected = 7 * 7;
    //     uint256 result = curve.getMarketCap(supply);

    //     assertEq(result, expected);
    // }

    function testBuyZeroTokensReverts() public {
        vm.expectRevert("Must mint > 0");
        curve.getMintCost(5, 0);
    }

    function testSellZeroTokensReverts() public {
        vm.expectRevert("Invalid burn request");
        curve.getBurnRefund(5, 0);
    }
}
