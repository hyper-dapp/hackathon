# HyperDapp Hackathon

Goals:

- Code REPL
- Publish button
- Permalink to generated dapp
- Publish to IPFS and retrieve CID reference
- Mint NFT to represent distributed versioned workflows

## Technology
- front-end compiled flows are created in the front-end editor and run in the Cortex interpreter engine for front-end UI.
- IPFS is used as a storage source for published workflows. Source code for the publish function is found in front-end/src/lib/IPFS. This project uses nft.storage for IPFS submission
- IPFS CIDs for published flows are then stored on the CortexHub smart contract NFT

## Architecture
Front-end behaviour is compiled through a cortex interpreter engine that generates and renders UI logic based on the rules defined in the code.
![Cortext-interpret-engine](https://github.com/hyper-dapp/hackathon/blob/master/Cortex-Diagram.png)

A registry contract using ERC721 is used to track published workflows that can source workflow logic from IPFS CID references
![Cortext-hub-registry](https://github.com/hyper-dapp/hackathon/blob/master/HyperDapp-Registry.png)

## Front-end Development

```
$ cd front-end
$ cp .env.example .env

# Fill out the fields in .env

$ npm install
$ npm run dev
```

## Contract Development

```
$ cd front-end
$ cp .env.example .env

# Fill out the fields in .env

$ npm install
$ npm run deploy:<network>
```

## Deployed Registry Contracts
Rinkeby: https://rinkeby.etherscan.io/address/0x656D3455E84FD6b685a408e824450f5cBfb4d98d#code
Arbitrum Rinkeby: https://testnet.arbiscan.io/address/0x59fb1449C54942B64432f6a0C16116BDaBB161b7#code
