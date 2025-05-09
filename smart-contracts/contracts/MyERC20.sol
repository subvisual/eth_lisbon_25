// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyERC20 is ERC20Burnable, Ownable {
    uint8 private _customDecimals;

    constructor(
        string memory name_,
        string memory symbol_,
        uint256 initialSupply_,
        uint8 decimals_
    )
        ERC20(name_, symbol_)
        Ownable(msg.sender)           
    {
        _customDecimals = decimals_;
        _mint(msg.sender, initialSupply_ * 10 ** decimals_);
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}
