// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.27;

contract Lock {
    // State Variables
    uint256 private constant PRO_ACCESS_PRICE = 10000000000000000; // 0.01 ETH
    uint public unlockTime;
    address payable public owner;
    
    // Mappings
    mapping(address => uint256) public balances;
    mapping(address => mapping(string => bool)) public proAccess; // This was missing but used in functions
    
    // Events
    event Withdrawal(uint amount, uint when);
    event Deposit(address indexed from, uint amount, uint when);
    event ProAccessPurchased(address indexed user, string symbol); // This was missing but needed
    
    // Constructor
    constructor(uint _unlockTime) payable {
        require(
            block.timestamp < _unlockTime,
            "Unlock time should be in the future"
        );
        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }
    
    // Read Functions (View/Pure)
    function getProAccessPrice() public pure returns (uint256) {
        return PRO_ACCESS_PRICE;
    }
    
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }
    
    function hasProAccess(string memory symbol) public view returns (bool) {
        return proAccess[msg.sender][symbol];
    }
    
    // Write Functions
    function deposit() public payable {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        balances[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value, block.timestamp);
    }
    
    function withdraw(uint256 amount) public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");
        require(amount <= balances[msg.sender], "Insufficient balance");
        
        balances[msg.sender] -= amount;
        emit Withdrawal(amount, block.timestamp);
        owner.transfer(amount);
    }
    
    function purchaseProAccess(string memory symbol) public payable {
        require(msg.value >= PRO_ACCESS_PRICE, "Insufficient payment");
        proAccess[msg.sender][symbol] = true;
        emit ProAccessPurchased(msg.sender, symbol);
    }
}
