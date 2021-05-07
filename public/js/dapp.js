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
    
    // refresh variables
    await this.initData();

    let acctAddress = $("#owner").text(`${JSON.stringify(this.accounts[0]).replace(/["']/g, "")}`);
    
    console.log(`DEBUG: dapp.render - Account address: ${acctAddress}`);

    // Clear affiliate gyms
    $("#affiliate-gym-container").html("");

    this.affiliateGyms.forEach((gym) => {
      $("#affiliate-gym-container").append(
        `
        <div class="card" style="width: 18rem;">
          <img src="../images/box_2.png" class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${gym.name} (${gym.id})</h5>
            <h7 class="card-title">${gym.description}</h7>
            <a href="${gym.uri}" target="_blank" class="card-text">IPFS link</a>
            <a href="#" class="btn btn-primary" data-id="${gym.id}" onclick="dApp.deactivateAffiliateGym(${gym.id})">Deactivate</a>            
          </div>
        </div>
        `);
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
      const pinata_api_key = "a190d395a2bde42df710";
      const pinata_secret_api_key = "3a910879529b43f3b1cfd0162920c7ed0aa5693f9887995d8d81e815c8a93413";

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

    // this.marsJson = await (await fetch("./MartianMarket.json")).json();
    // this.auctionJson = await (await fetch("./MartianAuction.json")).json();

    // this.marsContract = new window.web3.eth.Contract(
    //   this.marsJson,
    //   this.contractAddress,
    //   { defaultAccount: this.accounts[0] }
    // );
    // console.log("Contract object", this.marsContract);

    // this.isAdmin = this.accounts[0] == await this.marsContract.methods.owner().call();

    // await this.updateUI();

      // this.owner == await this.blockFitterContract.methods.owner().call();
      // console.log(`DEBUG: dapp.main - 4 - ${JSON.stringify(this.accounts[0])}`);
      // console.log("Contract object", JSON.stringify(this.blockFitterContract));
      // console.log(`DEBUG: dapp.main - blockFitter contract: ${JSON.stringify(this.blockFitterContract)}`);




  // updateUI: async function() {
  //   console.log("updateUI");
    // // refresh variables
    // await this.collectVars();

    // $("#dapp-tokens").html("");
    // this.tokens.forEach((token) => {
    //   try {
    //     let endAuction = `<a token-id="${token.tokenId}" class="dapp-admin" style="display:none;" href="#" onclick="dApp.endAuction(event)">End Auction</a>`;
    //     let bid = `<a token-id="${token.tokenId}" href="#" onclick="dApp.bid(event);">Bid</a>`;
    //     let owner = `Owner: ${token.owner}`;
    //     let withdraw = `<a token-id="${token.tokenId}" href="#" onclick="dApp.withdraw(event)">Withdraw</a>`
    //     let pendingWithdraw = `Balance: ${token.pendingReturn} wei`;
    //       $("#dapp-tokens").append(
    //         `<div class="col m6">
    //           <div class="card">
    //             <div class="card-image">
    //               <img id="dapp-image" src="https://gateway.pinata.cloud/ipfs/${token.image.replace("ipfs://", "")}">
    //               <span id="dapp-name" class="card-title">${token.name}</span>
    //             </div>
    //             <div class="card-action">
    //               <input type="number" min="${token.highestBid + 1}" name="dapp-wei" value="${token.highestBid + 1}" ${token.auctionEnded ? 'disabled' : ''}>
    //               ${token.auctionEnded ? owner : bid}
    //               ${token.pendingReturn > 0 ? withdraw : ''}
    //               ${token.pendingReturn > 0 ? pendingWithdraw : ''}
    //               ${this.isAdmin && !token.auctionEnded ? endAuction : ''}
    //             </div>
    //           </div>
    //         </div>`
    //       );
    //   } catch (e) {
    //     alert(JSON.stringify(e));
    //   }
    // });

    // // hide or show admin functions based on contract ownership
    // this.setAdmin();
  //},
  // bid: async function(event) {
  //   const tokenId = $(event.target).attr("token-id");
  //   const wei = Number($(event.target).prev().val());
  //   await this.marsContract.methods.bid(tokenId).send({from: this.accounts[0], value: wei}).on("receipt", async (receipt) => {
  //     M.toast({ html: "Transaction Mined! Refreshing UI..." });
  //     await this.updateUI();
  //   });
  // },
  // endAuction: async function(event) {
  //   const tokenId = $(event.target).attr("token-id");
  //   await this.marsContract.methods.endAuction(tokenId).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
  //     M.toast({ html: "Transaction Mined! Refreshing UI..." });
  //     await this.updateUI();
  //   });
  // },
  // withdraw: async function(event) {
  //   const tokenId = $(event.target).attr("token-id") - 1;
  //   await this.tokens[tokenId].auction.methods.withdraw().send({from: this.accounts[0]}).on("receipt", async (receipt) => {
  //     M.toast({ html: "Transaction Mined! Refreshing UI..." });
  //     await this.updateUI();
  //   });
  // },
  // registerLand: async function() {
  //   const name = $("#dapp-register-name").val();
  //   const image = document.querySelector('input[type="file"]');

  //   const pinata_api_key = $("#dapp-pinata-api-key").val();
  //   const pinata_secret_api_key = $("#dapp-pinata-secret-api-key").val();

  //   if (!pinata_api_key || !pinata_secret_api_key || !name || !image) {
  //     M.toast({ html: "Please fill out then entire form!" });
  //     return;
  //   }

  //   const image_data = new FormData();
  //   image_data.append("file", image.files[0]);
  //   image_data.append("pinataOptions", JSON.stringify({cidVersion: 1}));

  //   try {
  //     M.toast({ html: "Uploading Image to IPFS via Pinata..." });
  //     const image_upload_response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
  //       method: "POST",
  //       mode: "cors",
  //       headers: {
  //         pinata_api_key,
  //         pinata_secret_api_key
  //       },
  //       body: image_data,
  //     });

  //     const image_hash = await image_upload_response.json();
  //     const image_uri = `ipfs://${image_hash.IpfsHash}`;

  //     M.toast({ html: `Success. Image located at ${image_uri}.` });
  //     M.toast({ html: "Uploading JSON..." });

  //     const reference_json = JSON.stringify({
  //       pinataContent: { name, image: image_uri },
  //       pinataOptions: {cidVersion: 1}
  //     });

  //     const json_upload_response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
  //       method: "POST",
  //       mode: "cors",
  //       headers: {
  //         "Content-Type": "application/json",
  //         pinata_api_key,
  //         pinata_secret_api_key
  //       },
  //       body: reference_json
  //     });

  //     const reference_hash = await json_upload_response.json();
  //     const reference_uri = `ipfs://${reference_hash.IpfsHash}`;

  //     M.toast({ html: `Success. Reference URI located at ${reference_uri}.` });
  //     M.toast({ html: "Sending to blockchain..." });

  //     await this.marsContract.methods.registerLand(reference_uri).send({from: this.accounts[0]}).on("receipt", async (receipt) => {
  //       M.toast({ html: "Transaction Mined! Refreshing UI..." });
  //       $("#dapp-register-name").val("");
  //       $("#dapp-register-image").val("");
  //       await this.updateUI();
  //     });

  //   } catch (e) {
  //     alert("ERROR:", JSON.stringify(e));
  //   }
  // },

//   try {

//   } catch (e) {
//     console.log(JSON.stringify(e));
//   }