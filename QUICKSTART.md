# Quick Start Guide

Get your DApp Testnet MVP up and running in 5 minutes!

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and add:
- Your wallet's private key (for deployment)
- Base Sepolia RPC URL (already set by default)

### 3. Deploy Contract
```bash
npm run deploy:base-sepolia
```

**Important:** Copy the contract address from the output and add it to `.env`:
```env
CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

### 4. Run Tests & Submit
```bash
# Run Playwright tests
npm run playwright

# Submit results to blockchain
npm run submit-test-results
```

### 5. View Dashboard
```bash
npm run dev
```

Open http://localhost:3000 and connect your wallet!

## ✅ Checklist

- [ ] Dependencies installed
- [ ] `.env` file configured with private key
- [ ] Contract deployed to Base Sepolia
- [ ] Contract address added to `.env`
- [ ] Tests run and submitted
- [ ] Dashboard shows compliance

## 🎯 What You Get

✅ **TestRegistry Contract** - Deployed on Base Sepolia  
✅ **Sample Strategy** - 95% pass rate, 5 tests minimum  
✅ **Test Results** - Submitted on-chain  
✅ **Compliance Dashboard** - Real-time team status  

## 📝 Next Steps

1. **Customize Tests**: Edit `tests/example.spec.ts` with your own tests
2. **Create Strategies**: Use the contract's `createStrategy` function
3. **View Compliance**: Check the dashboard for your team's status
4. **Explore**: Read the full [README.md](./README.md) for details

## 🆘 Need Help?

- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment steps
- Review [README.md](./README.md) for full documentation
- Make sure you have Base Sepolia testnet ETH from the faucet

Happy testing! 🎉

