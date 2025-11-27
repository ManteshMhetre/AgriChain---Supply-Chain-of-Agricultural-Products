<h1 align="center">
  <br>
  <a><img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/logo.png" width="200"></a>
  <br>  
  Supply-Chain-Dapp
  <br>
</h1>

<p align="center">
  
  <a href="https://github.com/trufflesuite/ganache-cli">
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/ganachetrans.png" width="90">
  </a>
  <a href="https://soliditylang.org/">
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/Solidity.svg" width="80">       
  </a>
  <a href="https://reactjs.org/"><img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/react.png" width="80"></a>
  
  <a href="https://www.trufflesuite.com/">
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/trufflenew.png" width="50">
  </a>
   &nbsp;&nbsp;&nbsp;
  <a href="https://www.npmjs.com/package/web3">
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/web3.jpg" width="60">
  </a>
  
  <a href="https://material-ui.com/">
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/mat.png" width="60">       
  </a>
  &nbsp;&nbsp;&nbsp;
  <a href="https://expressjs.com/"><img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/express.svg" width="50"></a>
  
  &nbsp;&nbsp;
  <a href="https://www.nginx.com/">
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/nginx.png" width="80">
  </a>
</p>

<h4 align="center">A simple Supply Chain setup with <a href="https://docs.soliditylang.org/en/v0.8.4/" target="_blank">Solidity</a>.</h4>

<p align="center">
  <a href="https://ieeexplore.ieee.org/document/10841727">
    <img src="https://img.shields.io/badge/IEEE-Research%20Paper-00629B.svg?style=for-the-badge&logo=ieee&logoColor=white" alt="IEEE Research Paper">
  </a>
</p>

<p align="center">
  <a href="#description">Description</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#flow">Flow</a> •
  <a href="#working">Working</a> •
  <a href="#database-archival-system">Database Archival</a> •
  <a href="#contract-diagrams">Contract Diagrams</a> •
  <a href="#research-paper">Research Paper</a> •
  <a href="#installation-and-setup">Installation and Setup</a> •
  <a href="#license">License</a>
</p>

## Description

Supply chain is always hard to manage and requires a lot of admistrative machinery. However, when managed with smart contracts using blockchain, a lot of the paperwork is reduced.
Also it leads to an increase in the transparency and helps to build an efficient Root of Trust. Supply-chain-dapp is such an implementation of a supply chain management system which uses blockchain to ensure a transparent and secure transfer of product from the manufacturer to the customer via the online e-commerce websites.

## Architecture

The smart contract is being written with Solidity which is then compiled, migrated and deployed using Truffle.js on the local blockchain network created using Ganache-cli.The frontend uses Web3.js to communicate with the smart contract and local blockchain network and is written using React.js framework for better component and state lifecycle management.The requests from user are forwarded to frontend through Nginx(load balancer) and Express.js for dynamic routing.

<p align="centre">  
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/architecturefinal.png?raw=true" >  
</p>

## Flow

<p align="centre">  
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/flow.png" width="300">  
</p>

## Working

<img src="https://user-images.githubusercontent.com/55195287/124394128-9646a600-dd1b-11eb-8bf1-233320762f1c.png" />
<img src="https://user-images.githubusercontent.com/55195287/124394171-d4dc6080-dd1b-11eb-87b2-127daa32481a.png" />

<p>
  The lifecycle of a product starts when <strong>manufactureProduct()</strong> is called(while making an entry) after the final product is manufactured and the product and manufacturer details are entered in the blockchain. The <strong>productHistory[]</strong> gets initialized and the current product data is stored with the current owner(manufacturer).
</p>
<p>
  Now this product shall be available to the Third Party for purchase. On being purchased by a third party seller, the <strong>purchasedByThirdParty()</strong> gets called where the owner is set to thirdParty and the present data gets pushed to the <strong>productHistory[]</strong> (which helps us to track the origin and handling of the product). Simultaneously, the product is shipped by the manufacturer (<strong>shipToThirdParty()</strong>) and is received by the Third Party where <strong>receivedByThirdParty()</strong> is called and the details of the Third Party seller are entered. Each of these checkpoint's data is stored in product history with the state being updated at each step. 
</p>
<p>
  The online purchase of the product takes place from the Third Party. When the customer orders the product, it is shipped by the Third Party (<strong>shipByThirdParty()</strong>) and received by the delivery hub where the <strong>receivedByDeliveryHub()</strong> is called. Here the customer address is stored, owner is set to Delivery Hub, details of the Delivery Hub are fed and the current data state gets pushed to the <strong>productHistory[].</strong>
</p>
<p>
  Finally the product is shipped by the Delivery Hub (<strong>shipByDeliveryHub()</strong>) and received by the customer where the <strong>receivedByCustomer()</strong> is called and the current and final state gets pushed to the <strong>productHistory[]</strong>.
</p>
<p>
  All of these juncture functions shall be called only after complete verification of product and <strong>productHistory[]</strong> while entering a checkpoint. (eg:- Customer accepts and confirms the product by clicking the receive button from his account only after it verifies the product). 
</p>
<p>
  <strong>fetchProductPart1()</strong>, <strong>fetchProductPart2()</strong>, <strong>fetchProductPart3()</strong>, <strong>fetchProductHistoryLength()</strong>, <strong>fetchProductCount()</strong>, <strong>fetchProductState()</strong> are the functions to retreive data of a product queried with UID and data type as product(current state) or history.
</p>
<p>
  The hashes(read certificates) are generated using the Solidity cryptographic function <strong>keccak256()</strong> which implements a SHA-3 hash in the blockchain setup. <strong>keccak256()</strong> generates a secure 256-bit hash which is the main basis of security in the entire mainnet apart from the smart contracts being immutable. In our supply chain setup certificates are generated at every stage of shipping of the product. 
