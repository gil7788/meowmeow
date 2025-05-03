// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

// import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import { ERC20 } from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract MemeCoin is ERC20 {
    address public auction;

    modifier onlyAuction() {
        require(msg.sender == auction, "Not authorized");
        _;
    }

    constructor(string memory name, string memory symbol, address _auction) ERC20(name, symbol) {
        auction = _auction;
    }

    function mint(address to, uint256 amount) external onlyAuction {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyAuction {
        _burn(from, amount);
    }
}
