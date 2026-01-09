import { ethers } from "ethers";
import * as path from "path";
import { execSync } from "child_process";
import * as dotenv from "dotenv";
import { parsePlaywrightResults, type PlaywrightTestResult } from "../lib/playwright-parser";

dotenv.config();

// TestRegistry ABI (simplified - in production, import from artifacts)
const TEST_REGISTRY_ABI = [
  "function submitTestExecution(string memory _testId, string memory _testName, bool _passed, string memory _resultHash, string memory _strategyId) public",
  "function createStrategy(string memory _strategyId, string memory _name, uint256 _minPassRate, uint256 _minTestCount) public",
];

async function runPlaywrightTests(): Promise<PlaywrightTestResult[]> {
  console.log("Running Playwright tests...");
  
  try {
    // Run Playwright tests
    execSync("npx playwright test", { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.log("Some tests may have failed, continuing to submit results...");
  }

  // Parse test results
  const testResultsDir = path.join(process.cwd(), "test-results");
  const results = parsePlaywrightResults(testResultsDir);

  return results;
}

async function submitToChain(testResults: PlaywrightTestResult[], strategyId: string) {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org";
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!privateKey) {
    throw new Error("PRIVATE_KEY not set in .env file");
  }

  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS not set in .env file. Deploy the contract first.");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const contract = new ethers.Contract(contractAddress, TEST_REGISTRY_ABI, wallet);

  console.log(`\nSubmitting ${testResults.length} test results to chain...`);
  console.log(`Contract: ${contractAddress}`);
  console.log(`Wallet: ${wallet.address}`);

  for (const result of testResults) {
    try {
      console.log(`\nSubmitting test: ${result.testName} (${result.testId})`);
      const tx = await contract.submitTestExecution(
        result.testId,
        result.testName,
        result.passed,
        result.resultHash,
        strategyId
      );
      console.log(`Transaction hash: ${tx.hash}`);
      await tx.wait();
      console.log(`✓ Test submitted successfully!`);
    } catch (error: any) {
      console.error(`✗ Failed to submit test ${result.testId}:`, error.message);
    }
  }
}

async function main() {
  const strategyId = process.env.STRATEGY_ID || "sample-strategy-1";

  console.log("=== Test Result Submission Script ===\n");
  
  // Run Playwright tests
  const testResults = await runPlaywrightTests();
  
  if (testResults.length === 0) {
    console.log("No test results to submit.");
    return;
  }

  // Submit to chain
  await submitToChain(testResults, strategyId);

  console.log("\n=== Submission Complete ===");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

