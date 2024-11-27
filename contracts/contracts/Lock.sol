// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract Lock {
    uint public unlockTime;
    address payable public owner;

    event Withdrawal(uint amount, uint when);
    event Deposit(address indexed from, uint amount, uint when);
    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw(uint256 amount) public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");
        require(amount <= address(this).balance, "Insufficient contract balance");
        
        emit Withdrawal(amount, block.timestamp);

        owner.transfer(amount);  // Transfer the specified amount
    }

    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");

        emit Deposit(msg.sender,msg.value, block.timestamp);
    }
}
