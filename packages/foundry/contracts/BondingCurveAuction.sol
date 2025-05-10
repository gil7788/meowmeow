// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./MemeCoin.sol";
import "./BondingCurve.sol";

contract BondingCurveAuction {
    MemeCoin public token;
    BondingCurve public curve;
    address public owner;
    uint256 public totalEthRaised;
    bool public launched = false;

    uint256 public constant MAX_CAP = 10 ether;
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

        // emit Sell(from, amount, refund);
    }

    // [TODO]: Not needed for production
    function priceOracle(bool isBuying, uint256 amount) external view returns (uint256) {
        if (isBuying) {
            return curve.getMintCost(token.totalSupply(), amount);
        } else {
            return curve.getBurnRefund(token.totalSupply(), amount);
        }
    }

    function launchOnOcelex() public {
        require(!launched, "Already launched");
        require(totalEthRaised >= MAX_CAP, "Auction not finished");

        launched = true;
        // emit Launch(token.name(), token.symbol(), address(token));
    }
}
