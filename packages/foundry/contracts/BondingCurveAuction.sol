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
    uint256 public constant FEE = 3e16; // 3% fee (0.03 * 1e18)

    constructor(MemeCoin _token) {
        owner = msg.sender;
        token = _token;
        curve = new BondingCurve(MIN_PRICE, FEE);
    }

    function buy(uint256 amountToMint) external payable {
        require(msg.value > 0, "Zero ETH");
        require(!launched, "Already launched");

        uint256 price = curve.getMintCost(token.totalSupply(), amountToMint);
        require(price <= msg.value, "Insufficient ETH");

        token.mint(msg.sender, amountToMint);
        totalEthRaised += msg.value;

        emit Buy(msg.sender, amountToMint, price);

        if (totalEthRaised >= MAX_CAP) {
            launchOnOcelex();
        }
    }

    // function sell(uint256 amount) external {
    //     require(amount > 0, "Zero amount");

    //     uint256 refund = curve.getBurnRefund(token.totalSupply(), amount);
    //     require(address(this).balance >= refund, "Insufficient funds");

    //     token.burn(msg.sender, amount);
    //     totalEthRaised -= refund;
    //     payable(msg.sender).transfer(refund);

    //     emit Sell(msg.sender, amount, refund);
    // }

    function burnFor(address from, uint256 amount) external {
        require(msg.sender == token.owner(), "Only LaunchPad can burn");
        require(amount > 0, "Zero amount");

        uint256 refund = curve.getBurnRefund(token.totalSupply(), amount);
        require(address(this).balance >= refund, "Insufficient funds");

        token.burn(from, amount);
        totalEthRaised -= refund;
        payable(from).transfer(refund);

        emit Sell(from, amount, refund);
    }

    function launchOnOcelex() public {
        require(!launched, "Already launched");
        require(totalEthRaised >= MAX_CAP, "Auction not finished");

        launched = true;
        emit Launch(token.name(), token.symbol(), address(token));
    }
}
