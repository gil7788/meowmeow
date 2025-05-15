// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { ERC20 } from "openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "openzeppelin-contracts/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { Ownable } from "openzeppelin-contracts/contracts/access/Ownable.sol";

contract MemeCoin is ERC20, Ownable {
    uint256 public maxCap;

    constructor(uint256 _maxCap, string memory name, string memory symbol) ERC20(name, symbol) Ownable(msg.sender) {
        maxCap = _maxCap;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}
