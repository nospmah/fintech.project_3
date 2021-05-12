# BlockFitter: Where proof of work is measured in sweat!

### Team Members 
* Brian Hampson

<br>

- - -

<br>

## Project Description

<br>

What happens when you take "proof of work" literally? What if we incentivize group fitness through block-chain technology?

This project aims to build a competitive architecture around group fitness using blockchain technology. Participants compete for glory on daily leaderboards while mining fungible FIT tokens through daily hard work and sweat!

A proof-of-concept dApp will be developed to expore and test this idea.

<br>

### Objectives
* Build and deploy ERC20 complient Solidity contracts
* Build and deploy proof-of-concept, web-based dApp that integrates with Solidity contracts
* Users will mine fungible FIT tokens 
* Identify future concepts/ideas to expore further

### Out of Scope
* The focus of this project is not token economics
* Production ready web UI and UX concerns


<br>

- - -

<br>

## Future Vision

<br>

* Various competitive architectures and token models
    * BlockFitter @Home
        * Validate work using machine learning on IOT edge enabled proprietary device
    * BlockFitter Affiliate Gym
        * Validate work using certified affiliate judges
    * BlockFitter Games
* Purchase NFTs with FIT tokens
* Earn NFTs for personal records or top leaderboard scores
* Tokenomics:
    * Percentage of earned FIT tokens distributed to affiliate gym and/or Blockfitter association
    * Build in FIT token deflationary mechanism
* NFT auction platform
* FIT tokens traded on exchange?

<br>

- - -

<br>

## Data Sources

<br>

* Ethereum Improvement Proposal Registry
    * https://eips.ethereum.org/
* Data storage on IPFS

<br>

- - -

<br>

## Files

<br>

### Presentation
https://docs.google.com/presentation/d/1-Bp7ZK-5B1wa9uL_KcA4kW1GTP-6BBdpccdlU9ubyuo/edit?usp=sharing

<br>

### Solidity Contracts
* [FitToken.sol](./sol/FitToken.sol)
* [BlockFitterRegistry_v2.sol](./sol/BlockFitterRegistry_v2.sol)
* [BlockFitterDeployer_v2.sol](./sol/BlockFitterDeployer_v2.sol)

<br>

### dApp
* https://www.blockfitter.com/
* [Static site web root](./public/)
* [dApp Javascript](./public/js/dapp.js)
* [dApp HTML](./public/index.html)
<br>

- - -

<br>

## Deployment Instructions

<br>

1) Compile BlockFitterDeployer_v2.sol

2) Deploy contract to local blockchain (using Ganache) or testnet (Ropsten)

3) Record address used for deployment - this is the default RegistryAdmin account

4) Get ABI for BlockFitterRegistry_v2.sol and deploy to dApp (/public/assets/BlockFitterRegistry.json)

5) Get address for BlockFitterRegistry_v2 and update contract address in /public/js/dapp.js (registry address available through property of deployer contract)

6) Push dApp changes to main branch (this will trigger production build and automated deployment)

<br>

- - -


<br>

## dApp Usage

<br>

<strong>Use case:</strong> user visits site to mine daily WOD (assumes user has been registered by registry admin)

1) Visit https://blockfitter.com

2) Click 'Members' tab to show daily WOD 

3) Click 'Submit daily WOD' (this will show QR code for affiliate judge to scan) 

<br>

<strong>Use case:</strong> registry admin registeres affiliate gym

1) Visit https://blockfitter.com (ensure MetaMask account selected and has registry admin priviledges)

2) Click 'Affiliate Gyms' tab  

3) Enter affiliate gym details including name, description, payable address, and affiliate judge address

4) Click 'Register'

<br>

<strong>Use case:</strong> affiliate judge validates daily WOD for user

1) Visit https://blockfitter.com (ensure MetaMask account selected and has affiliate judge priviledges)

2) Click 'Affiliate Judges' tab  

3) Enter affiliate gym address and user address

4) Click 'Mine daily WOD'

<br>

- - -


<br>

## Initial Task Breakdown

<br>

* Brainstorm use-case scenarios 
* Data brainstorming
    * Identify entities
    * Identify relationships
    * Define contract interfaces
* Review class defi course material
    * Identify relevant ERC standards
    * Investigate new standards
* Class diagram
* Define use case scenarios
* Sequence diagrams
* Draft ERC standards
* Build Solidity contracts
* Build web-based dApp and inategrate with Solidity contracts
* Git repo
* Configure Netlify web hosting and automated build pipeline
* Test existing dApp on Netlify
* Register blockfitter.com domain
* Map AWS CNAME records for Netlify hosting
* Presentation prep