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
export function parsePlaywrightResults(reportPath?: string): PlaywrightTestResult[] {
  const results: PlaywrightTestResult[] = [];
  const timestamp = Date.now();

  const reportPaths = reportPath
    ? [reportPath]
    : [
        path.join(process.cwd(), "test-results", "results.json"),
        path.join(process.cwd(), "playwright-report", "data.json"),
      ];

  let testData: any = null;
  let parsedFromPath: string | null = null;

  for (const reportPath of reportPaths) {
    if (fs.existsSync(reportPath)) {
      try {
        const content = fs.readFileSync(reportPath, "utf-8");
        testData = JSON.parse(content);
        parsedFromPath = reportPath;
        break;
      } catch (error) {
        console.warn(`Failed to parse ${reportPath}:`, error);
      }
    }
  }

  if (!testData) {
    throw new Error(
      `No parseable Playwright JSON report found. Looked in: ${reportPaths.join(", ")}`
    );
  }

  // Parse Playwright JSON reporter format
  if (testData.suites) {
    testData.suites.forEach((suite: any, suiteIndex: number) => {
      suite.specs?.forEach((spec: any, specIndex: number) => {
        spec.tests?.forEach((test: any, testIndex: number) => {
          const testId = `test-${timestamp}-${suiteIndex}-${specIndex}-${testIndex}`;
          const testName = `${suite.title || "Suite"} - ${spec.title || "Spec"} - ${test.title || "Test"}`;
          const passed = test.results?.some((r: any) => r.status === "passed") || false;

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
  } else {
    throw new Error(
      `Unsupported Playwright JSON report format in ${parsedFromPath ?? "unknown path"}`
    );
  }

  if (results.length === 0) {
    throw new Error(
      `Playwright report parsed from ${parsedFromPath ?? "unknown path"}, but contained zero tests`
    );
  }

  return results;
}

