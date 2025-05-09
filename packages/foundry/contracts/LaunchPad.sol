// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./BondingCurveAuction.sol";
import "./MemeCoinFactory.sol";
import "./MemeCoin.sol";

contract LaunchPad {
    MemeCoinFactory public memeFactory;
    address public owner;

    mapping(address => address) public tokenToAuction;
    address[] public allTokens;

    event MemeLaunched(address indexed creator, address token, address auction);

    constructor(address _memeFactory) {
        owner = msg.sender;
        memeFactory = MemeCoinFactory(_memeFactory);
    }

    function launchNewMeme(string memory name, string memory symbol, string memory description, string memory image)
        external
    {
        MemeCoin meme = memeFactory.mintNewToken(name, symbol, description, image);
        BondingCurveAuction auction = new BondingCurveAuction(meme);
        tokenToAuction[address(meme)] = address(auction);
        allTokens.push(address(meme));
        meme.transferOwnership(address(auction));
    }

    function buy(address token, uint256 amount) external payable {
        address auction = tokenToAuction[token];
        require(auction != address(0), "Invalid token");
        BondingCurveAuction(auction).buy{ value: msg.value }(amount);
    }

    function sell(address token, uint256 amount) external {
        address auction = tokenToAuction[token];
        require(auction != address(0), "Invalid token");
        BondingCurveAuction(auction).sell(amount);
    }

    function getAuction(address token) external view returns (address) {
        return tokenToAuction[token];
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }
}
