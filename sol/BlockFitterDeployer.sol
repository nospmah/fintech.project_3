pragma solidity ^0.5.0;

import "./FIT_token.sol";

contract BlockFitterDeployer {

    address public registry_address;
    address public token_address;

    constructor(string memory name, string memory symbol) public
    {
        // create the ArcadeToken and keep its address handy
        FitToken token = new FitToken(name, symbol, 0);
        token_address = address(token);

        // create the ArcadeTokenSale and tell it about the token
        BlockFitterRegistry registry = new BlockFitterRegistry(token);
        registry_address = address(registry);
        
        // Only registry can mint FIT tokens
        token.addMinter(registry_address);
        token.renounceMinter();
    }
}