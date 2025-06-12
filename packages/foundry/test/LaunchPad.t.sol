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

    // [TODO]: Consider to pass max featured coins as an parameter to launchpad
    function testFeaturedCapUnderThresholdGetsAdded() public {
        // Fill featured queue to 7 (under cap)
        for (uint256 i = 0; i < 7; i++) {
            string memory name = string.concat("Token", vm.toString(i));
            launchPad.launchNewMeme(name, "SYM", "desc", "img.png");
        }

        // Launch 8th token with 0 supply (won't pass market cap threshold)
        MemeCoin lowCap = launchPad.launchNewMeme("LowCap", "LC", "desc", "img.png");

        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 8);
        assertEq(featured[7], address(lowCap));
    }

    function testFeaturedCapReachedLowSupplyGetsIgnored() public {
        // Fill up to 8 featured tokens
        for (uint256 i = 0; i < 8; i++) {
            string memory name = string.concat("Token", vm.toString(i));
            launchPad.launchNewMeme(name, "SYM", "desc", "img.png");
        }

        // Attempt to add a 9th with low supply (not above threshold)
        MemeCoin extra = launchPad.launchNewMeme("Extra", "EXT", "desc", "img.png");
        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 8);
        for (uint256 i = 0; i < 8; i++) {
            assertTrue(featured[i] != address(extra));
        }
    }

    function testFeaturedCapReachedHighSupplyGetsAdded() public {
        for (uint256 i = 0; i < 8; i++) {
            string memory name = string.concat("Token", vm.toString(i));
            launchPad.launchNewMeme(name, "SYM", "desc", "img.png");
        }

        MemeCoin highCap = launchPad.launchNewMeme("High", "HGH", "desc", "img.png");
        BondingCurveAuction auction = BondingCurveAuction(payable(launchPad.getAuction(address(highCap))));
        vm.deal(user, 10 ether);
        vm.startPrank(user);
        uint256 amounToBuy = 2500000;
        uint256 cost = auction.curve().getMintCost(0, amounToBuy);
        launchPad.buy{ value: cost }(address(highCap), amounToBuy);
        vm.stopPrank();

        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 8); // Surpasses threshold despite queue cap
        assertEq(featured[7], address(highCap));
    }

    function testAlreadyFeaturedTokenIsNotReadded() public {
        MemeCoin token = launchPad.launchNewMeme("Dup", "DUP", "desc", "img.png");
        BondingCurveAuction auction = BondingCurveAuction(payable(launchPad.getAuction(address(token))));
        vm.deal(user, 10 ether);
        vm.startPrank(user);
        uint256 amounToBuy = 2500000;
        uint256 cost = auction.curve().getMintCost(0, amounToBuy);
        launchPad.buy{ value: cost }(address(token), amounToBuy);
        vm.stopPrank();

        address[] memory featuredBefore = launchPad.getFeaturedTokenAddresses();
        uint256 amountToBuy2 = 1;
        launchPad.buy{ value: cost }(address(token), amountToBuy2);
        address[] memory featuredAfter = launchPad.getFeaturedTokenAddresses();
        assertEq(featuredBefore.length, featuredAfter.length);
        assertEq(featuredBefore[0], featuredAfter[0]);
    }

    function testEdgeCaseExactly8LowCapTokenIgnored() public {
        for (uint256 i = 0; i < 8; i++) {
            string memory name = string.concat("Token", vm.toString(i));
            launchPad.launchNewMeme(name, "SYM", "desc", "img.png");
        }
        MemeCoin ignored = launchPad.launchNewMeme("Ignored", "IGN", "desc", "img.png");
        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 8);
        for (uint256 i = 0; i < 8; i++) {
            assertTrue(featured[i] != address(ignored));
        }
    }
}
