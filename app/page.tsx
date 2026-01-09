'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getContract, getTeamCompliance, getTestExecution, getStrategy, type TeamCompliance, type TestExecution, type Strategy } from '@/lib/contract';

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export default function Dashboard() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [account, setAccount] = useState<string>('');
  const [connected, setConnected] = useState(false);
  const [teamCompliance, setTeamCompliance] = useState<TeamCompliance | null>(null);
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [testExecutions, setTestExecutions] = useState<TestExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [strategyId, setStrategyId] = useState('sample-strategy-1');

  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const initProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(initProvider);
    }
  }, []);

  const connectWallet = async () => {
    if (!provider) {
      alert('Please install MetaMask or another Web3 wallet');
      return;
    }

    try {
      const accounts = await provider.send('eth_requestAccounts', []);
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setConnected(true);
        await loadDashboardData(accounts[0]);
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      alert('Failed to connect wallet');
    }
  };

  const loadDashboardData = async (teamAddress: string) => {
    if (!provider || !CONTRACT_ADDRESS) {
      console.error('Provider or contract address not available');
      return;
    }

    setLoading(true);
    try {
      const contract = getContract(provider, CONTRACT_ADDRESS);

      // Load strategy
      const strategyData = await getStrategy(contract, strategyId);
      setStrategy(strategyData);

      // Load team compliance
      const compliance = await getTeamCompliance(contract, teamAddress, strategyId);
      setTeamCompliance(compliance);

      // Load team tests
      const testIds = await contract.getTeamTests(teamAddress);
      const tests = await Promise.all(
        testIds.map((id: string) => getTestExecution(contract, id))
      );
      setTestExecutions(tests);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      alert('Failed to load dashboard data. Make sure the contract is deployed and address is correct.');
    } finally {
      setLoading(false);
    }
  };

  const formatPassRate = (passRate: bigint) => {
    return (Number(passRate) / 100).toFixed(2) + '%';
  };

  const formatTimestamp = (timestamp: bigint) => {
    return new Date(Number(timestamp) * 1000).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            DApp Testnet Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Decentralized Testing Verification Protocol
          </p>
        </header>

        {!connected ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
              Connect Your Wallet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Connect your Web3 wallet to view your team's test compliance dashboard.
            </p>
            <button
              onClick={connectWallet}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Connect Wallet
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Connection Status */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Connected Account</p>
                  <p className="text-lg font-mono text-gray-900 dark:text-white">{account}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Connected</span>
                </div>
              </div>
            </div>

            {/* Strategy Info */}
            {strategy && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Strategy: {strategy.name}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Minimum Pass Rate</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {formatPassRate(strategy.minPassRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Minimum Test Count</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white">
                      {strategy.minTestCount.toString()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Compliance Status */}
            {teamCompliance && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Team Compliance
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Pass Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatPassRate(teamCompliance.passRate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Tests</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {teamCompliance.testCount.toString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Passed Tests</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {teamCompliance.passedCount.toString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                    <p
                      className={`text-2xl font-bold ${
                        teamCompliance.compliant
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}
                    >
                      {teamCompliance.compliant ? '✓ Compliant' : '✗ Non-Compliant'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Test Executions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Test Executions ({testExecutions.length})
              </h2>
              {loading ? (
                <p className="text-gray-600 dark:text-gray-400">Loading...</p>
              ) : testExecutions.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400">
                  No test executions found. Submit tests using the Playwright integration.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Test Name
                        </th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Status
                        </th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Verified
                        </th>
                        <th className="py-3 px-4 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Timestamp
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {testExecutions.map((test, index) => (
                        <tr
                          key={index}
                          className="border-b border-gray-100 dark:border-gray-700"
                        >
                          <td className="py-3 px-4 text-gray-900 dark:text-white">
                            {test.testName}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-sm font-semibold ${
                                test.passed
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              }`}
                            >
                              {test.passed ? 'Passed' : 'Failed'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded text-sm font-semibold ${
                                test.verified
                                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}
                            >
                              {test.verified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                            {formatTimestamp(test.timestamp)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

