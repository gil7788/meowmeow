// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract BondingCurve {
    uint256 public min_price;
    uint256 public fee;

    constructor(uint256 _min_price, uint256 _fee) {
        min_price = _min_price;
        fee = _fee;
    }

    function price(uint256 supply) public view returns (uint256) {
        return supply > 0 ? supply : min_price;
    }

    function mintingCost(uint256 currentSupply, uint256 amountToMint) public view returns (uint256) {
        uint256 newSupply = currentSupply + amountToMint;
        uint256 newPrice = price(newSupply);
        return newSupply * newPrice + fee;
    }

    function refundAmount(uint256 currentSupply, uint256 amount) public view returns (uint256) {
        return amount * price(currentSupply);
    }
}
