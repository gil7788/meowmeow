// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./MemeCoin.sol";

contract MemeCoinFactory {
    struct TokenMetadata {
        uint256 maxCap;
        string name;
        string symbol;
        string description;
        string image; // base64 stored fully on-chain
    }

    mapping(address => TokenMetadata) public tokenMetadata;

    function mintNewToken(
        uint256 _maxCap,
        string memory name,
        string memory symbol,
        string memory description,
        string memory image
    ) external returns (MemeCoin) {
        MemeCoin newToken = new MemeCoin(_maxCap, name, symbol);

        newToken.transferOwnership(msg.sender);

        address tokenAddr = address(newToken);

        tokenMetadata[tokenAddr] =
            TokenMetadata({ maxCap: _maxCap, name: name, symbol: symbol, description: description, image: image });

        return newToken;
    }

    // Consider to delete
    function getTokenMetadata(address token) external view returns (TokenMetadata memory) {
        return tokenMetadata[token];
    }
}
