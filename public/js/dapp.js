const contractAddress = "0x621fd0236A17145A140069A91269BFA693894bf3";
const qrcode = new QRCode("qrcode");

const dApp = {

  ethEnabled: function() {

    console.log(`DEBUG: window.ethereum: ${window.ethereum}`);

    // Does browser have an Ethereum provider (MetaMask) installed
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      window.ethereum.enable();
      return true;
    }

    return false;
  },

  initData: async function() {

    const fetchMetadata = (reference_uri) => fetch(`https://gateway.pinata.cloud/ipfs/${reference_uri.replace("ipfs://", "")}`, { mode: "cors" }).then((resp) => resp.json());
    
    this.generateQrCode();

    // List of Affiliate gym addresses
    this.affiliateGymsAddresses = [];

    // List of Gym structs (includes uri)
    this.affiliateGyms = [];

    try {

      // Get list of all gyms
      this.affiliateGymsAddresses = await this.blockFitterContract.methods.getAffiliateGyms().call();

      // Log
      console.log(`DEBUG: dapp.initData - affiliate gym count: ${this.affiliateGymsAddresses.length}`);

      // Make call for each address, need uri
      for (let i = 0; i < this.affiliateGymsAddresses.length; i++) {

        let { name, description } = "";

        // Make call to view function
        const gym = await this.blockFitterContract.methods.affiliate_gyms(this.affiliateGymsAddresses[i]).call();
        
        // Get IPFS uri
        const uri = gym["ipfs_uri"];

        // Get off-chain data
        if (uri.startsWith('ipfs')) {
          const affiliate_gym_json = await fetchMetadata(uri);
          name = affiliate_gym_json['name'];
          description = affiliate_gym_json['description'];
        }   
        
        // Update UI binding collection
        this.affiliateGyms.push({
          name: name,
          description: description,
          uri: uri,
          address: String(this.affiliateGymsAddresses[i])
        });
      }

      // Get daily WOD
      this.dailyWodUri = await this.blockFitterContract.methods.getDailyWOD().call();

    } catch (e) {
      console.log(`DEBUG: dapp.registerAffiliateGym - error: ${JSON.stringify(e)}`);
    } 
  },  

  render: async function() {    
    
    console.log(`DEBUG: dapp.render`);

    // Init data
    await this.initData();

    // Get account address display string
    const owner_address = JSON.stringify(this.accounts[0]).replace(/["']/g, "");
    $("#owner").text(`${owner_address}`);
    $("#qr-code-modal-title").text(`${owner_address}`);    

    // Update daily wod uri
    let wod_uri = `https://ipfs.io/ipfs/${this.dailyWodUri.replace("ipfs://","")}`;
    $("#wod-details").attr("href", `${wod_uri}`);

    // Clear affiliate gyms
    $("#affiliate-gym-container").html("");

    // Render cards for each affiliate gym
    this.affiliateGyms.forEach((gym) => {      
      
      const hash = gym.uri.replace("ipfs://","");
      const uri = `https://ipfs.io/ipfs/${hash}`;
      
      $("#affiliate-gym-container").append(
        `
        <div class="card w-25">
          <img src="../images/box_2.png" class="card-img-top" alt="...">
          <div class="card-body">
            <h3 class="card-title">${gym.name}</h3>
            <p class="card-text">${gym.description}</p>
            <p class="card-text">${gym.address}</p>
            <p class="card-link"><a href="${uri}" target="_blank">Details</a></p>
            <p><a href="#" class="btn btn-primary" onclick="dApp.deactivateAffiliateGym('${gym.address}')">Deactivate</a></p>
          </div>
        </div>
        `
      );
    });
  },

  registerAffiliateGym: async function() {

    console.log(`DEBUG: registerAffiliateGym`);

    try {

      const name = $("#reg-aff-name").val();
      const description = $("#reg-aff-description").val();
      const payable_address = $("#reg-aff-payable-address").val();
      const judge_address = $("#reg-aff-judge-address").val();
      // const pinata_api_key = $("#reg-aff-pinata-api-key").val();
      // const pinata_secret_api_key = $("#reg-aff-pinata-api-secret").val();      
     
      // TODO - refactor to Netlify env vars
      const pinata_api_key = "a190d395a2bde42df710";
      const pinata_secret_api_key = "3a910879529b43f3b1cfd0162920c7ed0aa5693f9887995d8d81e815c8a93413";

      // Required data
      if (!name || !payable_address) {
        alert('Missing data!');
        return;
      }

      const reference_json = JSON.stringify({
        "pinataMetadata": { name: name },
        "pinataContent": { 
          name: name,
          description: description,
          image: '../images/box_2.png'
        },
        "pinataOptions": { cidVersion: 1}
      });

      const json_upload_response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          pinata_api_key,
          pinata_secret_api_key
        },
        body: reference_json
      });

      const reference_hash = await json_upload_response.json();
      const reference_uri = `ipfs://${reference_hash.IpfsHash}`;

      // There are two overloads of registerAffiliateGym based on optional param (affiliate judge address)
      if (judge_address) {
        await this.blockFitterContract.methods.registerAffiliateGym(payable_address, judge_address, reference_uri).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
        
          $("#reg-aff-name").val("");
          $("#reg-aff-description").val("");
          $("#reg-aff-payable-address").val("");
          $("#reg-aff-judge-address").val("");
          // $("#reg-aff-pinata-api-key").val("");
          // $("#reg-aff-pinata-api-secret").val("");
  
          await this.render();
        });
      } else {
        await this.blockFitterContract.methods.registerAffiliateGym(payable_address, reference_uri).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
        
          $("#reg-aff-name").val("");
          $("#reg-aff-description").val("");
          $("#reg-aff-payable-address").val("");
          $("#reg-aff-judge-address").val("");
          // $("#reg-aff-pinata-api-key").val("");
          // $("#reg-aff-pinata-api-secret").val("");
  
          await this.render();
        });
      }
    } catch (e) {
      console.log(`DEBUG: dapp.registerAffiliateGym - error: ${JSON.stringify(e)}`);
    }
  },

  mineDailyWOD: async function() {

    console.log(`DEBUG: registerAffiliateGym`);

    try {

      const user_address = $("#user-address").val();
      const affiliate_address = $("#affiliate-address").val();

      if (!user_address || !affiliate_address) {
        alert('Missing data!');
        return;
      }

      await this.blockFitterContract.methods.mineDailyWOD(user_address, affiliate_address).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
        
        $("#user-address").val("");
        $("#affiliate-address").val("");

        await this.render();
      });

    } catch (e) {

      console.log(JSON.stringify(e));
      alert("You must be an affiliate judge to mine daily WODS!")
      $("#user-address").val("");
      $("#affiliate-address").val("");
      await this.render();
    }
  },

  deactivateAffiliateGym: async function(address) {

    console.log(`DEBUG: dapp.deactivateAffiliateGym - ${address}`);

    try {

      await this.blockFitterContract.methods.unregisterAffiliateGym(address).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
        await this.render();
      });

    } catch (e) {
      console.log(`DEBUG: dapp.deactivateAffiliateGym - error: ${JSON.stringify(e)}`);
    }
  },

  generateQrCode: async function(address) {
    
    let addr = address;
    if (!addr) addr = JSON.stringify(this.accounts[0]);

    console.log(`DEBUG: dapp.generateQrCode - Address: ${addr}`);
    
    qrcode.makeCode(addr);
  },

  setAdmin: async function() {
    // if account selected in MetaMask is the same as owner then admin will show
    // if (this.isAdmin) {
    //   $(".dapp-admin").show();
    // } else {
    //   $(".dapp-admin").hide();
    // }
  },

  main: async function() {

    // Initialize web3
    if (!this.ethEnabled()) {
      alert("Please install MetaMask to use this dApp!");
    }

    try {

      this.accounts = await window.web3.eth.getAccounts();
      this.contractAddress = contractAddress; 

      this.blockFitterRegistryJson = await (await fetch("../assets/BlockFitterRegistry.json")).json();

      this.blockFitterContract = new window.web3.eth.Contract(
        this.blockFitterRegistryJson,
        this.contractAddress,
        { defaultAccount: this.accounts[0] }
      );

      console.log(`DEBUG: dapp.main - contract: ${this.blockFitterContract}`);

      await this.render();

    } catch (e) {
      console.log(JSON.stringify(e));
    }
  }
};

