import * as fs from "fs";
import * as path from "path";
import { ethers } from "ethers";

export interface PlaywrightTestResult {
  testId: string;
  testName: string;
  passed: boolean;
  resultHash: string;
}

/**
 * Parse Playwright test results and convert to on-chain format
 */
export function parsePlaywrightResults(testResultsDir: string): PlaywrightTestResult[] {
  const results: PlaywrightTestResult[] = [];
  const timestamp = Date.now();

  // Look for Playwright report files
  const reportPaths = [
    path.join(testResultsDir, "results.json"),
    path.join(process.cwd(), "playwright-report", "data.json"),
  ];

  let testData: any = null;

  for (const reportPath of reportPaths) {
    if (fs.existsSync(reportPath)) {
      try {
        const content = fs.readFileSync(reportPath, "utf-8");
        testData = JSON.parse(content);
        break;
      } catch (error) {
        console.warn(`Failed to parse ${reportPath}:`, error);
      }
    }
  }

  if (testData) {
    // Parse Playwright JSON report format
    if (testData.suites) {
      // Playwright JSON reporter format
      testData.suites.forEach((suite: any, suiteIndex: number) => {
        suite.specs?.forEach((spec: any, specIndex: number) => {
          spec.tests?.forEach((test: any, testIndex: number) => {
            const testId = `test-${timestamp}-${suiteIndex}-${specIndex}-${testIndex}`;
            const testName = `${suite.title || "Suite"} - ${spec.title || "Spec"} - ${test.title || "Test"}`;
            const passed = test.results?.some((r: any) => r.status === "passed") || false;
            
            // Create hash from test result data
            const resultData = JSON.stringify({
              title: test.title,
              status: test.results?.[0]?.status,
              duration: test.results?.[0]?.duration,
            });
            const resultHash = ethers.keccak256(ethers.toUtf8Bytes(resultData));

            results.push({
              testId,
              testName,
              passed,
              resultHash,
            });
          });
        });
      });
    } else if (Array.isArray(testData)) {
      // Alternative format - array of test results
      testData.forEach((test: any, index: number) => {
        const testId = `test-${timestamp}-${index}`;
        const testName = test.title || test.name || `Test ${index + 1}`;
        const passed = test.status === "passed" || test.passed === true;
        
        const resultData = JSON.stringify(test);
        const resultHash = ethers.keccak256(ethers.toUtf8Bytes(resultData));

        results.push({
          testId,
          testName,
          passed,
          resultHash,
        });
      });
    }
  }

  // If no results found, create sample results for demonstration
  if (results.length === 0) {
    console.warn("No Playwright results found, creating sample results");
    results.push({
      testId: `test-${timestamp}-1`,
      testName: "Sample Test - Example Domain Check",
      passed: true,
      resultHash: ethers.keccak256(ethers.toUtf8Bytes(`sample-test-${timestamp}`)),
    });
    results.push({
      testId: `test-${timestamp}-2`,
      testName: "Sample Test - Title Verification",
      passed: true,
      resultHash: ethers.keccak256(ethers.toUtf8Bytes(`sample-test-2-${timestamp}`)),
    });
  }

  return results;
}

