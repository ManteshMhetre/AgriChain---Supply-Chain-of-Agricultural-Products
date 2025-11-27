# Supply Chain Archive Service

Backend service that automatically archives completed supply chain transactions to MongoDB database.

## Features

- 🎯 Automatically archives products when delivered to customer
- 💾 MongoDB backup for disaster recovery
- 📊 Admin dashboard with statistics
- 🔍 Fast search and filtering
- 📤 Data export functionality
- 🔗 Blockchain verification references

## Installation

### Prerequisites

- Node.js (v14+ recommended)
- MongoDB (v4.4+ recommended)
- Ganache CLI (for blockchain)

### Setup

1. **Navigate to server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Configure environment:**

   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file:**

   ```env
   MONGODB_URI=mongodb://localhost:27017/supplychain_archive
   BLOCKCHAIN_RPC=ws://127.0.0.1:8545
   CONTRACT_ADDRESS=<Your_Contract_Address>
   PORT=5000
   ```

   ⚠️ **Important:** Replace `CONTRACT_ADDRESS` with the actual address from `truffle migrate`

## Running

### Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally from mongodb.com
```

### Start Ganache

```bash
ganache-cli --accounts 10 --gasLimit 6721975000
```

### Deploy Contracts (if not already)

```bash
cd ..
truffle migrate --network develop
# Copy the SupplyChain contract address to .env
```

### Start Archive Service

```bash
cd server
npm start
```

You should see:

```
✅ MongoDB Connected Successfully
✅ Connected to Blockchain
✅ Contract loaded
👂 Starting event listener...
✅ Archive Service Running Successfully!
   Server: http://localhost:5000
```

## API Endpoints

### Get All Completed Products

```bash
GET /api/products
```

**Query Parameters:**

- `limit` - Number of records (default: 100)
- `page` - Page number (default: 1)

**Example:**

```bash
curl http://localhost:5000/api/products?limit=10&page=1
```

### Get Product by UID

```bash
GET /api/products/:uid
```

**Example:**

```bash
curl http://localhost:5000/api/products/1
```

### Get Statistics

```bash
GET /api/stats
```

**Returns:**

- Total completed products
- Products completed in last 30 days
- Products completed in last 7 days
- Average delivery time
- Category breakdown

**Example:**

```bash
curl http://localhost:5000/api/stats
```

### Search Products

```bash
GET /api/search
```

**Query Parameters:**

- `manufacturer` - Manufacturer address
- `customer` - Customer address
- `category` - Product category
- `startDate` - Start date (YYYY-MM-DD)
- `endDate` - End date (YYYY-MM-DD)

**Example:**

```bash
curl "http://localhost:5000/api/search?category=Electronics&startDate=2025-11-01"
```

### Manually Archive Product

```bash
POST /api/archive/:uid
```

Use this if automatic event listener missed a product.

**Example:**

```bash
curl -X POST http://localhost:5000/api/archive/1
```

### Export All Data

```bash
GET /api/export
```

Downloads JSON backup of all archived products.

**Example:**

```bash
curl http://localhost:5000/api/export > backup.json
```

### Get Products by Manufacturer

```bash
GET /api/manufacturer/:address
```

**Example:**

```bash
curl http://localhost:5000/api/manufacturer/0xf17f52151EbEF6C7334FAD080c5704D77216b732
```

### Get Products by Customer

```bash
GET /api/customer/:address
```

**Example:**

```bash
curl http://localhost:5000/api/customer/0x821aEa9a577a9b44299B9c15c88cf3087F3b5544
```

### Health Check

```bash
GET /health
```

**Example:**

```bash
curl http://localhost:5000/health
```

## How It Works

1. **Event Listening:**

   - Service connects to blockchain via WebSocket
   - Listens for `ReceivedByCustomer` events
   - Triggered when customer confirms delivery

2. **Data Fetching:**

   - When event detected, fetches complete product data from blockchain
   - Includes all 9 states, timestamps, transaction hashes

3. **Database Storage:**

   - Saves complete supply chain journey to MongoDB
   - Stores blockchain references for verification

4. **Admin Access:**
   - Fast queries without blockchain interaction
   - Analytics and reporting
   - Export for backup

## Project Structure

```
server/
├── config/
│   ├── database.js       # MongoDB connection
│   └── blockchain.js     # Web3 connection
├── models/
│   └── CompletedProduct.js  # MongoDB schema
├── routes/
│   └── api.js            # API endpoints
├── services/
│   └── archiveService.js # Event listener & archive logic
├── .env.example          # Environment template
├── .gitignore
├── package.json
├── README.md
└── server.js             # Main entry point
```

## Database Schema

### CompletedProduct

```javascript
{
  uid: Number,              // Product UID
  sku: Number,              // Stock Keeping Unit
  productName: String,
  productCode: Number,
  productPrice: Number,
  productCategory: String,

  manufacturer: {
    address: String,
    name: String,
    details: String,
    longitude: String,
    latitude: String,
    manufacturedDate: Date
  },

  thirdParty: {
    address: String,
    longitude: String,
    latitude: String
  },

  deliveryHub: {
    address: String,
    longitude: String,
    latitude: String
  },

  customer: {
    address: String
  },

  history: [{              // All 9 states
    state: Number,
    stateName: String,
    timestamp: Date,
    blockNumber: Number,
    transactionHash: String
  }],

  completedDate: Date,
  totalTimeInSupplyChain: String,
  blockchainContractAddress: String,
  finalTransactionHash: String,
  finalBlockNumber: Number
}
```

## Development

### Run with auto-reload (nodemon)

```bash
npm run dev
```

### Test Event Listener

1. Complete a supply chain in the frontend
2. Deliver product to customer
3. Watch server console for archive confirmation

## Production Deployment

### Environment Variables

- Set `NODE_ENV=production`
- Use secure MongoDB URI (MongoDB Atlas)
- Use production blockchain RPC (Infura, Alchemy)

### Security

- Add authentication middleware
- Rate limiting
- HTTPS only
- Restrict CORS origins

### Monitoring

- Add logging service (Winston)
- Error tracking (Sentry)
- Health check monitoring

## Troubleshooting

### "CONTRACT_ADDRESS not found"

- Run `truffle migrate` first
- Copy contract address from output
- Update `.env` file

### "MongoDB connection failed"

- Check MongoDB is running: `mongosh`
- Verify MONGODB_URI in `.env`

### "Blockchain connection failed"

- Check Ganache is running on port 8545
- Verify BLOCKCHAIN_RPC uses `ws://` (WebSocket)

### "Event listener not working"

- Ensure using WebSocket (ws://) not HTTP
- Check contract address is correct
- Verify contract has `ReceivedByCustomer` event

## License

MIT
