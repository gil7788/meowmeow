// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./MemeCoin.sol";
import "./BondingCurve.sol";

contract BondingCurveAuction {
    MemeCoin public token;
    BondingCurve public curve;
    address public owner;
    uint256 public totalEthRaised;
    uint256 public constant MAX_CAP = 10 ether;

    bool public launched = false;

    event Buy(address indexed buyer, uint256 amount, uint256 price);
    event Sell(address indexed seller, uint256 amount, uint256 refund);
    event Launch(string name, string symbol, address token);

    uint256 public constant MIN_PRICE = 1 gwei;
    uint256 public constant FEE = 1 gwei;

    constructor(string memory name, string memory symbol) {
        owner = msg.sender;
        token = new MemeCoin(name, symbol, address(this));
        curve = new BondingCurve(MIN_PRICE, FEE);
    }

    function buy(uint256 amountToMint) external payable {
        require(msg.value > 0, "Zero ETH");
        require(!launched, "Already launched");

        uint256 price = curve.mintingCost(token.totalSupply(), amountToMint);
        require(price <= msg.value, "Insufficient ETH");

        token.mint(msg.sender, amountToMint);
        totalEthRaised += msg.value;

        emit Buy(msg.sender, amountToMint, price);

        uint256 capEstimate = token.totalSupply() * curve.price(token.totalSupply());
        if (capEstimate >= MAX_CAP) {
            launchOnOcelex();
        }
    }

    function sell(uint256 amount) external {
        require(amount > 0, "Zero amount");

        uint256 refund = curve.refundAmount(token.totalSupply(), amount);
        require(address(this).balance >= refund, "Insufficient funds");

        token.burn(msg.sender, amount);
        totalEthRaised -= refund;
        payable(msg.sender).transfer(refund);

        emit Sell(msg.sender, amount, refund);
    }

    function launchOnOcelex() public {
        require(!launched, "Already launched");

        uint256 cap = token.totalSupply() * curve.price(token.totalSupply());
        require(address(this).balance == 0 || cap >= MAX_CAP, "Auction not finished");

        launched = true;
        emitLaunched();
    }

    function emitLaunched() internal {
        emit Launch(token.name(), token.symbol(), address(token));
    }
}
