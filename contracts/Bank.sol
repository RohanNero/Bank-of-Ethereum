//SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

error no_value_sent();
error Insufficent_funds(uint256 balance, uint256 requested);


contract Bank {

    address[] public accounts;

    mapping(address => uint256) private balances;

    event depositInfo(address, uint256);
    event depositBalances(uint256, uint256 );
    event withdrawInfo(address, uint256);
    event withdrawBalances(uint256, uint256);

    receive() external payable{
        deposit();
    }
    
    function deposit() public payable  {
        uint256 oldBal = balances[msg.sender];
        // if (msg.value <= 0){
        //     revert no_value_sent();
        // }
        require(msg.value > 0, "No Value Sent!");
        balances[msg.sender] += msg.value;
        accounts.push(msg.sender);
        emit depositInfo(msg.sender, msg.value);
        emit depositBalances(oldBal, balances[msg.sender]);
        
    }

    function withdraw(uint256 _amount) public payable  {
        uint256 oldBal = balances[msg.sender];
        // if(balances[msg.sender] < _amount) {
        //     revert Insufficent_funds({balance: oldBal, requested: _amount});
        // }
        require(
            balances[msg.sender] >= _amount,
            "Insufficent Funds!"
        );
        balances[msg.sender] -= _amount;
        (bool sent, ) = msg.sender.call{value: _amount}("");
        require(sent, "Withdrawal Failed!");
        emit withdrawInfo(msg.sender, _amount);
        emit withdrawBalances(oldBal, balances[msg.sender]);
    }

    function getBalance() public view returns(uint256) {
        return(balances[msg.sender]);
    }
}