pragma solidity ^0.5.0;

import "./FitToken.sol";
import "./BlockFitterRegistry_v2.sol";

contract BlockFitterDeployer_v2 {

    address public registry_address;
    address public token_address;

    constructor(string memory name, string memory symbol) public
    {
        // create the ArcadeToken and keep its address handy
        FitToken token = new FitToken(name, symbol, 0);
        token_address = address(token);

        // create the ArcadeTokenSale and tell it about the token
        BlockFitterRegistry_v2 registry = new BlockFitterRegistry_v2(token, msg.sender);
        registry_address = address(registry);
        
        // Only registry can mint FIT tokens
        token.addMinter(registry_address);
        token.renounceMinter();
    }
}