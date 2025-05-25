// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/LaunchPad.sol";
import "../contracts/MemeCoinFactory.sol";
import "../contracts/MemeCoin.sol";
import "../contracts/BondingCurveAuction.sol";

contract LaunchPadTest is Test {
    LaunchPad public launchPad;
    MemeCoinFactory public factory;
    address public deployer = address(this);
    address public user = address(0xBEEF);

    function setUp() public {
        factory = new MemeCoinFactory();
        launchPad = new LaunchPad(address(factory));
    }

    function launchBasic(string memory name, string memory symbol, string memory description, string memory image)
        internal
        returns (MemeCoin)
    {
        return launchPad.launchNewMeme(name, symbol, description, "", "", "", "", "", "", image);
    }

    function testLaunchMeme() public {
        MemeCoin token = launchBasic("TestToken", "TTK", "Test Desc", "img.png");
        assertEq(launchPad.recentTokens().length(), 1);

        address memeToken = address(token);
        address auction = launchPad.getAuction(memeToken);
        assertTrue(auction != address(0));
        assertEq(token.owner(), auction);
    }

    function testLaunchTwiceSameMeme() public {
        launchBasic("TestToken", "TTK", "Test Desc", "img.png");
        launchBasic("TestToken", "TTK", "Test Desc", "img.png");
        assertEq(launchPad.recentTokens().length(), 2);
    }

    function testLaunchBuy() public {
        MemeCoin token0 = launchBasic("TestToken", "TTK", "Test Desc", "img.png");
        address memeToken = address(token0);
        address auction = launchPad.getAuction(memeToken);

        BondingCurveAuction bca = BondingCurveAuction(payable(auction));
        vm.deal(user, 10 ether);
        vm.startPrank(user);

        uint256 amountToMint = 1;
        uint256 price = bca.curve().getMintCost(0, amountToMint);
        launchPad.buy{ value: price }(memeToken, amountToMint);
        vm.stopPrank();
    }

    function testFirstMemeIsFeatured() public {
        MemeCoin token = launchBasic("First", "FST", "Initial meme", "image.png");
        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 1);
        assertEq(featured[0], address(token));
    }

    function testFeaturedCapUnderThresholdGetsAdded() public {
        for (uint256 i = 0; i < 7; i++) {
            launchBasic(string.concat("Token", vm.toString(i)), "SYM", "desc", "img.png");
        }

        MemeCoin lowCap = launchBasic("LowCap", "LC", "desc", "img.png");
        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 8);
        assertEq(featured[7], address(lowCap));
    }

    function testFeaturedCapReachedLowSupplyGetsIgnored() public {
        for (uint256 i = 0; i < 8; i++) {
            launchBasic(string.concat("Token", vm.toString(i)), "SYM", "desc", "img.png");
        }

        MemeCoin extra = launchBasic("Extra", "EXT", "desc", "img.png");
        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 8);
        for (uint256 i = 0; i < 8; i++) {
            assertTrue(featured[i] != address(extra));
        }
    }

    function testFeaturedCapReachedHighSupplyGetsAdded() public {
        for (uint256 i = 0; i < 8; i++) {
            launchBasic(string.concat("Token", vm.toString(i)), "SYM", "desc", "img.png");
        }

        MemeCoin highCap = launchBasic("High", "HGH", "desc", "img.png");
        BondingCurveAuction auction = BondingCurveAuction(payable(launchPad.getAuction(address(highCap))));
        vm.deal(user, 10 ether);
        vm.startPrank(user);
        uint256 amounToBuy = 2500000;
        uint256 cost = auction.curve().getMintCost(0, amounToBuy);
        launchPad.buy{ value: cost }(address(highCap), amounToBuy);
        vm.stopPrank();

        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 8);
        assertEq(featured[7], address(highCap));
    }

    function testAlreadyFeaturedTokenIsNotReadded() public {
        MemeCoin token = launchBasic("Dup", "DUP", "desc", "img.png");
        BondingCurveAuction auction = BondingCurveAuction(payable(launchPad.getAuction(address(token))));
        vm.deal(user, 10 ether);
        vm.startPrank(user);
        uint256 amounToBuy = 2500000;
        uint256 cost = auction.curve().getMintCost(0, amounToBuy);
        launchPad.buy{ value: cost }(address(token), amounToBuy);
        vm.stopPrank();

        address[] memory featuredBefore = launchPad.getFeaturedTokenAddresses();
        launchPad.buy{ value: cost }(address(token), 1);
        address[] memory featuredAfter = launchPad.getFeaturedTokenAddresses();

        assertEq(featuredBefore.length, featuredAfter.length);
        assertEq(featuredBefore[0], featuredAfter[0]);
    }

    function testEdgeCaseExactly8LowCapTokenIgnored() public {
        for (uint256 i = 0; i < 8; i++) {
            launchBasic(string.concat("Token", vm.toString(i)), "SYM", "desc", "img.png");
        }
        MemeCoin ignored = launchBasic("Ignored", "IGN", "desc", "img.png");
        address[] memory featured = launchPad.getFeaturedTokenAddresses();
        assertEq(featured.length, 8);
        for (uint256 i = 0; i < 8; i++) {
            assertTrue(featured[i] != address(ignored));
        }
    }

    function testLaunchWithOptionalMetadata() public {
        MemeCoin token = launchPad.launchNewMeme(
            "FullToken",
            "FTK",
            "A token with everything",
            "https://x.com/fulltoken",
            "https://t.me/fulltoken",
            "https://youtube.com/fulltoken",
            "https://instagram.com/fulltoken",
            "https://tiktok.com/@fulltoken",
            "https://fulltoken.io",
            "full-image.png"
        );

        address tokenAddress = address(token);
        MemeCoinFactory.TokenMetadata memory meta = factory.getTokenMetadata(tokenAddress);

        assertEq(meta.name, "FullToken");
        assertEq(meta.telegram, "https://t.me/fulltoken");
        assertEq(meta.webpage, "https://fulltoken.io");
        assertEq(meta.image, "full-image.png");
    }

    function testLaunchWithAllMetadataSet1() public {
        MemeCoin token = launchPad.launchNewMeme(
            "MemeX",
            "MX",
            "Cool Meme Token",
            "https://x.com/memex",
            "https://t.me/memex",
            "https://youtube.com/memex",
            "https://instagram.com/memex",
            "https://tiktok.com/@memex",
            "https://memex.io",
            "memex.png"
        );

        address tokenAddress = address(token);
        MemeCoinFactory.TokenMetadata memory meta = factory.getTokenMetadata(tokenAddress);

        assertEq(meta.name, "MemeX");
        assertEq(meta.symbol, "MX");
        assertEq(meta.description, "Cool Meme Token");
        assertEq(meta.xProfile, "https://x.com/memex");
        assertEq(meta.telegram, "https://t.me/memex");
        assertEq(meta.youtubeLink, "https://youtube.com/memex");
        assertEq(meta.instagram, "https://instagram.com/memex");
        assertEq(meta.tiktok, "https://tiktok.com/@memex");
        assertEq(meta.webpage, "https://memex.io");
        assertEq(meta.image, "memex.png");

        address auction = launchPad.getAuction(tokenAddress);
        assertTrue(auction != address(0));
        assertEq(token.owner(), auction);
    }

    function testLaunchWithAllMetadataSet2() public {
        MemeCoin token = launchPad.launchNewMeme(
            "MegaMeme",
            "MME",
            "Meme but Mega",
            "https://x.com/megameme",
            "https://t.me/megameme",
            "https://youtube.com/megameme",
            "https://instagram.com/megameme",
            "https://tiktok.com/@megameme",
            "https://megameme.fun",
            "megameme.png"
        );

        address tokenAddress = address(token);
        MemeCoinFactory.TokenMetadata memory meta = factory.getTokenMetadata(tokenAddress);

        assertEq(meta.name, "MegaMeme");
        assertEq(meta.symbol, "MME");
        assertEq(meta.description, "Meme but Mega");
        assertEq(meta.xProfile, "https://x.com/megameme");
        assertEq(meta.telegram, "https://t.me/megameme");
        assertEq(meta.youtubeLink, "https://youtube.com/megameme");
        assertEq(meta.instagram, "https://instagram.com/megameme");
        assertEq(meta.tiktok, "https://tiktok.com/@megameme");
        assertEq(meta.webpage, "https://megameme.fun");
        assertEq(meta.image, "megameme.png");

        address auction = launchPad.getAuction(tokenAddress);
        assertTrue(auction != address(0));
        assertEq(token.owner(), auction);
    }
}
