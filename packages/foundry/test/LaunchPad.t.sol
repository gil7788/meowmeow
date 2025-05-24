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

        MemeCoin token = launchPad.launchNewMeme(name, symbol, description, image);
        assertEq(launchPad.recentTokens().length(), 1);

        address memeToken = address(token);
        address auction = launchPad.getAuction(memeToken);
        assertTrue(auction != address(0), "Auction should be deployed");

        assertEq(token.owner(), auction);
    }

    function testLaunchTwiceSameMeme() public {
        string memory name = "TestToken";
        string memory symbol = "TTK";
        string memory description = "Test Desc";
        string memory image = "img.png";

        MemeCoin token0 = launchPad.launchNewMeme(name, symbol, description, image);
        launchPad.launchNewMeme(name, symbol, description, image);
        assertEq(launchPad.recentTokens().length(), 2);

        address memeToken = address(token0);
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

        MemeCoin token0 = launchPad.launchNewMeme(name, symbol, description, image);
        assertEq(launchPad.recentTokens().length(), 1);

        address memeToken = address(token0);
        address auction = launchPad.getAuction(memeToken);
        assertTrue(auction != address(0), "Auction should be deployed");

        MemeCoin token = MemeCoin(memeToken);
        assertEq(token.owner(), auction);

        BondingCurveAuction bca = BondingCurveAuction(payable(auction));
        vm.deal(user, 10 ether);
        vm.startPrank(user);

        uint256 amountToMint = 1;
        uint256 price = bca.curve().getMintCost(0, amountToMint);
        launchPad.buy{ value: price }(memeToken, amountToMint);
    }

    function testFirstMemeIsFeatured() public {
        string memory name = "First";
        string memory symbol = "FST";
        string memory description = "Initial meme";
        string memory image = "image.png";

        MemeCoin token = launchPad.launchNewMeme(name, symbol, description, image);

        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 1, "First meme should be featured");

        assertEq(featured[0], address(token), "Featured token should be the launched token");
    }
}
