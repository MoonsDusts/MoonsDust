// SPDX-License-Identifier: MIT

// Credit: This contract is copied and pasted from https://docs.ethers.io/ethers.js/html/api-contract.html. Some necessary modifications for 0.5.11 have been done.

// Place your solidity files in this contracts folder and run the compile.js file using node compile.js file in project directory to compile your contracts.

pragma solidity ^0.7.0;

contract SimpleStorage {
  string value;

  event ValueChanged(address indexed author, string oldValue, string newValue);

  constructor(string memory _value) {
    setValue(_value);
  }

  function getValue() public view returns (string memory) {
    return value;
  }

  function setValue(string memory _value) public {
    emit ValueChanged(msg.sender, value, _value);
    value = _value;
  }
}
