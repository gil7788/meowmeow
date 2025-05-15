// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./BondingCurveAuction.sol";
import "./MemeCoinFactory.sol";
import "./MemeCoin.sol";

contract LaunchPad {
    MemeCoinFactory public memeFactory;
    address public owner;
    uint256 public constant MAX_CAP = 10 ether;

    mapping(address => address) public tokenToAuction;
    address[] public allTokens;

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
    }

    function launchNewMeme(string memory name, string memory symbol, string memory description, string memory image)
        external
        returns (MemeCoin)
    {
        MemeCoin meme = memeFactory.mintNewToken(MAX_CAP, name, symbol, description, image);
        BondingCurveAuction auction = new BondingCurveAuction(meme, address(this));
        tokenToAuction[address(meme)] = address(auction);
        allTokens.push(address(meme));

        meme.transferOwnership(address(auction));
        emit TokenCreated(msg.sender, address(meme), name, symbol, description, image);
        return meme;
    }

    function buy(address token, uint256 amount) external payable {
        address payable auction = payable(tokenToAuction[token]);
        require(auction != address(0), "Invalid token");
        BondingCurveAuction(auction).buy{ value: msg.value }(msg.sender, amount);
        emit Buy(msg.sender, amount, msg.value, MemeCoin(token).totalSupply());
    }

    function sell(address token, uint256 amount) external {
        address payable auction = payable(tokenToAuction[token]);
        require(auction != address(0), "Invalid token");
        MemeCoin meme = MemeCoin(token);

        meme.transferFrom(msg.sender, address(this), amount);

        BondingCurveAuction(auction).burnAndRefund(msg.sender, address(this), amount);
        emit Sell(msg.sender, amount, meme.totalSupply());
    }

    function getAuction(address token) external view returns (address) {
        return tokenToAuction[token];
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
}
