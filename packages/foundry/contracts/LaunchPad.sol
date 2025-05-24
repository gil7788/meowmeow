// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./BondingCurveAuction.sol";
import "./MemeCoinFactory.sol";
import "./MemeCoin.sol";
import "./MemeQueue.sol";
import "forge-std/console.sol";

contract LaunchPad {
    MemeCoinFactory public memeFactory;
    address public owner;
    uint256 public constant MAX_CAP = 10 ether;
    uint256 private constant RECENT_MEMES_CAPS = 50;
    uint256 private constant FEATURED_MEMES_CAPS = 2;
    uint256 private constant FEATURED_MARKET_CAP_THRESHOLD = 5 ether;

    mapping(address => address) public tokenToAuction;
    MemeQueue public recentTokens;
    MemeQueue public featuredTokens;

    event Buy(address indexed buyer, uint256 amount, uint256 price, uint256 tokenTotalSupply);
    event Sell(address indexed seller, uint256 amount, uint256 refund);
    event Launch(string name, string symbol, address token);

    event TokenCreated(
        address indexed creator, address tokenAddress, string name, string symbol, string description, string image
    );

    event MemeLaunched(address indexed creator, address token, address auction);

    constructor(address _memeFactory) {
        owner = msg.sender;
        memeFactory = MemeCoinFactory(_memeFactory);

        recentTokens = new MemeQueue(RECENT_MEMES_CAPS);
        featuredTokens = new MemeQueue(FEATURED_MEMES_CAPS);
    }

    function launchNewMeme(string memory name, string memory symbol, string memory description, string memory image)
        external
        returns (MemeCoin)
    {
        MemeCoin meme = memeFactory.mintNewToken(MAX_CAP, name, symbol, description, image);
        address memeAddress = address(meme);
        BondingCurveAuction auction = new BondingCurveAuction(meme, address(this));
        tokenToAuction[memeAddress] = address(auction);

        recentTokens.addMeme(meme);
        meme.transferOwnership(address(auction));

        updateFeatured(meme, auction);
        emit TokenCreated(msg.sender, memeAddress, name, symbol, description, image);
        return meme;
    }

    function buy(address token, uint256 amount) external payable {
        address payable auctionAddress = payable(tokenToAuction[token]);
        require(auctionAddress != address(0), "Invalid token");
        MemeCoin meme = MemeCoin(token);
        BondingCurveAuction auction = BondingCurveAuction(auctionAddress);

        auction.buy{ value: msg.value }(msg.sender, amount);
        console.log("meme.balance: ", auctionAddress.balance);
        updateFeatured(meme, auction);
        emit Buy(msg.sender, amount, msg.value, meme.totalSupply());
    }

    function sell(address token, uint256 amount) external {
        address payable auctionAddress = payable(tokenToAuction[token]);
        require(auctionAddress != address(0), "Invalid token");
        MemeCoin meme = MemeCoin(token);
        BondingCurveAuction auction = BondingCurveAuction(auctionAddress);

        meme.transferFrom(msg.sender, address(this), amount);
        auction.burnAndRefund(msg.sender, address(this), amount);
        updateFeatured(meme, auction);
        emit Sell(msg.sender, amount, meme.totalSupply());
    }

    function updateFeatured(MemeCoin meme, BondingCurveAuction auction) private {
        bool alreadyFeatured = isFeatured(meme);

        if (!alreadyFeatured) {
            console.log("alreadyFeatured: ", alreadyFeatured);
            if (address(auction).balance > FEATURED_MARKET_CAP_THRESHOLD || featuredTokens.length() < FEATURED_MEMES_CAPS) {
                featuredTokens.addMeme(meme);
            }
        }
    }

    function isFeatured(MemeCoin meme) private view returns (bool) {
        return featuredTokens.contains(meme);
    }


    function getAuction(address token) external view returns (address) {
        return tokenToAuction[token];
    }

    function getFeaturedTokens() external view returns (MemeCoin[] memory) {
        return featuredTokens.getAllMemes();
    }

    function getRecentTokens() external view returns (MemeCoin[] memory) {
        return recentTokens.getAllMemes();
    }

    function getFeaturedTokenAddresses() external view returns (address[] memory) {
        return featuredTokens.getAllMemeAddresses();
    }

    function getRecentTokenAddresses() external view returns (address[] memory) {
        return recentTokens.getAllMemeAddresses();
    }
}
