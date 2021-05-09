pragma solidity ^0.5.0;

import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v2.5.0/contracts/drafts/Counters.sol";
import "./FitToken.sol";

contract BlockFitterRegistry_v2 {
    
    using Counters for Counters.Counter;
    
    // Constants
    uint constant DAILY_WOD_USER_AMT = 9000000000000000000;
    uint constant DAILY_WOD_AFFILIATE_AMT = 1000000000000000000;

    // Address of BlockFitter registry 
    address registry_admin;
    
    // Store reference to FIT token
    FitToken token;
    
    // Reference to FIT token
    address token_address;
    
    // Account mappings
    mapping (address => Account) public affiliate_gyms;
    mapping (address => Account) public affiliate_judges;
    mapping (address => Account) public users;

    // Arrays - need iterable
    address[] affiliate_gym_list;
    address[] user_list;
    
    // Daily WOD mapping and counter
    Counters.Counter daily_wod_counter;
    mapping(uint => string) daily_wods;
    
    // Only registry admin can register affiliate gyms and/or users
    modifier onlyRegistryAdmin() {
        require(registry_admin == msg.sender, "You are not authorized to modify BlockFitter registry!");
        _;
    }
    
    // Only judges can mine daily wod
    modifier onlyJudge() {
        require(affiliate_judges[msg.sender].is_active, "You are not authorized to mine tokens!");
        _;
    }
    
    constructor(FitToken _token, address _registry_admin) public {
        token = _token;
        token_address = address(_token);
        registry_admin = _registry_admin;
    }
    
    // constructor() public { }
    
    function registerAffiliateGym(address payable _address, string memory _ipfs_uri) onlyRegistryAdmin public {
        
        // Init new struct
        Account memory gym = Account(_address, _ipfs_uri, true);
        
        // Add mapping
        affiliate_gyms[_address] = gym;
        
        // Push on array (need iterable)
        affiliate_gym_list.push(_address);
    }
    
    function registerAffiliateGym(address payable _address, address payable _judge_address, string memory _ipfs_uri) onlyRegistryAdmin public {
        
        // Init new struct
        Account memory gym = Account(_address, _ipfs_uri, true);
        
        // Add mapping
        affiliate_gyms[_address] = gym;
        
        // Push on array (need iterable)
        affiliate_gym_list.push(_address);
        
        // Create account for affiliate judge
        Account memory judge = Account(_judge_address, 'na', true);
        
        // Add mapping
        affiliate_judges[_judge_address] = judge;
    }

    function unregisterAffiliateGym(address payable _address) onlyRegistryAdmin public {
        
        // NOTE - Arrays quite limited, only have push, pop, and length
        
        // Get index from address
        uint index = GetIndexForAffiliateAddress(_address);
        
        // Delete item at address - this will create hole
        delete affiliate_gym_list[index];
        
        // Move last item in array to hole
        affiliate_gym_list[index] = affiliate_gym_list[affiliate_gym_list.length - 1];
        
        // Pop last item
        affiliate_gym_list.pop();
        
        // Because we can't remove mapping, we want to set inactive flag
        affiliate_gyms[_address].is_active = false;
    }
    
    function getAffiliateGyms() public view returns(address[] memory) {
        return affiliate_gym_list;
    }
    
    function GetIndexForAffiliateAddress(address payable _address) private view returns(uint) {
        
        // NOTE - O(n) - we can do better
        for (uint i = 0; i < affiliate_gym_list.length; i++) {
            if (affiliate_gym_list[i] == _address) {
                return i;
            }
        }
        
        // TODO - this is a problem
        return 0;
    }
    
    function registerUser(address payable _address, string memory _ipfs_uri) onlyRegistryAdmin public {
        
        // Init new struct
        Account memory user = Account(_address, _ipfs_uri, true);
        
        // Add mapping
        users[_address] = user;
        
        // Push on array (need iterable)
        user_list.push(_address);
    }
    
    function unregisterUser(address payable _address) onlyRegistryAdmin public {
        
        // NOTE - Arrays quite limited, only have push, pop, and length
        
        // Get index from address
        uint index = GetIndexForUserAddress(_address);
        
        // Delete item at address - this will create hole
        delete user_list[index];
        
        // Move last item in array to hole
        user_list[index] = user_list[user_list.length - 1];
        
        // Pop last item
        user_list.pop();
        
        // Because we can't remove mapping, we want to set inactive flag
        users[_address].is_active = false;
    }
    
    function GetIndexForUserAddress(address payable _address) private view returns(uint) {
        
        // NOTE - O(n) - we can do better
        for (uint i = 0; i < user_list.length; i++) {
            if (user_list[i] == _address) {
                return i;
            }
        }
        
        // TODO - this is a problem
        return 0;
    }
    
    function publishDailyWOD(string memory _ipfs_uri) onlyRegistryAdmin public {
        daily_wod_counter.increment();
        uint id = daily_wod_counter.current();
        daily_wods[id] = _ipfs_uri;
    }
    
    function getDailyWOD() public view returns(string memory) {
        return daily_wods[daily_wod_counter.current()];
    }
    
    function mineDailyWOD(address payable _user_address, address payable _affiliate_gym_address) onlyJudge public {
        if (users[_user_address].is_active &&  affiliate_gyms[_affiliate_gym_address].is_active) {
            token.mint(_user_address, DAILY_WOD_USER_AMT);
            token.mint(_affiliate_gym_address, DAILY_WOD_AFFILIATE_AMT);
         }
    }
    
    struct Account {
        address payable payable_address;
        string ipfs_uri;
        bool is_active;
    }
}