</p>

## Research Paper

This project has been published as a research paper in IEEE. The paper presents a comprehensive analysis of blockchain-based supply chain management and its implementation using Ethereum smart contracts.

**📄 IEEE Publication:** [Blockchain-Based Supply Chain Management System](https://ieeexplore.ieee.org/document/10841727)

**Citation:**

```
Available on IEEE Xplore - Document ID: 10841727
```

The research paper covers:

- Detailed analysis of traditional supply chain challenges
- Blockchain architecture for supply chain transparency
- Smart contract implementation and security considerations
- Performance evaluation and gas optimization strategies
- Future scope and scalability solutions

## Contract Diagrams

### Activity Diagram

The overall flow of the project is described as follows.

<p align="centre">
  <a>
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/activitydiagram.png?raw=true" >
  </a>
</p>
<h3> Sequence Diagram</h3>
The flow of the functions in the smart contracts.
<p align="centre">
  <a>
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/sequencediagram.png?raw=true" width="1000">
  </a>
</p>
<h3> Data Flow Diagram </h3>
The entire structure of the code.
<p align="centre">
  <a>
    <img src="https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products/blob/main/images/dataflow.png?raw=true">
  </a>
</p>

## Database Archival System

<p>
  To ensure disaster recovery and provide fast query capabilities for completed supply chains, the system includes an automated MongoDB archival service. This service runs alongside the blockchain network and automatically stores complete product journey data when products are delivered to customers.
</p>

### Features

- **Automatic Archival**: Listens for `ReceivedByCustomer` blockchain events and automatically archives complete supply chain data
- **Disaster Recovery**: Maintains database backup in case blockchain network stops
- **Fast Queries**: Admin dashboard with statistics, search, and filtering capabilities
- **Complete History**: Stores all 9 states of product journey with timestamps and transaction hashes
- **REST API**: 8+ endpoints for querying archived data
- **Data Export**: Backup functionality for complete data export

### Architecture

<p align="centre">
The archive service uses event-driven architecture where blockchain events trigger database storage. MongoDB serves as a rebuildable cache for completed supply chains while blockchain remains the source of truth for active products.
</p>

### Setup Archive Service

Navigate to server directory

```Bash
cd server
```

Install MongoDB (using Docker)

```Bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Install dependencies

```Bash
npm install
```

Configure environment

```Bash
cp .env.example .env
```

Update `.env` file with contract address (obtained after `truffle migrate`)

```Bash
MONGODB_URI=mongodb://localhost:27017/supplychain_archive
BLOCKCHAIN_RPC=ws://127.0.0.1:8545
CONTRACT_ADDRESS=<Your_SupplyChain_Contract_Address>
PORT=5000
```

Start the archive service

```Bash
npm start
```

### API Endpoints

The archive service provides the following endpoints for admin queries:

- `GET /api/products` - Get all completed products (with pagination)
- `GET /api/products/:uid` - Get specific product by UID
- `GET /api/stats` - Get statistics (total products, delivery time, category breakdown)
- `GET /api/search` - Search products with filters (manufacturer, customer, category, date range)
- `POST /api/archive/:uid` - Manually archive a product
- `GET /api/export` - Export all data as JSON backup
- `GET /api/manufacturer/:address` - Get all products by manufacturer
- `GET /api/customer/:address` - Get all products by customer
- `GET /health` - Service health check

### How It Works

<p>
When a customer receives a product and the <strong>receivedByCustomer()</strong> function is called, the smart contract emits a <strong>ReceivedByCustomer</strong> event. The archive service detects this event, fetches the complete product data including all 9 states from the blockchain, and stores it in MongoDB for fast querying and disaster recovery purposes.
</p>

<p>
The archived data includes manufacturer details, third party information, delivery hub data, customer address, complete history array with all state transitions, timestamps, block numbers, transaction hashes, and calculated metrics like total time in supply chain.
</p>

## Installation and Setup

Prerequisites : `npm, git, docker(optional), mongodb(optional - for archival)`

Clone the repository

```Bash
git clone https://github.com/ManteshMhetre/AgriChain---Supply-Chain-of-Agricultural-Products.git && cd eth-supplychain-dapp
```

Install dependencies

```Bash
npm i
```

Install ganache-cli

```Bash
npm i -g ganache-cli
```

Configure ganache-cli for 10 accounts and extend gasLimit to 6721975000 and beyond, so as to have enough gas for migrating the smart contracts and a data flow for the prototype.

```Bash
ganache-cli --accounts 10 --gasLimit 6721975000
```

If you want to run the ganache-cli on docker then use the following command

```Bash
sudo docker run -d -p 8545:8545 trufflesuite/ganache-cli:latest -h 0.0.0.0 --accounts 10 --gasLimit 6721975000
```

Migrate the contracts

```Bash
truffle migrate --network=develop --reset
```

Open a second terminal and enter the client folder

```Bash
cd client
```

Install all packages in the package.json file

```Bash
npm i
```

Setup an .env file using the `nano .env` command and enter the google maps api key and set the react rpc port to 8545 since the ganache-cli runs on the same port by default.
The final .env file must look like this

```Bash
REACT_APP_GOOGLE_MAP_API_KEY=*************************
REACT_APP_RPC=http://127.0.0.1:8545/

```

Run the app

```Bash
npm start
```

The app gets hosted by default at port 3000.

## Documentation to help with Solidity

https://docs.soliditylang.org/en/v0.8.4/

## Documentation to help with React

https://reactjs.org/docs/getting-started.html

## Documentation to help with Truffle

https://www.trufflesuite.com/docs/truffle/reference/configuration

## Documentation to help with Ganache-cli

https://www.trufflesuite.com/docs/ganache/overview
