// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./MemeCoin.sol";
import "./BondingCurve.sol";

contract BondingCurveAuction {
    MemeCoin public token;
    BondingCurve public curve;
    address public immutable launchPad;
    bool public launched = false;

    uint256 public constant MIN_PRICE = 1 gwei;
    uint256 public constant FEE = 3e16; // 3% fee

    event LogRefundAmount(uint256 refund);

    constructor(MemeCoin _token, address _launchPad) {
        token = _token;
        launchPad = _launchPad;
        curve = new BondingCurve(MIN_PRICE, FEE);
    }

    // Allow the contract to receive ETH
    receive() external payable { }

    function buy(address buyer, uint256 amountToMint) external payable {
        require(msg.sender == launchPad, "Only LaunchPad can call buy");
        require(msg.value > 0, "Zero ETH");
        require(!launched, "Already launched");

        uint256 price = curve.getMintCost(token.totalSupply(), amountToMint);
        require(price <= msg.value, "Insufficient ETH");

        token.mint(buyer, amountToMint);

        if (address(this).balance >= token.maxCap()) {
            launchOnOcelex();
        }
    }

    function burnAndRefund(address seller, address owner, uint256 amount) external {
        require(msg.sender == launchPad, "Only LaunchPad can call burn");
        require(amount > 0, "Amount must be greater than zero");
        require(token.balanceOf(owner) >= amount, "Not enough tokens to burn");

        uint256 supplyBefore = token.totalSupply();
        require(amount <= supplyBefore, "Burn amount exceeds total supply");

        token.burn(owner, amount);

        uint256 refund = curve.getBurnRefund(supplyBefore, amount);
        require(refund > 0, "Refund is zero");
        require(address(this).balance >= refund, "Insufficient ETH in auction");

        emit LogRefundAmount(refund);

        (bool success,) = seller.call{ value: refund }("");
        require(success, "ETH refund failed");
    }

    function launchOnOcelex() internal {
        require(!launched, "Already launched");
        require(address(this).balance >= token.maxCap(), "Auction not finished");
        launched = true;
    }
}
