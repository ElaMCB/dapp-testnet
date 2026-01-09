// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TestRegistry
 * @dev A registry for storing and verifying test execution results on-chain
 */
contract TestRegistry {
    // Struct to represent a test execution
    struct TestExecution {
        string testId;           // Unique identifier for the test
        string testName;          // Human-readable test name
        address submitter;        // Address that submitted the test
        uint256 timestamp;        // Block timestamp when submitted
        bool passed;              // Whether the test passed
        string resultHash;        // IPFS hash or hash of test results
        string strategyId;        // Strategy this test is verified against
        bool verified;           // Whether the test meets the strategy requirements
    }

    // Struct to represent a verification strategy
    struct Strategy {
        string strategyId;        // Unique identifier for the strategy
        string name;              // Human-readable strategy name
        address creator;          // Address that created the strategy
        uint256 minPassRate;     // Minimum pass rate required (in basis points, e.g., 9500 = 95%)
        uint256 minTestCount;    // Minimum number of tests required
        bool active;             // Whether the strategy is active
    }

    // Mapping from test execution ID to TestExecution
    mapping(string => TestExecution) public testExecutions;
    
    // Mapping from strategy ID to Strategy
    mapping(string => Strategy) public strategies;
    
    // Mapping from team address to their test execution IDs
    mapping(address => string[]) public teamTests;
    
    // Mapping from strategy ID to test execution IDs that meet it
    mapping(string => string[]) public strategyCompliance;
    
    // Array to store all test execution IDs
    string[] public allTestIds;
    
    // Array to store all strategy IDs
    string[] public allStrategyIds;

    // Events
    event TestSubmitted(
        string indexed testId,
        address indexed submitter,
        string testName,
        bool passed,
        string strategyId
    );
    
    event StrategyCreated(
        string indexed strategyId,
        address indexed creator,
        string name,
        uint256 minPassRate,
        uint256 minTestCount
    );
    
    event TestVerified(
        string indexed testId,
        string indexed strategyId,
        bool verified
    );

    /**
     * @dev Submit a test execution result
     * @param _testId Unique identifier for the test
     * @param _testName Human-readable test name
     * @param _passed Whether the test passed
     * @param _resultHash Hash of test results (IPFS hash or similar)
     * @param _strategyId Strategy ID to verify against
     */
    function submitTestExecution(
        string memory _testId,
        string memory _testName,
        bool _passed,
        string memory _resultHash,
        string memory _strategyId
    ) public {
        require(bytes(_testId).length > 0, "Test ID cannot be empty");
        require(bytes(testExecutions[_testId].testId).length == 0, "Test ID already exists");
        require(bytes(strategies[_strategyId].strategyId).length > 0, "Strategy does not exist");

        TestExecution memory newExecution = TestExecution({
            testId: _testId,
            testName: _testName,
            submitter: msg.sender,
            timestamp: block.timestamp,
            passed: _passed,
            resultHash: _resultHash,
            strategyId: _strategyId,
            verified: false
        });

        testExecutions[_testId] = newExecution;
        teamTests[msg.sender].push(_testId);
        allTestIds.push(_testId);

        // Automatically verify against strategy
        bool verified = verifyTestAgainstStrategy(_testId, _strategyId);
        if (verified) {
            testExecutions[_testId].verified = true;
            strategyCompliance[_strategyId].push(_testId);
            emit TestVerified(_testId, _strategyId, true);
        }

        emit TestSubmitted(_testId, msg.sender, _testName, _passed, _strategyId);
    }

    /**
     * @dev Create a new verification strategy
     * @param _strategyId Unique identifier for the strategy
     * @param _name Human-readable strategy name
     * @param _minPassRate Minimum pass rate in basis points (10000 = 100%)
     * @param _minTestCount Minimum number of tests required
     */
    function createStrategy(
        string memory _strategyId,
        string memory _name,
        uint256 _minPassRate,
        uint256 _minTestCount
    ) public {
        require(bytes(_strategyId).length > 0, "Strategy ID cannot be empty");
        require(bytes(strategies[_strategyId].strategyId).length == 0, "Strategy ID already exists");
        require(_minPassRate <= 10000, "Pass rate cannot exceed 100%");

        Strategy memory newStrategy = Strategy({
            strategyId: _strategyId,
            name: _name,
            creator: msg.sender,
            minPassRate: _minPassRate,
            minTestCount: _minTestCount,
            active: true
        });

        strategies[_strategyId] = newStrategy;
        allStrategyIds.push(_strategyId);

        emit StrategyCreated(_strategyId, msg.sender, _name, _minPassRate, _minTestCount);
    }

    /**
     * @dev Verify a test against a strategy
     * @param _testId Test execution ID to verify
     * @param _strategyId Strategy ID to verify against
     * @return Whether the test meets the strategy requirements
     */
    function verifyTestAgainstStrategy(
        string memory _testId,
        string memory _strategyId
    ) public view returns (bool) {
        TestExecution memory test = testExecutions[_testId];
        Strategy memory strategy = strategies[_strategyId];

        require(bytes(test.testId).length > 0, "Test does not exist");
        require(strategy.active, "Strategy is not active");

        // Get all tests for the submitter's team
        string[] memory teamTestIds = teamTests[test.submitter];
        
        // Calculate pass rate for this team
        uint256 passedCount = 0;
        uint256 totalCount = 0;
        
        for (uint256 i = 0; i < teamTestIds.length; i++) {
            TestExecution memory t = testExecutions[teamTestIds[i]];
            if (keccak256(bytes(t.strategyId)) == keccak256(bytes(_strategyId))) {
                totalCount++;
                if (t.passed) {
                    passedCount++;
                }
            }
        }

        // Check if requirements are met
        if (totalCount < strategy.minTestCount) {
            return false;
        }

        uint256 passRate = (passedCount * 10000) / totalCount;
        return passRate >= strategy.minPassRate && test.passed;
    }

    /**
     * @dev Get team compliance for a strategy
     * @param _teamAddress Address of the team
     * @param _strategyId Strategy ID to check compliance for
     * @return passRate Pass rate in basis points
     * @return testCount Total number of tests
     * @return passedCount Number of passed tests
     * @return compliant Whether the team is compliant
     */
    function getTeamCompliance(
        address _teamAddress,
        string memory _strategyId
    ) public view returns (
        uint256 passRate,
        uint256 testCount,
        uint256 passedCount,
        bool compliant
    ) {
        Strategy memory strategy = strategies[_strategyId];
        require(strategy.active, "Strategy is not active");

        string[] memory teamTestIds = teamTests[_teamAddress];
        passedCount = 0;
        testCount = 0;

        for (uint256 i = 0; i < teamTestIds.length; i++) {
            TestExecution memory test = testExecutions[teamTestIds[i]];
            if (keccak256(bytes(test.strategyId)) == keccak256(bytes(_strategyId))) {
                testCount++;
                if (test.passed) {
                    passedCount++;
                }
            }
        }

        if (testCount == 0) {
            return (0, 0, 0, false);
        }

        passRate = (passedCount * 10000) / testCount;
        compliant = passRate >= strategy.minPassRate && testCount >= strategy.minTestCount;

        return (passRate, testCount, passedCount, compliant);
    }

    /**
     * @dev Get all test IDs for a team
     * @param _teamAddress Address of the team
     * @return Array of test IDs
     */
    function getTeamTests(address _teamAddress) public view returns (string[] memory) {
        return teamTests[_teamAddress];
    }

    /**
     * @dev Get total number of test executions
     * @return Total count
     */
    function getTotalTestCount() public view returns (uint256) {
        return allTestIds.length;
    }

    /**
     * @dev Get total number of strategies
     * @return Total count
     */
    function getTotalStrategyCount() public view returns (uint256) {
        return allStrategyIds.length;
    }
}

