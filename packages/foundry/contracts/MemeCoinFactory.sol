// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./MemeCoin.sol";

contract MemeCoinFactory {
    struct TokenMetadata {
        uint256 maxCap;
        string name;
        string symbol;
        string description;
        string xProfile;
        string telegram;
        string youtubeLink;
        string instagram;
        string tiktok;
        string webpage;
        string image; // base64 stored fully on-chain
    }

    mapping(address => TokenMetadata) public tokenMetadata;

    function mintNewToken(
        uint256 _maxCap,
        string memory name,
        string memory symbol,
        string memory description,
        string memory xProfile,
        string memory telegram,
        string memory youtubeLink,
        string memory instagram,
        string memory tiktok,
        string memory webpage,
        string memory image
    ) external returns (MemeCoin) {
        MemeCoin newToken = new MemeCoin(_maxCap, name, symbol);

        newToken.transferOwnership(msg.sender);

        address tokenAddr = address(newToken);

        tokenMetadata[tokenAddr] = TokenMetadata({
            maxCap: _maxCap,
            name: name,
            symbol: symbol,
            description: description,
            xProfile: xProfile,
            telegram: telegram,
            youtubeLink: youtubeLink,
            instagram: instagram,
            tiktok: tiktok,
            webpage: webpage,
            image: image
        });

        return newToken;
    }

    function getTokenMetadata(address token) external view returns (TokenMetadata memory) {
        return tokenMetadata[token];
    }
}