dApp.main();



  // initData: async function() {

  //   const fetchMetadata = (reference_uri) => fetch(`https://gateway.pinata.cloud/ipfs/${reference_uri.replace("ipfs://", "")}`, { mode: "cors" }).then((resp) => resp.json());
    
  //   this.generateQrCode();

  //   this.affiliateGymCount = await this.blockFitterContract.methods.getAffiliateGymCount().call();
  //   this.affiliateGyms = [];

  //   console.log(`DEBUG: dapp.initData - gym count: ${this.affiliateGymCount}`);

  //   for (let i = 1; i <= this.affiliateGymCount; i++) {
  //     try {
        
  //       // Get IPFS uri
  //       const affiliate_gym_uri = await this.blockFitterContract.methods.getAffiliateUri(i).call();
        
  //       // If gym has been deactivated, uri will be empty
  //       if (affiliate_gym_uri === '') continue;

  //       // let { name, description } = null;
  //       let name = "";
  //       let description = "";

  //       if (affiliate_gym_uri.startsWith('ipfs')) {
  //         const affiliate_gym_json = await fetchMetadata(affiliate_gym_uri);
  //         name = affiliate_gym_json['name'];
  //         description = affiliate_gym_json['description'];
  //       }         

  //       console.log(`DEBUG: dapp.initData - gymId: ${i}, uri: ${affiliate_gym_uri}`);
  //       //console.log(`DEBUG: dapp.initData - gymId: ${i} ', affiliate_gym_uri)
  //       //const affiliate_gym_json = await fetchMetadata(affiliate_gym_uri);
  //       //console.log('affiliate_gym_json: ', token_json)

  //       this.affiliateGyms.push({
  //         id: i,
  //         name: name,
  //         description: description,
  //         uri: affiliate_gym_uri
  //       });

  //     } catch (e) {
  //       console.log(`DEBUG: dapp.initData - error: ${JSON.stringify(e)}`);
  //     }
  //   }
  // },
