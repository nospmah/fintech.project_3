pragma solidity ^0.5.0;

import "./FIT_token.sol";

contract BlockFitterRegistry {
    
    using Counters for Counters.Counter;

    // Address of BlockFitter registry 
    address payable registry_address = msg.sender;
    
    // Store reference to FIT token
    FitToken token;
    
    // FITToken IDs
    Counters.Counter token_ids;

    // Affiliate gym IDs
    Counters.Counter affiliateGymIds;
    
    // Member IDs
    Counters.Counter affiliateMinerIds;
    
    // Member IDs
    Counters.Counter memberIds;

    // List of affiliate gyms 
    mapping(uint => AffiliateGym) public affiliateGyms;
    // mapping(uint => AffiliateGym) public affiliateGyms;
    
    // List of affiliate miners
    mapping(uint => AffiliateMiner) public affiliateMiners;
    
    // List of members
    mapping(uint => BlockFitter) public members;
    
    // *** Question - should we expose this?
    // Reference to FIT token
    address public token_address;
    
    // list of hw devices
    
    // list of at home users

    // dailyWOD
    
    constructor(FitToken _token) public {
        token = _token;
        token_address = address(_token);
    }
    
    function registerAffiliateGym(string memory _name, address payable _gym_address, string memory _reference_uri) public returns(uint) {
        affiliateGymIds.increment();
        uint id = affiliateGymIds.current();
        affiliateGyms[id] = new AffiliateGym(_name, _gym_address, _reference_uri);
        return id;
    }

    function unregisterAffiliateGym(uint id) public {
        affiliateGyms[id].deactivate();
    }
    
    function getAffiliateGymCount() public view returns(uint) {
       uint count = affiliateGymIds.current();
       return count;
    }
    
    function getAffiliateUri(uint id) public view returns(string memory) {
        
        // Only return active gyms
        AffiliateGym gym = affiliateGyms[id];
        if (!gym.is_active()) return "";
        return gym.reference_uri();
    }
    
    function registerUser(address payable _address, string memory _username) public returns(uint) {
        //return affiliateGyms[_affiliate_gym_id].registerUser(_address, _username);
        
        memberIds.increment();
        uint id = memberIds.current();
        members[id] = new BlockFitter(_address, _username);
        return id;
    }
    
    function registerUser(address payable _address, string memory _username, uint _affiliate_gym_id) public returns(uint) {
        //return affiliateGyms[_affiliate_gym_id].registerUser(_address, _username);
        
        memberIds.increment();
        uint id = memberIds.current();
        
        BlockFitter blockFitter = new BlockFitter(_address, _username);
        blockFitter.setAffiliateGymeId(_affiliate_gym_id);
        
        members[id] = blockFitter;
        return id;
    }
    
    function unregisterUser(uint _userId) public {
        //affiliateGyms[_affiliate_gym_id].unregisterUser(_userId);
        members[_userId].deactivate();
    }
    
    function registerAffiliateMiner(address payable _address, string memory _username, uint _affiliate_gym_id) public returns(uint) {
        //return affiliateGyms[_affiliate_gym_id].registerUser(_address, _username);
        
        affiliateMinerIds.increment();
        uint id = affiliateMinerIds.current();
        
        AffiliateMiner affiliateMiner = new AffiliateMiner(_address, _username, _affiliate_gym_id);

        affiliateMiners[id] = affiliateMiner;
        return id;
    }
    
    
    function mineDailyWOD(uint _affiliate_gym_id, uint _userId) public returns(bool) {
        
        AffiliateGym gym = affiliateGyms[_affiliate_gym_id];
        address gym_address = gym.getPayableAddress();
        token.mint(gym_address, 1000000000000000000);
        
        BlockFitter user = members[_userId];
        address user_address = user.getPayableAddress();
        token.mint(user_address, 9000000000000000000);
    }
    
    function test() public view returns(address) {
        return msg.sender;
    }

    
}

contract AffiliateGym {
    
    using Counters for Counters.Counter;
    
    bool public is_active = false;
    
    address payable gym_payable_address;
    
    string public name;
    
    string public reference_uri;
    
    //Counters.Counter memberIds;
    
    // list of users
    //mapping(address => BlockFitter) public members;
    //mapping(uint => BlockFitter) public members;
    
    // list of affiliate managers
    
    // list of affiliate judges
    

    constructor(string memory _name, address payable _gym_payable_address, string memory _reference_uri) public {
        
        name = _name;
        gym_payable_address = _gym_payable_address;
        reference_uri = _reference_uri;
        
        // Activate
        is_active = true;
    }
    
    function getPayableAddress() public view returns(address) {
        return gym_payable_address;
    }
    
    // onlyOwner or registry
    function deactivate() public {
        is_active = false;
    }
    

    // function registerUser(address payable _address, string memory _username) public returns(uint) {
        
    //     memberIds.increment();
    //     uint id = memberIds.current();
    //     members[id] = new BlockFitter(_address, _username);
    //     return id;
    // }
    
    // function unregisterUser(uint id) public {
    //     members[id].deactivate();
    // }
    
    // function registerUser(address payable _address, string memory _username) public returns(address) {
        
    //     BlockFitter user = new BlockFitter(_address, _username);
    //     address user_address = address(user);
    //     members[user_address] = user;
    //     return user_address;
    // }
    
    
    
    // function unregisterUser(address _address) public {
    //     members[_address].deactivate();
    // }
    
    // function external payable {}
    
    // registerUser
    
    // publishDailyWOD (must be judge)
    
    // mineDailyWOD(userAddress, judgeAddress) onlyJudge modifier
    
    // minePR(userAddress, judgeAddress)
    
    // registerJudge
    // unregisterJudge
    
    // registerManager
    // unregisterManager
}

contract BlockFitter {
    
    bool public is_active = false;
    
    address payable user_address;
    
    string public user_name;
    
    uint public affiliate_gym_id;
    
    function getPayableAddress() public view returns(address) {
        return user_address;
    }
    // list of registered devices
    
    // total token_ids
    
    // list of NFTs
    
    constructor(address payable _address, string memory _username) public {
        user_address = _address;
        user_name = _username;
        is_active = true;
    }
    
    // constructor(address payable _address, string memory _username, uint _affiliate_gym_id) public {
    //     user_address = _address;
    //     user_name = _username;
    //     affiliate_gym_id = _affiliate_gym_id;
    //     is_active = true;
    // }
    
    // methods
    
    function deactivate() public {
        is_active = false;
    }
    
    function setAffiliateGymeId(uint _affiliate_gym_id) public {
        affiliate_gym_id = _affiliate_gym_id;
    }
    
    // registerDevice
    // unregisterDevice
    
    // function external payable {}
}

contract AffiliateMiner is BlockFitter {
    
    uint public affiliate_gym_id;
    constructor(address payable _address, string memory _username, uint _affiliate_gym_id)
        BlockFitter(_address, _username)
        public 
    {
        user_address = _address;
        user_name = _username;
        affiliate_gym_id = _affiliate_gym_id;
        is_active = true;
    }
}

