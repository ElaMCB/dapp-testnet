# Deployment Guide

## Prerequisites

1. **Base Sepolia Testnet Access**
   - Add Base Sepolia to your MetaMask:
     - Network Name: Base Sepolia
     - RPC URL: https://sepolia.base.org
     - Chain ID: 84532
     - Currency Symbol: ETH
     - Block Explorer: https://sepolia.basescan.org

2. **Get Testnet ETH**
   - Visit [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet)
   - Request testnet ETH for your wallet address

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Add your private key (from MetaMask or your wallet)
   - Set `BASE_SEPOLIA_RPC_URL=https://sepolia.base.org`

## Step-by-Step Deployment

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Deploy to Base Sepolia

```bash
npm run deploy:base-sepolia
```

This will:
- Deploy the TestRegistry contract
- Create a sample strategy with:
  - ID: `sample-strategy-1`
  - Name: "Sample Test Strategy"
  - Minimum Pass Rate: 95%
  - Minimum Test Count: 5

### 4. Update Environment Variables

After deployment, copy the contract address and update your `.env`:

```env
CONTRACT_ADDRESS=0x...  # From deployment output
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # Same address for frontend
```

### 5. Verify Deployment

You can verify the deployment by:
- Checking the contract on [BaseScan](https://sepolia.basescan.org)
- Running the test suite: `npm test`
- Starting the dashboard: `npm run dev`

## Testing the Deployment

### Submit Test Results

1. Run Playwright tests:
```bash
npm run playwright
```

2. Submit results to chain:
```bash
npm run submit-test-results
```

### View Dashboard

1. Start the development server:
```bash
npm run dev
```

2. Open http://localhost:3000
3. Connect your MetaMask wallet
4. View your team's compliance status

## Troubleshooting

### "Insufficient funds" error
- Make sure you have Base Sepolia ETH in your wallet
- Get more from the faucet if needed

### "Contract address not set" error
- Make sure you've deployed the contract first
- Update `.env` with the correct contract address

### "Strategy does not exist" error
- The deployment script creates `sample-strategy-1` automatically
- If it failed, you can create it manually using the contract's `createStrategy` function

## Next Steps

After successful deployment:
1. ✅ Contract is deployed to Base Sepolia
2. ✅ Sample strategy is created
3. ✅ Ready to submit test results
4. ✅ Dashboard can display compliance

You can now:
- Run your Playwright tests
- Submit results on-chain
- View compliance in the dashboard
- Create additional strategies as needed

