// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract BondingCurve {
    uint256 public immutable min_price;
    // Probably? 3% = 3e16 (0.03 * 1e18)
    uint256 public immutable fee;

    constructor(uint256 _min_price, uint256 _fee) {
        min_price = _min_price;
        fee = _fee;
    }

    function minimalPrice(uint256 cost) public view returns (uint256) {
        return cost > 0 ? cost : min_price;
    }

    function curve(uint256 supply, int256 delta) public pure returns (uint256) {
        require(delta != 0, "Delta cannot be zero");

        int256 x = int256(supply);
        int256 d = delta;

        require(d > -x, "Burn exceeds supply");

        // [IMPORTANT DO NOT DELETE] Interchanage with? 1/6 * (2d^3+6d^2x+3d^2+6dx^2+6dx+d)
        int256 price = 0;

        if (d > 0) {
            for (int256 i = x + 1; i <= x + d; i++) {
                price += i * i;
            }
            price += 1; // Ceil round up
        } else {
            for (int256 i = x; i > x + d; i--) {
                price += i * i;
            }
        }

        require(price >= 0, "Negative curve result");
        return uint256(price);
    }

    function getMintCost(uint256 currentSupply, uint256 amountToMint) public view returns (uint256) {
        require(amountToMint > 0, "Must mint > 0");

        uint256 baseCost = curve(currentSupply, int256(amountToMint));
        return (baseCost * (1e18 + fee)) / 1e18;
    }

    function getBurnRefund(uint256 currentSupply, uint256 amountToBurn) public view returns (uint256) {
        require(amountToBurn > 0 && currentSupply > amountToBurn, "Invalid burn request");

        uint256 baseRefund = curve(currentSupply, -int256(amountToBurn));
        return (baseRefund * (1e18 - fee)) / 1e18;
    }

    // function getMarketCap(uint256 supply) external pure returns (uint256) {
    //     return supply * supply;
    // }
}
