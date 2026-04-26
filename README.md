# dapp-testnet

Verifiable QA pipeline for Web3 teams: run automated tests, anchor the results on-chain, and track strategy compliance in a dashboard.

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/ElaMCB/dapp-testnet" alt="License"></a>
  <a href="https://github.com/ElaMCB/dapp-testnet/stargazers"><img src="https://img.shields.io/github/stars/ElaMCB/dapp-testnet?style=social" alt="GitHub stars"></a>
  <a href="https://github.com/ElaMCB/dapp-testnet/network/members"><img src="https://img.shields.io/github/forks/ElaMCB/dapp-testnet?style=social" alt="GitHub forks"></a>
  <a href="https://github.com/ElaMCB/dapp-testnet/issues"><img src="https://img.shields.io/github/issues/ElaMCB/dapp-testnet" alt="Issues"></a>
  <a href="https://github.com/ElaMCB/dapp-testnet/commits/main"><img src="https://img.shields.io/github/last-commit/ElaMCB/dapp-testnet" alt="Last commit"></a>
  <a href="https://github.com/ElaMCB/dapp-testnet"><img src="https://hitscounter.dev/api/hit?url=https%3A%2F%2Fgithub.com%2FElaMCB%2Fdapp-testnet&amp;label=Visitors&amp;icon=github&amp;color=%23198754" alt="Visitors"></a>
  <br><br>
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-14-000000?logo=nextdotjs&logoColor=white" alt="Next.js"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://hardhat.org/"><img src="https://img.shields.io/badge/Hardhat-smart%20contracts-FFF100?logo=ethereum&logoColor=black" alt="Hardhat"></a>
  <a href="https://playwright.dev/"><img src="https://img.shields.io/badge/Playwright-E2E-2EAD33?logo=playwright&logoColor=white" alt="Playwright"></a>
</p>

## What this repo is trying to do

This project turns normal automated test output into tamper-evident compliance records on Base Sepolia.
It is an MVP for teams that want stronger proof of test execution than CI logs alone.

## How it works

1. Playwright executes end-to-end tests.
2. A parser converts each test outcome into a compact hashable payload.
3. `TestRegistry` stores test execution records and verifies them against a strategy (minimum pass rate + minimum test count).
4. A Next.js dashboard reads on-chain data and shows team compliance status.

## Current MVP scope

- On-chain storage of submitted test executions
- Strategy creation and strategy-based verification
- Team compliance metrics (pass rate, passed count, total count)
- Wallet-connected dashboard view for submitted history

## Quick start

```bash
npm install
npm run deploy:base-sepolia
npm run submit-test-results
npm run dev
```

Then open `http://localhost:3000` and connect a wallet on Base Sepolia.
