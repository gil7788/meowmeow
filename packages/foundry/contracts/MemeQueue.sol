// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./MemeCoin.sol";

contract MemeQueue {
    MemeCoin[] public queue;
    uint256 public capacity;

    constructor(uint256 _capacity) {
        require(_capacity > 0, "Capacity must be greater than zero");
        capacity = _capacity;
    }

    function addMeme(MemeCoin meme) external {
        require(_isValidMeme(address(meme)), "Not a valid MemeCoin");

        queue.push(meme);
        if (queue.length > capacity) {
            _removeOldestMeme();
        }
    }

    function _removeOldestMeme() internal {
        for (uint256 i = 1; i < queue.length; i++) {
            queue[i - 1] = queue[i];
        }
        queue.pop();
    }

    // [TODO] Figure out a better way to test for MemeCoin objects
    function _isValidMeme(address memeAddr) internal view returns (bool) {
        if (memeAddr.code.length == 0) return false;

        try MemeCoin(memeAddr).maxCap() returns (uint256) {
            return true;
        } catch {
            return false;
        }
    }

    function getAllMemes() external view returns (MemeCoin[] memory) {
        return queue;
    }

    function contains(MemeCoin meme) public view returns (bool) {
        for (uint256 i = 0; i < queue.length; i++) {
            if (address(meme) == address(queue[i])) {
                return true;
            }
        }
        return false;
    }

    function length() external view returns (uint256) {
        return queue.length;
    }
}
