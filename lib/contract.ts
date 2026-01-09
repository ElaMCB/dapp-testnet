import { ethers } from "ethers";

export const TEST_REGISTRY_ABI = [
  "function submitTestExecution(string memory _testId, string memory _testName, bool _passed, string memory _resultHash, string memory _strategyId) public",
  "function createStrategy(string memory _strategyId, string memory _name, uint256 _minPassRate, uint256 _minTestCount) public",
  "function getTeamCompliance(address _teamAddress, string memory _strategyId) public view returns (uint256 passRate, uint256 testCount, uint256 passedCount, bool compliant)",
  "function getTeamTests(address _teamAddress) public view returns (string[] memory)",
  "function testExecutions(string memory) public view returns (string testId, string testName, address submitter, uint256 timestamp, bool passed, string resultHash, string strategyId, bool verified)",
  "function strategies(string memory) public view returns (string strategyId, string name, address creator, uint256 minPassRate, uint256 minTestCount, bool active)",
  "function getTotalTestCount() public view returns (uint256)",
  "function getTotalStrategyCount() public view returns (uint256)",
  "event TestSubmitted(string indexed testId, address indexed submitter, string testName, bool passed, string strategyId)",
  "event TestVerified(string indexed testId, string indexed strategyId, bool verified)",
];

export interface TestExecution {
  testId: string;
  testName: string;
  submitter: string;
  timestamp: bigint;
  passed: boolean;
  resultHash: string;
  strategyId: string;
  verified: boolean;
}

export interface Strategy {
  strategyId: string;
  name: string;
  creator: string;
  minPassRate: bigint;
  minTestCount: bigint;
  active: boolean;
}

export interface TeamCompliance {
  passRate: bigint;
  testCount: bigint;
  passedCount: bigint;
  compliant: boolean;
}

export function getContract(provider: ethers.Provider | ethers.JsonRpcProvider | ethers.BrowserProvider, address: string) {
  return new ethers.Contract(address, TEST_REGISTRY_ABI, provider);
}

export async function getTeamCompliance(
  contract: ethers.Contract,
  teamAddress: string,
  strategyId: string
): Promise<TeamCompliance> {
  const result = await contract.getTeamCompliance(teamAddress, strategyId);
  return {
    passRate: result[0],
    testCount: result[1],
    passedCount: result[2],
    compliant: result[3],
  };
}

export async function getTestExecution(
  contract: ethers.Contract,
  testId: string
): Promise<TestExecution> {
  const result = await contract.testExecutions(testId);
  return {
    testId: result[0],
    testName: result[1],
    submitter: result[2],
    timestamp: result[3],
    passed: result[4],
    resultHash: result[5],
    strategyId: result[6],
    verified: result[7],
  };
}

export async function getStrategy(
  contract: ethers.Contract,
  strategyId: string
): Promise<Strategy> {
  const result = await contract.strategies(strategyId);
  return {
    strategyId: result[0],
    name: result[1],
    creator: result[2],
    minPassRate: result[3],
    minTestCount: result[4],
    active: result[5],
  };
}

