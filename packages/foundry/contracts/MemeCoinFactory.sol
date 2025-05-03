// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./BondingCurveAuction.sol";

contract MemeCoinFactory {
    address[] public auctions;

    event NewAuction(address indexed auction, address indexed token);

    function createMemecoin(string memory name, string memory symbol) external {
        BondingCurveAuction auction = new BondingCurveAuction(name, symbol);
        auctions.push(address(auction));
        emit NewAuction(address(auction), address(auction.token()));
    }

    function allAuctions() external view returns (address[] memory) {
        return auctions;
    }
}
