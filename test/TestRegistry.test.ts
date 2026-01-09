import { expect } from "chai";
import { ethers } from "hardhat";

describe("TestRegistry", function () {
  let testRegistry: any;
  let owner: any;
  let addr1: any;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();

    const TestRegistry = await ethers.getContractFactory("TestRegistry");
    testRegistry = await TestRegistry.deploy();
    await testRegistry.waitForDeployment();

    // Create a sample strategy
    await testRegistry.createStrategy(
      "sample-strategy-1",
      "Sample Test Strategy",
      9500, // 95% pass rate
      5     // 5 tests minimum
    );
  });

  describe("Strategy Creation", function () {
    it("Should create a strategy", async function () {
      const strategy = await testRegistry.strategies("sample-strategy-1");
      expect(strategy.name).to.equal("Sample Test Strategy");
      expect(strategy.minPassRate).to.equal(9500);
      expect(strategy.minTestCount).to.equal(5);
    });

    it("Should reject duplicate strategy IDs", async function () {
      await expect(
        testRegistry.createStrategy(
          "sample-strategy-1",
          "Duplicate",
          9000,
          3
        )
      ).to.be.revertedWith("Strategy ID already exists");
    });
  });

  describe("Test Submission", function () {
    it("Should submit a test execution", async function () {
      const tx = await testRegistry.submitTestExecution(
        "test-1",
        "Test 1",
        true,
        "0x123",
        "sample-strategy-1"
      );
      await tx.wait();

      const test = await testRegistry.testExecutions("test-1");
      expect(test.testName).to.equal("Test 1");
      expect(test.passed).to.equal(true);
      expect(test.submitter).to.equal(owner.address);
    });

    it("Should reject duplicate test IDs", async function () {
      await testRegistry.submitTestExecution(
        "test-1",
        "Test 1",
        true,
        "0x123",
        "sample-strategy-1"
      );

      await expect(
        testRegistry.submitTestExecution(
          "test-1",
          "Test 1",
          true,
          "0x123",
          "sample-strategy-1"
        )
      ).to.be.revertedWith("Test ID already exists");
    });

    it("Should reject submission for non-existent strategy", async function () {
      await expect(
        testRegistry.submitTestExecution(
          "test-1",
          "Test 1",
          true,
          "0x123",
          "non-existent"
        )
      ).to.be.revertedWith("Strategy does not exist");
    });
  });

  describe("Compliance Verification", function () {
    it("Should verify compliance when requirements are met", async function () {
      // Submit 5 passing tests
      for (let i = 1; i <= 5; i++) {
        await testRegistry.submitTestExecution(
          `test-${i}`,
          `Test ${i}`,
          true,
          `0x${i}`,
          "sample-strategy-1"
        );
      }

      const compliance = await testRegistry.getTeamCompliance(
        owner.address,
        "sample-strategy-1"
      );

      expect(compliance.testCount).to.equal(5);
      expect(compliance.passedCount).to.equal(5);
      expect(compliance.passRate).to.equal(10000); // 100%
      expect(compliance.compliant).to.equal(true);
    });

    it("Should not verify compliance when pass rate is too low", async function () {
      // Submit 5 tests, but only 3 pass (60% pass rate, need 95%)
      for (let i = 1; i <= 5; i++) {
        await testRegistry.submitTestExecution(
          `test-${i}`,
          `Test ${i}`,
          i <= 3, // First 3 pass
          `0x${i}`,
          "sample-strategy-1"
        );
      }

      const compliance = await testRegistry.getTeamCompliance(
        owner.address,
        "sample-strategy-1"
      );

      expect(compliance.testCount).to.equal(5);
      expect(compliance.passedCount).to.equal(3);
      expect(compliance.compliant).to.equal(false);
    });

    it("Should not verify compliance when test count is too low", async function () {
      // Submit only 3 tests (need 5)
      for (let i = 1; i <= 3; i++) {
        await testRegistry.submitTestExecution(
          `test-${i}`,
          `Test ${i}`,
          true,
          `0x${i}`,
          "sample-strategy-1"
        );
      }

      const compliance = await testRegistry.getTeamCompliance(
        owner.address,
        "sample-strategy-1"
      );

      expect(compliance.testCount).to.equal(3);
      expect(compliance.compliant).to.equal(false);
    });
  });
});

