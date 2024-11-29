// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Lock {
    uint public unlockTime;
    address payable public owner;
    mapping(address => uint256) public balances;

    event Withdrawal(uint amount, uint when);
    event Deposit(address indexed from, uint amount, uint when);
    
    // constructor requires gas limit, runs once when contract is deployed to blockchain 
    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );

        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    // read functions do not require gas limit
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;  // Built-in way to get contract's ETH balance
    }

    // write functions require gas limit
    function withdraw(uint256 amount) public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");
        require(amount <= balances[msg.sender], "Insufficient balance");
        
        // Update balance before transfer
        balances[msg.sender] -= amount;
        emit Withdrawal(amount, block.timestamp);

        owner.transfer(amount);
    }
    
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        // Add balance tracking
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
}
