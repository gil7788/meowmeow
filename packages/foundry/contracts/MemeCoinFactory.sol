// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./MemeCoin.sol";

contract MemeCoinFactory {
    struct TokenMetadata {
        string name;
        string symbol;
        string description;
        string image; // base64 or SVG string, stored fully on-chain
    }

    // Track created tokens
    address[] public allTokens;
    mapping(address => address[]) public userToTokens;
    mapping(address => TokenMetadata) public tokenMetadata;

    event TokenCreated(
        address indexed creator, address tokenAddress, string name, string symbol, string description, string image
    );

    function mintNewToken(string memory name, string memory symbol, string memory description, string memory image)
        external
    {
        MemeCoin newToken = new MemeCoin(name, symbol);

        address tokenAddr = address(newToken);

        // Store metadata on-chain
        tokenMetadata[tokenAddr] = TokenMetadata({ name: name, symbol: symbol, description: description, image: image });

        allTokens.push(tokenAddr);
        userToTokens[msg.sender].push(tokenAddr);

        emit TokenCreated(msg.sender, tokenAddr, name, symbol, description, image);
    }

    function getTokensByUser(address user) external view returns (address[] memory) {
        return userToTokens[user];
    }

    function getAllTokens() external view returns (address[] memory) {
        return allTokens;
    }

    function getTokenMetadata(address token) external view returns (TokenMetadata memory) {
        return tokenMetadata[token];
    }
}

// address[] public auctions;
//     uint32 private constant LAUNCH_THRESTHOLD = 2^10;

// function createMemecoin(string memory name, string memory symbol) external {
//     BondingCurveAuction auction = new BondingCurveAuction(name, symbol);
//     auctions.push(address(auction));
//     emit NewAuction(address(auction), address(auction.token()));
// }

// function allAuctions() external view returns (address[] memory) {
//     return auctions;
// }
// event NewAuction(add                                                                                                                                                                                                                                                                                                                                                                          ress indexed auction, address indexed token);
