import { ethers } from "ethers";
import { execSync } from "child_process";
import * as dotenv from "dotenv";
import { parsePlaywrightResults, type PlaywrightTestResult } from "../lib/playwright-parser";

dotenv.config();

// TestRegistry ABI (simplified - in production, import from artifacts)
const TEST_REGISTRY_ABI = [
  "function submitTestExecution(string memory _testId, string memory _testName, bool _passed, string memory _resultHash, string memory _strategyId) public",
  "function createStrategy(string memory _strategyId, string memory _name, uint256 _minPassRate, uint256 _minTestCount) public",
];

interface CliOptions {
  reportPath?: string;
  skipPlaywright: boolean;
}

function parseCliOptions(): CliOptions {
  const options: CliOptions = {
    skipPlaywright: false,
  };

  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--report-path") {
      const value = args[i + 1];
      if (!value) {
        throw new Error("Missing value for --report-path");
      }
      options.reportPath = value;
      i++;
    } else if (arg.startsWith("--report-path=")) {
      options.reportPath = arg.split("=")[1];
    } else if (arg === "--skip-playwright") {
      options.skipPlaywright = true;
    }
  }

  return options;
}

async function runPlaywrightTests(reportPath?: string): Promise<PlaywrightTestResult[]> {
  console.log("Running Playwright tests...");
  
  try {
    execSync("npx playwright test", {
      stdio: 'inherit',
      cwd: process.cwd()
    });
  } catch (error) {
    console.log("Some tests may have failed, continuing to submit results...");
  }

  return parsePlaywrightResults(reportPath);
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
  const options = parseCliOptions();
  const reportPath = options.reportPath || process.env.PLAYWRIGHT_REPORT_PATH;

  console.log("=== Test Result Submission Script ===\n");
  if (reportPath) {
    console.log(`Using Playwright report: ${reportPath}`);
  } else {
    console.log("Using default Playwright report lookup paths.");
  }
  
  const testResults = options.skipPlaywright
    ? parsePlaywrightResults(reportPath)
    : await runPlaywrightTests(reportPath);
  
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

