# dapp-testnet

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Web3](https://img.shields.io/badge/Web3-enabled-8B5CF6.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Solidity](https://img.shields.io/badge/solidity-0.8.20-orange.svg)
![Network](https://img.shields.io/badge/network-Base%20Sepolia-0052FF.svg)
![Status](https://img.shields.io/badge/status-MVP-success.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black.svg)

Decentralized Testing Verification Protocol - a groundbreaking application of Web3 to QA architecture.

## Overview

This project implements a decentralized testing verification system where:
- Test results from Playwright are submitted on-chain to Base Sepolia testnet
- Tests are verified against configurable strategies
- A dashboard displays team compliance with testing requirements

## Features

✅ **TestRegistry Smart Contract** - Deployed on Base Sepolia testnet
✅ **Playwright Integration** - Submit test executions on-chain
✅ **Strategy Verification** - Verify tests meet sample strategies
✅ **Compliance Dashboard** - View team compliance status

## Project Structure

```
dapp-testnet/
├── contracts/          # Solidity smart contracts
│   └── TestRegistry.sol
├── scripts/            # Deployment and utility scripts
│   ├── deploy.ts
│   └── submit-test-results.ts
├── tests/              # Playwright test files
│   └── example.spec.ts
├── app/                # Next.js frontend
│   ├── page.tsx        # Dashboard
│   └── layout.tsx
├── lib/                # Utility libraries
│   ├── contract.ts
│   └── playwright-parser.ts
└── hardhat.config.ts   # Hardhat configuration
```

## Setup

### Prerequisites

- Node.js 18+ and npm
- MetaMask or another Web3 wallet
- Base Sepolia testnet ETH (get from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-goerli-faucet))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dapp-testnet
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
CONTRACT_ADDRESS=  # Will be set after deployment
STRATEGY_ID=sample-strategy-1
NEXT_PUBLIC_CONTRACT_ADDRESS=  # Will be set after deployment
```

## Deployment

### Deploy TestRegistry to Base Sepolia

1. Make sure you have Base Sepolia testnet configured in your wallet and have testnet ETH.

2. Deploy the contract:
```bash
npm run deploy:base-sepolia
```

3. Copy the deployed contract address and update your `.env` file:
```env
CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...
```

The deployment script will automatically create a sample strategy with:
- Minimum pass rate: 95%
- Minimum test count: 5

## Usage

### Running Playwright Tests

Run the example tests:
```bash
npm run playwright
```

### Submitting Test Results On-Chain

After running tests, submit them to the blockchain:
```bash
npx ts-node scripts/submit-test-results.ts
```

This script will:
1. Run Playwright tests (if not already run)
2. Parse test results
3. Submit each test execution to the TestRegistry contract
4. Automatically verify tests against the configured strategy

### Viewing the Dashboard

1. Start the Next.js development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. Connect your Web3 wallet (MetaMask recommended)

4. View your team's compliance status:
   - Pass rate
   - Total test count
   - Passed tests
   - Compliance status
   - Individual test executions

## Smart Contract Functions

### TestRegistry Contract

**submitTestExecution**
- Submit a test execution result on-chain
- Parameters: testId, testName, passed, resultHash, strategyId

**createStrategy**
- Create a new verification strategy
- Parameters: strategyId, name, minPassRate (basis points), minTestCount

**getTeamCompliance**
- Get compliance status for a team
- Returns: passRate, testCount, passedCount, compliant

**verifyTestAgainstStrategy**
- Verify if a test meets strategy requirements
- Checks pass rate and minimum test count

## Strategy Verification

Tests are verified against strategies based on:
- **Minimum Pass Rate**: Percentage of tests that must pass (in basis points, e.g., 9500 = 95%)
- **Minimum Test Count**: Minimum number of tests required for compliance

A team is compliant if:
- They have submitted at least the minimum number of tests
- Their pass rate meets or exceeds the minimum pass rate
- The submitted test passed

## Development

### Compile Contracts
```bash
npm run compile
```

### Run Tests
```bash
npm test
```

### Build Frontend
```bash
npm run build
```

## Network Configuration

The project is configured for **Base Sepolia** testnet:
- Chain ID: 84532
- RPC URL: https://sepolia.base.org

To use a different network, update `hardhat.config.ts` and the frontend configuration.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.