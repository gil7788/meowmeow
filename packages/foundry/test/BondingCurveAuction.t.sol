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
    uint256 MAX_CAP = 10 ether;

    function setUp() public {
        token = new MemeCoin(MAX_CAP, "MemeCoin", "MEME");
        auction = new BondingCurveAuction(token, address(this));
        token.transferOwnership(address(auction));
    }

    function testInitialTokenState() public view {
        assertEq(token.name(), "MemeCoin");
        assertEq(token.symbol(), "MEME");
        assertEq(token.totalSupply(), 0);
    }

    function testBuyMintTokens() public {
        vm.deal(address(this), 1 ether); // fund the "launchPad"
        auction.buy{ value: 1 ether }(alice, 1_000_000);

        uint256 balance = token.balanceOf(alice);
        assertGt(balance, 0);
        assertEq(address(auction).balance, 1 ether);
    }
}
