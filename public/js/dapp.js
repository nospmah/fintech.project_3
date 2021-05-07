const contractAddress = "0x1918b645ECC3aa5aE40a80994063Ef5F5B32e04F";
const qrcode = new QRCode("qrcode");

const dApp = {

  ethEnabled: function() {
    // If the browser has an Ethereum provider (MetaMask) installed

    console.log(`DEBUG: window.ethereum: ${window.ethereum}, qrcode: ${QRCode}`);

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

    this.affiliateGymCount = await this.blockFitterContract.methods.getAffiliateGymCount().call();
    this.affiliateGyms = [];

    console.log(`DEBUG: dapp.initData - gym count: ${this.affiliateGymCount}`);

    for (let i = 1; i <= this.affiliateGymCount; i++) {
      try {
        
        // Get IPFS uri
        const affiliate_gym_uri = await this.blockFitterContract.methods.getAffiliateUri(i).call();
        
        // If gym has been deactivated, uri will be empty
        if (affiliate_gym_uri === '') continue;

        // let { name, description } = null;
        let name = "";
        let description = "";

        if (affiliate_gym_uri.startsWith('ipfs')) {
          const affiliate_gym_json = await fetchMetadata(affiliate_gym_uri);
          name = affiliate_gym_json['name'];
          description = affiliate_gym_json['description'];
        }         

        console.log(`DEBUG: dapp.initData - gymId: ${i}, uri: ${affiliate_gym_uri}`);
        //console.log(`DEBUG: dapp.initData - gymId: ${i} ', affiliate_gym_uri)
        //const affiliate_gym_json = await fetchMetadata(affiliate_gym_uri);
        //console.log('affiliate_gym_json: ', token_json)

        this.affiliateGyms.push({
          id: i,
          name: name,
          description: description,
          uri: affiliate_gym_uri
        });

      } catch (e) {
        console.log(`DEBUG: dapp.initData - error: ${JSON.stringify(e)}`);
      }
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
            <p class="card-text">Id: ${gym.id}</p>
            <p class="card-text">${gym.description}</p>
            <p class="card-link"><a href="${uri}" target="_blank">Details</a></p>
            <p><a href="#" class="btn btn-primary" data-id="${gym.id}" onclick="dApp.deactivateAffiliateGym(${gym.id})">Deactivate</a></p>
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
      
      // TODO - remove
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

      await this.blockFitterContract.methods.registerAffiliateGym(name, payable_address, reference_uri).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
        
        $("#reg-aff-name").val("");
        $("#reg-aff-description").val("");
        $("#reg-aff-payable-address").val("");
        $("#reg-aff-judge-address").val("");
        $("#reg-aff-pinata-api-key").val("");
        $("#reg-aff-pinata-api-secret").val("");

        await this.render();
      });

    } catch (e) {
      console.log(`DEBUG: dapp.registerAffiliateGym - error: ${JSON.stringify(e)}`);
    }
  },

  deactivateAffiliateGym: async function(id) {

    console.log(`DEBUG: dapp.deactivateAffiliateGym - ${id}`);

    try {

      await this.blockFitterContract.methods.unregisterAffiliateGym(parseInt(id)).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
        await this.render();
      });

    } catch (e) {
      console.log(`DEBUG: dapp.deactivateAffiliateGym - error: ${JSON.stringify(e)}`);
    }
  },

  generateQrCode: async function() {
    const currentAddress = JSON.stringify(this.accounts[0]);
    console.log(`DEBUG: dapp.generateQrCode - Account address: ${currentAddress}`);
    qrcode.makeCode(currentAddress);
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