// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/LaunchPad.sol";
import "../contracts/MemeCoinFactory.sol";
import "../contracts/MemeCoin.sol";
import "../contracts/BondingCurveAuction.sol";
import "forge-std/console.sol";

contract LaunchPadTest is Test {
    LaunchPad public launchPad;
    MemeCoinFactory public factory;
    address public deployer = address(this);
    address public user = address(0xBEEF);

    function setUp() public {
        factory = new MemeCoinFactory();
        launchPad = new LaunchPad(address(factory));
    }

    function testLaunchMeme() public {
        string memory name = "TestToken";
        string memory symbol = "TTK";
        string memory description = "Test Desc";
        string memory image = "img.png";

        launchPad.launchNewMeme(name, symbol, description, image);

        address[] memory tokens = launchPad.getAllTokens();
        console.log("Token count: %s", tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            console.log("Token %s: %s", i, tokens[i]);
        }
        assertEq(tokens.length, 1);

        address memeToken = tokens[0];
        address auction = launchPad.getAuction(memeToken);
        assertTrue(auction != address(0), "Auction should be deployed");

        MemeCoin token = MemeCoin(memeToken);
        assertEq(token.owner(), auction);
    }

    function testLaunchTwiceSameMeme() public {
        // Should have 2 Meme Coin Launched
        string memory name = "TestToken";
        string memory symbol = "TTK";
        string memory description = "Test Desc";
        string memory image = "img.png";

        launchPad.launchNewMeme(name, symbol, description, image);
        launchPad.launchNewMeme(name, symbol, description, image);

        address[] memory tokens = launchPad.getAllTokens();
        console.log("Token count: %s", tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            console.log("Token %s: %s", i, tokens[i]);
        }
        assertEq(tokens.length, 2);

        address memeToken = tokens[0];
        address auction = launchPad.getAuction(memeToken);
        assertTrue(auction != address(0), "Auction should be deployed");

        MemeCoin token = MemeCoin(memeToken);
        assertEq(token.owner(), auction);
    }

    function testLaunchBuy() public {
        string memory name = "TestToken";
        string memory symbol = "TTK";
        string memory description = "Test Desc";
        string memory image = "img.png";

        launchPad.launchNewMeme(name, symbol, description, image);

        address[] memory tokens = launchPad.getAllTokens();
        assertEq(tokens.length, 1);

        address memeToken = tokens[0];
        address auction = launchPad.getAuction(memeToken);
        assertTrue(auction != address(0), "Auction should be deployed");

        MemeCoin token = MemeCoin(memeToken);
        assertEq(token.owner(), auction);

        BondingCurveAuction bca = BondingCurveAuction(payable(auction));
        vm.deal(user, 10 ether);
        vm.startPrank(user);

        uint256 amountToMint = 1; // Buy 1 token
        uint256 price = bca.curve().getMintCost(0, amountToMint);
        launchPad.buy{ value: price }(memeToken, amountToMint);
    }
}
