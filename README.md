# BlockFitter: Where proof of work is measured in sweat!

### Team Members 
* Brian Hampson

<br>

- - -

<br>

## Project Description

<br>

What happens when you take "proof of work" literally? What if we incentivize group fitness through block-chain technology?

This project aims to build a competitive architecture on the block-chain around physical activity, incentivizing participants to compete for glory on daily leaderboards while mining fungible FIT tokens for their effort.

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
* [Static site web root](./public/)
* [dApp Javascript](./public/js/dapp.js)
* [dApp HTML](./public/index.html)
<br>

- - -

<br>

## Task Breakdown

<br>

* x - Brainstorm use-case scenarios 
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
* x - Git repo
* x - Configure Netlify web hosting and automated build pipeline
* x - Test existing dApp on Netlify
* x - Register blockfitter.com domain
* Map AWS CNAME records for Netlify hosting
* Presentation prep