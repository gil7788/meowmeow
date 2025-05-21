// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/MemeQueue.sol";
import "../contracts/MemeCoin.sol";

contract MemeQueueTest is Test {
    MemeQueue public memeQueue;
    uint256 constant CAPACITY = 3;

    MemeCoin public meme1;
    MemeCoin public meme2;
    MemeCoin public meme3;
    MemeCoin public meme4;

    function setUp() public {
        memeQueue = new MemeQueue(CAPACITY);

        meme1 = new MemeCoin(10 ether, "Meme1", "M1");
        meme2 = new MemeCoin(10 ether, "Meme2", "M2");
        meme3 = new MemeCoin(10 ether, "Meme3", "M3");
        meme4 = new MemeCoin(10 ether, "Meme4", "M4");
    }

    function testAddValidMeme() public {
        memeQueue.addMeme(meme1);
        assertEq(memeQueue.length(), 1);
        assertTrue(memeQueue.contains(meme1));
    }

    function testCapacityTrim() public {
        memeQueue.addMeme(meme1);
        memeQueue.addMeme(meme2);
        memeQueue.addMeme(meme3);
        memeQueue.addMeme(meme4); // should remove meme1

        assertEq(memeQueue.length(), CAPACITY);
        assertFalse(memeQueue.contains(meme1));
        assertTrue(memeQueue.contains(meme4));
    }

    function testRejectInvalidMeme() public {
        address notAMeme = address(0xBEEF);
        vm.expectRevert();
        memeQueue.addMeme(MemeCoin(notAMeme));
    }
}
