// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/BondingCurveAuction.sol";
import "../contracts/MemeCoin.sol";

contract BondingCurveAuctionTest is Test {
    BondingCurveAuction public auction;
    MemeCoin public token;
    address public alice = address(0x1);
    address public bob = address(0x2);

    function setUp() public {
        token = new MemeCoin("MemeCoin", "MEME");
        auction = new BondingCurveAuction(token);
        token.transferOwnership(address(auction));
    }

    function testInitialTokenState() public view {
        assertEq(token.name(), "MemeCoin");
        assertEq(token.symbol(), "MEME");
        assertEq(token.totalSupply(), 0);
    }

    function testBuyMintTokens() public {
        vm.deal(alice, 1 ether);
        vm.prank(alice);
        // Mint 1M tokens
        auction.buy{ value: 1 ether }(1_000_000);

        uint256 balance = token.balanceOf(alice);
        assertGt(balance, 0);
        assertEq(address(auction).balance, 1 ether);
    }
}
